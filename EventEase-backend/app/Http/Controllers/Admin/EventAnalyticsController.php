<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Attendee;
use Illuminate\Http\Request;
use Carbon\Carbon;

class EventAnalyticsController extends Controller
{
    public function show(Event $event)
    {
        // Get total attendees count
        $totalAttendees = $event->attendees()->count();
        
        // Get checked-in attendees count
        $checkedInAttendees = $event->attendees()
            ->whereNotNull('checked_in_at')
            ->count();
            
        // Calculate attendance rate
        $attendanceRate = $totalAttendees > 0 
            ? round(($checkedInAttendees / $totalAttendees) * 100, 2) 
            : 0;
            
        // Get attendees by educational level
        $attendeesByLevel = $event->attendees()
            ->with('user')
            ->get()
            ->groupBy('user.educational_level')
            ->map->count();
            
        // Get check-ins by hour
        $checkInsByHour = [];
        for ($i = 0; $i < 24; $i++) {
            $hour = str_pad($i, 2, '0', STR_PAD_LEFT) . ':00';
            $checkInsByHour[$hour] = $event->attendees()
                ->whereTime('checked_in_at', '>=', $hour . ':00')
                ->whereTime('checked_in_at', '<', ($i + 1) . ':00:00')
                ->count();
        }

        return view('admin.events.analytics', [
            'event' => $event->load('venue', 'category'),
            'totalAttendees' => $totalAttendees,
            'checkedInAttendees' => $checkedInAttendees,
            'attendanceRate' => $attendanceRate,
            'attendeesByLevel' => $attendeesByLevel,
            'checkInsByHour' => $checkInsByHour,
        ]);
    }
}
