<?php

namespace Tests\Feature;

use App\Models\Invitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InvitationTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_create_publish_and_update_invitation(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/invitations', [
            'title' => 'Test Wedding',
            'status' => 'published',
            'content' => [
                'groom' => ['nameEn' => 'Thol Sophiti'],
                'bride' => ['nameEn' => 'Long Manin'],
            ],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.slug', 'thol-sophiti-long-manin')
            ->assertJsonPath('data.status', 'published');

        $slug = $response->json('data.slug');

        $this->putJson("/api/invitations/{$slug}", [
            'title' => 'Updated Wedding',
            'content' => ['groom' => ['nameEn' => 'Thol Sophiti']],
        ])->assertOk()->assertJsonPath('data.title', 'Updated Wedding');

        $this->assertDatabaseHas('invitations', [
            'slug' => $slug,
            'title' => 'Updated Wedding',
        ]);
    }

    public function test_guest_can_view_published_invitation(): void
    {
        $invitation = $this->createInvitation(['status' => 'published']);

        $this->getJson("/api/invitations/{$invitation->slug}")
            ->assertOk()
            ->assertJsonPath('data.slug', $invitation->slug)
            ->assertJsonPath('data.content.groom.nameEn', 'Thol Sophiti');
    }

    public function test_guest_cannot_view_draft_invitation(): void
    {
        $invitation = $this->createInvitation(['status' => 'draft']);

        $this->getJson("/api/invitations/{$invitation->slug}")->assertNotFound();
    }

    public function test_guest_can_submit_rsvp_and_owner_can_list_responses(): void
    {
        $invitation = $this->createInvitation(['status' => 'published']);

        $this->postJson("/api/invitations/{$invitation->slug}/rsvps", [
            'name' => 'Guest One',
            'attendance' => 'yes',
            'guests' => 2,
            'message' => 'Congratulations!',
        ])->assertCreated()->assertJsonPath('data.name', 'Guest One');

        Sanctum::actingAs($invitation->user);

        $this->getJson("/api/invitations/{$invitation->slug}/rsvps")
            ->assertOk()
            ->assertJsonPath('meta.total_responses', 1)
            ->assertJsonPath('meta.attending', 1)
            ->assertJsonPath('meta.total_guests', 2);
    }

    public function test_owner_can_upload_and_delete_photo(): void
    {
        $invitation = $this->createInvitation(['status' => 'published']);
        Sanctum::actingAs($invitation->user);

        Storage::fake('public');

        $response = $this->postJson("/api/invitations/{$invitation->slug}/photos", [
            'photo' => UploadedFile::fake()->image('photo.jpg'),
            'caption' => 'Our memory',
        ]);

        $response->assertCreated()->assertJsonPath('data.caption', 'Our memory');

        $photoId = $response->json('data.id');

        $this->deleteJson("/api/invitations/{$invitation->slug}/photos/{$photoId}")
            ->assertNoContent();
    }

    private function createInvitation(array $attributes = []): Invitation
    {
        $user = User::factory()->create();

        return Invitation::create(array_merge([
            'user_id' => $user->id,
            'title' => 'Test Wedding',
            'slug' => 'test-wedding',
            'status' => 'published',
            'content' => [
                'groom' => ['nameEn' => 'Thol Sophiti'],
                'bride' => ['nameEn' => 'Long Manin'],
            ],
            'published_at' => now(),
        ], $attributes));
    }
}
