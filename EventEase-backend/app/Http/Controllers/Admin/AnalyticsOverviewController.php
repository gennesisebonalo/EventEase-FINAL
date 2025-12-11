<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Attendee;
use Carbon\Carbon;

class AnalyticsOverviewController extends Controller
{
    public function index()
    {
        // Get all events with their analytics
        $events = Event::with(['venue', 'category'])
            ->withCount(['attendees', 'attendees as checked_in_count' => function($query) {
                $query->whereNotNull('checked_in_at');
            }])
            ->orderBy('start_time', 'desc')
            ->get()
            ->map(function($event) {
                $event->attendance_rate = $event->attendees_count > 0 
                    ? round(($event->checked_in_count / $event->attendees_count) * 100, 2)
                    : 0;
                
                // Get check-ins by hour for the event
                $checkInsByHour = [];
                for ($i = 0; $i < 24; $i++) {
                    $hour = str_pad($i, 2, '0', STR_PAD_LEFT) . ':00';
                    $checkInsByHour[$hour] = $event->attendees()
                        ->whereTime('checked_in_at', '>=', $hour . ':00')
                        ->whereTime('checked_in_at', '<', ($i + 1) . ':00:00')
                        ->count();
                }
                
                $event->check_ins_by_hour = $checkInsByHour;
                
                // Get attendees with user details including year and block
                $event->attendees_list = $event->attendees()
                    ->with(['user' => function($query) {
                        $query->select('id', 'name', 'email', 'year_level', 'block');
                    }])
                    ->whereNotNull('checked_in_at')
                    ->get()
                    ->map(function($attendee) {
                        return [
                            'name' => $attendee->user->name,
                            'email' => $attendee->user->email,
                            'year_level' => $attendee->user->year_level,
                            'block' => $attendee->user->block,
                            'checked_in_at' => $attendee->checked_in_at,
                        ];
                    });
                
                return $event;
            });

        return view('admin.analytics.overview', [
            'events' => $events,
            'totalEvents' => $events->count(),
            'totalAttendees' => $events->sum('attendees_count'),
            'totalCheckedIn' => $events->sum('checked_in_count'),
            'averageAttendanceRate' => $events->avg('attendance_rate') ?? 0,
        ]);
    }
}
