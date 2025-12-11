<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attendee;
use App\Models\Event;
use App\Models\User;

class AttendanceController extends Controller
{
    /**
     * Display attendance list for all events
     */
    public function index()
    {
        $events = Event::with(['venue', 'category'])
            ->withCount('attendees')
            ->orderBy('start_time', 'desc')
            ->get();

        return view('admin.attendance.index', compact('events'));
    }

    /**
     * Display attendance details for a specific event
     */
    public function show($eventId)
    {
        $event = Event::with(['venue', 'category'])->findOrFail($eventId);
        
        $attendance = Attendee::with(['user'])
            ->where('event_id', $eventId)
            ->orderBy('created_at', 'desc')
            ->get();

        $summary = [
            'total' => $attendance->count(),
            'present' => $attendance->where('status', 'present')->count(),
            'absent' => $attendance->where('status', 'absent')->count(),
            'pending' => $attendance->where('status', 'pending')->count(),
        ];

        return view('admin.attendance.show', compact('event', 'attendance', 'summary'));
    }

    /**
     * Export attendance data for an event
     */
    public function export($eventId)
    {
        $event = Event::with(['venue'])->findOrFail($eventId);
        
        $attendance = Attendee::with(['user'])
            ->where('event_id', $eventId)
            ->orderBy('created_at', 'desc')
            ->get();

        $csvData = [];
        $csvData[] = ['Name', 'Email', 'Student ID', 'Status', 'Reason', 'Checked In At', 'Declined At'];

        foreach ($attendance as $record) {
            $csvData[] = [
                $record->user->name,
                $record->user->email,
                $record->user->student_id ?? 'N/A',
                ucfirst($record->status),
                $record->reason ?? '',
                $record->checked_in_at ? $record->checked_in_at->format('Y-m-d H:i:s') : '',
                $record->declined_at ? $record->declined_at->format('Y-m-d H:i:s') : '',
            ];
        }

        $filename = 'attendance_' . $event->title . '_' . date('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($csvData) {
            $file = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}