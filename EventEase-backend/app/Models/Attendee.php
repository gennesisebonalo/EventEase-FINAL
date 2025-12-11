<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendee extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_id',
        'status',
        'reason',
        'evidence_image',
        'checked_in_at',
        'declined_at'
    ];

    protected $casts = [
        'checked_in_at' => 'datetime',
        'declined_at' => 'datetime',
    ];

    // Define the relationship with the Event model
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    // Define the relationship with the User model
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
