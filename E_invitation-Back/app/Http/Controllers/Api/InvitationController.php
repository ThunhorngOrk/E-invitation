<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInvitationRequest;
use App\Http\Requests\UpdateInvitationRequest;
use App\Http\Resources\InvitationResource;
use App\Models\Invitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class InvitationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $invitations = $request->user()
            ->invitations()
            ->with('photos')
            ->withCount('rsvps')
            ->latest()
            ->get();

        return InvitationResource::collection($invitations);
    }

    public function store(StoreInvitationRequest $request): JsonResponse
    {
        $data = $request->validated();
        $status = $data['status'] ?? 'draft';

        $invitation = $request->user()->invitations()->create([
            'title' => $data['title'],
            'slug' => $this->uniqueSlug($data['slug'] ?? null, $data['content']),
            'status' => $status,
            'content' => $data['content'],
            'published_at' => $status === 'published' ? now() : null,
        ]);

        $invitation->load('photos');

        return (new InvitationResource($invitation))->response()->setStatusCode(201);
    }

    public function show(Request $request, string $slug): InvitationResource
    {
        $invitation = Invitation::with('photos')->where('slug', $slug)->firstOrFail();
        $user = $request->user('sanctum');

        abort_if(
            ! $invitation->isPublished() && $invitation->user_id !== $user?->id,
            404,
        );

        return new InvitationResource($invitation);
    }

    public function update(UpdateInvitationRequest $request, Invitation $invitation): InvitationResource
    {
        $this->ensureOwner($request, $invitation);
        $data = $request->validated();

        if (array_key_exists('slug', $data) && $data['slug'] !== $invitation->slug) {
            $data['slug'] = $this->uniqueSlug($data['slug'], $data['content'] ?? $invitation->content, $invitation->id);
        }

        if (array_key_exists('status', $data)) {
            if ($data['status'] === 'published' && $invitation->published_at === null) {
                $data['published_at'] = now();
            }

            if ($data['status'] === 'draft') {
                $data['published_at'] = null;
            }
        }

        $invitation->fill($data)->save();
        $invitation->load('photos');

        return new InvitationResource($invitation->refresh());
    }

    public function destroy(Request $request, Invitation $invitation): Response
    {
        $this->ensureOwner($request, $invitation);

        $invitation->photos->each(function ($photo) {
            Storage::disk('public')->delete($photo->path);
        });

        $invitation->delete();

        return response()->noContent();
    }

    public function publish(Request $request, Invitation $invitation): InvitationResource
    {
        return $this->setStatus($request, $invitation, 'published');
    }

    public function unpublish(Request $request, Invitation $invitation): InvitationResource
    {
        return $this->setStatus($request, $invitation, 'draft');
    }

    private function setStatus(Request $request, Invitation $invitation, string $status): InvitationResource
    {
        $this->ensureOwner($request, $invitation);

        $invitation->forceFill([
            'status' => $status,
            'published_at' => $status === 'published' ? now() : null,
        ])->save();

        $invitation->load('photos');

        return new InvitationResource($invitation);
    }

    private function ensureOwner(Request $request, Invitation $invitation): void
    {
        abort_unless(
            $request->user() !== null && $invitation->user_id === $request->user()->id,
            403,
            'You do not own this invitation.',
        );
    }

    /**
     * @param  array<string, mixed>  $content
     */
    private function uniqueSlug(?string $requested, array $content, ?int $ignoreId = null): string
    {
        $base = Str::slug((string) $requested);

        if ($base === '') {
            $base = Str::slug(trim(
                ($content['groom']['nameEn'] ?? '').' '.($content['bride']['nameEn'] ?? ''),
            ));
        }

        if ($base === '') {
            $base = 'invitation';
        }

        $slug = $base;
        $suffix = 2;

        while ($this->slugExists($slug, $ignoreId)) {
            $slug = $base.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }

    private function slugExists(string $slug, ?int $ignoreId): bool
    {
        return Invitation::query()
            ->where('slug', $slug)
            ->when($ignoreId !== null, fn ($query) => $query->whereKeyNot($ignoreId))
            ->exists();
    }
}
