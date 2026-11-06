<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['invitation_id', 'name', 'email', 'phone', 'attendance', 'guests', 'message', 'ip_address'])]
class Rsvp extends Model
{
    protected function casts(): array
    {
        return [
            'guests' => 'integer',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }
}
