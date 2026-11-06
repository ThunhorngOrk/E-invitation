<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRsvpRequest;
use App\Http\Resources\RsvpResource;
use App\Models\Invitation;
use App\Models\Rsvp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RsvpController extends Controller
{
    public function index(Request $request, Invitation $invitation): JsonResponse
    {
        $this->ensureOwner($request, $invitation);

        $rsvps = $invitation->rsvps()->latest()->get();

        return response()->json([
            'data' => RsvpResource::collection($rsvps),
            'meta' => [
                'total_responses' => $rsvps->count(),
                'attending' => $rsvps->where('attendance', 'yes')->count(),
                'declined' => $rsvps->where('attendance', 'no')->count(),
                'total_guests' => $rsvps->where('attendance', 'yes')->sum('guests'),
            ],
        ]);
    }

    public function store(StoreRsvpRequest $request, string $slug): JsonResponse
    {
        $invitation = Invitation::where('slug', $slug)->firstOrFail();

        abort_unless($invitation->isPublished(), 404);

        $data = $request->validated();

        $rsvp = $invitation->rsvps()->create([
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'attendance' => $data['attendance'],
            'guests' => $data['guests'] ?? 1,
            'message' => $data['message'] ?? null,
            'ip_address' => $request->ip(),
        ]);

        return (new RsvpResource($rsvp))->response()->setStatusCode(201);
    }

    public function destroy(Request $request, Invitation $invitation, Rsvp $rsvp): Response
    {
        $this->ensureOwner($request, $invitation);

        abort_unless($rsvp->invitation_id === $invitation->id, 404);

        $rsvp->delete();

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
