<?php

// app/Models/Event.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Venue;
use App\Models\EventCategory;
use App\Models\User;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'start_time',
        'end_time',
        'venue_id',
        'category_id',
        'organizer_id',
        'status',
        'location',
        'invitation_type',
        'target_audience',
        'course',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function venue()
    {
        return $this->belongsTo(Venue::class);
    }

    public function category()
    {
        return $this->belongsTo(EventCategory::class, 'category_id');
    }

    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function attendees()
    {
        return $this->hasMany(Attendee::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
