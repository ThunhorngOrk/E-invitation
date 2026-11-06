<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePhotoRequest;
use App\Http\Resources\InvitationPhotoResource;
use App\Models\Invitation;
use App\Models\InvitationPhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class PhotoController extends Controller
{
    public function store(StorePhotoRequest $request, Invitation $invitation): JsonResponse
    {
        $this->ensureOwner($request, $invitation);

        $file = $request->file('photo');
        $path = $file->store("invitations/{$invitation->id}", 'public');

        $photo = $invitation->photos()->create([
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'caption' => $request->validated('caption'),
            'sort_order' => $request->validated('sort_order') ?? (int) $invitation->photos()->max('sort_order') + 1,
        ]);

        return (new InvitationPhotoResource($photo))->response()->setStatusCode(201);
    }

    public function destroy(Request $request, Invitation $invitation, InvitationPhoto $photo): Response
    {
        $this->ensureOwner($request, $invitation);

        abort_unless($photo->invitation_id === $invitation->id, 404);

        Storage::disk('public')->delete($photo->path);
        $photo->delete();

        return response()->noContent();
    }

    private function ensureOwner(Request $request, Invitation $invitation): void
    {
        abort_unless(
            $request->user() !== null && $invitation->user_id === $request->user()->id,
            403,
            'You do not own this invitation.',
        );
    }
}
