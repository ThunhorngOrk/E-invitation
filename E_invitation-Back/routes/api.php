<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InvitationController;
use App\Http\Controllers\Api\PhotoController;
use App\Http\Controllers\Api\RsvpController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok']));

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
});

Route::get('/invitations/{slug}', [InvitationController::class, 'show']);
Route::post('/invitations/{slug}/rsvps', [RsvpController::class, 'store'])->middleware('throttle:30,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/me', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/invitations', [InvitationController::class, 'index']);
    Route::post('/invitations', [InvitationController::class, 'store']);
    Route::match(['put', 'patch'], '/invitations/{invitation}', [InvitationController::class, 'update']);
    Route::delete('/invitations/{invitation}', [InvitationController::class, 'destroy']);
    Route::post('/invitations/{invitation}/publish', [InvitationController::class, 'publish']);
    Route::post('/invitations/{invitation}/unpublish', [InvitationController::class, 'unpublish']);

    Route::get('/invitations/{invitation}/rsvps', [RsvpController::class, 'index']);
    Route::delete('/invitations/{invitation}/rsvps/{rsvp}', [RsvpController::class, 'destroy']);

    Route::post('/invitations/{invitation}/photos', [PhotoController::class, 'store']);
    Route::delete('/invitations/{invitation}/photos/{photo}', [PhotoController::class, 'destroy']);
});
