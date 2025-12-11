<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Venue;
use App\Models\EventCategory;
use App\Models\User;
use App\Models\Notification;
use App\Events\NewEventCreated;
use Carbon\Carbon;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Event::with(['venue', 'category'])->orderBy('start_time', 'asc');

        if ($request->filled('search')) {
            $search = trim($request->get('search'));
            $query->where('title', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $status = $request->get('status');
            $now = Carbon::now();
            if ($status === 'upcoming') {
                $query->where('start_time', '>', $now);
            } elseif ($status === 'ongoing') {
                $query->where('start_time', '<=', $now)->where('end_time', '>=', $now);
            } elseif ($status === 'past') {
                $query->where('end_time', '<', $now);
            }
        }

        $events = $query->get();
        
        // Automatically update event statuses based on current time
        $now = Carbon::now();
        foreach ($events as $event) {
            // Skip if event is manually cancelled
            if ($event->status === 'cancelled') {
                continue;
            }
            
            $calculatedStatus = $this->calculateEventStatus($event->start_time, $event->end_time, $now);
            
            // Convert to lowercase to match database values
            $calculatedStatus = strtolower($calculatedStatus);
            
            // Map 'past' to 'completed' for database
            if ($calculatedStatus === 'past') {
                $calculatedStatus = 'completed';
            }
            
            // Only update if the calculated status differs from stored status
            if ($event->status !== $calculatedStatus) {
                $event->update(['status' => $calculatedStatus]);
                $event->refresh(); // Refresh to get updated status
            }
        }
        
        return view('admin.events.index', compact('events'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $venues = Venue::all();
        $categories = EventCategory::all();
        $audienceLevels = config('audience.levels');
        $collegeCourses = config('audience.courses.college');

        return view('admin.events.create', compact('venues', 'categories', 'audienceLevels', 'collegeCourses'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Event $event)
    {
        $venues = Venue::all();
        $categories = EventCategory::all();
        $audienceLevels = config('audience.levels');
        $collegeCourses = config('audience.courses.college');

        return view('admin.events.edit', compact('event', 'venues', 'categories', 'audienceLevels', 'collegeCourses'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'venue_id' => 'required|exists:venues,id',
            'category_id' => 'required|exists:event_categories,id',
            'location' => 'required|string|max:255',
            'status' => 'required|in:upcoming,ongoing,completed,cancelled',
            'target_audience' => 'required|in:all_students,elementary,high_school,college,senior_high',
            'course' => 'nullable|required_if:target_audience,college|in:all_college,bsit,bshm,bsentrep,education',
        ]);

        // Normalize course: when 'all_college' is chosen, treat as no specific course
        $normalizedCourse = $request->target_audience === 'college'
            ? ($request->course === 'all_college' ? null : $request->course)
            : null;

        $event = Event::create([
            'title' => $request->title,
            'description' => $request->description,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'venue_id' => $request->venue_id,
            'category_id' => $request->category_id,
            'location' => $request->location,
            'status' => $request->status,
            'target_audience' => $request->target_audience,
            'course' => $normalizedCourse,
            'organizer_id' => auth()->id(), // ensure auth middleware is enabled
        ]);

        // Send targeted notifications for newly created event
        $this->sendTargetedNotifications($event, 'created');

        broadcast(new NewEventCreated($event))->toOthers();

        return redirect()->route('events.index')->with('success', 'Event created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Event $event)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'venue_id' => 'required|exists:venues,id',
            'category_id' => 'required|exists:event_categories,id',
            'location' => 'required|string|max:255',
            'status' => 'required|in:upcoming,ongoing,completed,cancelled',
            'target_audience' => 'required|in:all_students,elementary,high_school,college,senior_high',
            'course' => 'nullable|required_if:target_audience,college|in:all_college,bsit,bshm,bsentrep,education',
        ]);

        $normalizedCourse = $request->target_audience === 'college'
            ? ($request->course === 'all_college' ? null : $request->course)
            : null;

        $event->update([
            'title' => $request->title,
            'description' => $request->description,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'venue_id' => $request->venue_id,
            'category_id' => $request->category_id,
            'location' => $request->location,
            'status' => $request->status,
            'target_audience' => $request->target_audience,
            'course' => $normalizedCourse,
        ]);

        // Refresh the event model to get the latest data
        $event->refresh();

        // Notify users affected by the updated event targeting
        try {
            $this->sendTargetedNotifications($event, 'updated');
            \Log::info("Notification process completed for event update: {$event->id}");
        } catch (\Exception $e) {
            \Log::error("Error sending notifications for event update: " . $e->getMessage());
            \Log::error($e->getTraceAsString());
        }

        return redirect()->route('events.index')->with('success', 'Event updated successfully.');
    }

    /**
     * API: return events as JSON for mobile app
     */
    public function apiIndex(Request $request)
    {
        $eventsQuery = Event::with(['venue', 'category'])->orderBy('start_time', 'asc');

        // Optional: filter events for a specific user (by education level / course)
        if ($request->filled('user_id')) {
            $user = User::find($request->integer('user_id'));
            if ($user) {
                switch ($user->education_level) {
                    case 'Elementary':
                        $eventsQuery->where('target_audience', 'elementary');
                        break;
                    case 'High School':
                        $eventsQuery->where('target_audience', 'high_school');
                        break;
                    case 'Senior High School':
                        $eventsQuery->where('target_audience', 'senior_high');
                        break;
                    case 'College':
                        $dept = $user->department ? strtolower(trim($user->department)) : null;
                        $eventsQuery->where('target_audience', 'college')
                            ->where(function ($q) use ($dept) {
                                $q->whereNull('course');
                                if ($dept) {
                                    $q->orWhereRaw('LOWER(course) = ?', [$dept]);
                                }
                            });
                        break;
                }
                // Always include events targeted to all students
                $eventsQuery->orWhere('target_audience', 'all_students');
            }
        }

        $events = $eventsQuery->get()
            ->map(function ($e) {
                return [
                    'id' => $e->id,
                    'title' => $e->title,
                    'description' => $e->description,
                    'start_time' => $e->start_time,
                    'end_time' => $e->end_time,
                    'location' => $e->venue->name ?? 'N/A',
                    'status' => $e->status,
                    'target_audience' => $e->target_audience,
                    'course' => $e->course,
                    'category' => optional($e->category)->name,
                ];
            });

        return response()->json(['data' => $events]);
    }

    /**
     * Calculate event status based on start and end times
     */
    private function calculateEventStatus($startTime, $endTime, $now = null)
    {
        if ($now === null) {
            $now = Carbon::now();
        }
        
        // Parse times and ensure same timezone
        $start = Carbon::parse($startTime)->setTimezone($now->timezone);
        $end = Carbon::parse($endTime)->setTimezone($now->timezone);
        
        // Use timestamp comparison for accuracy
        $nowTimestamp = $now->timestamp;
        $startTimestamp = $start->timestamp;
        $endTimestamp = $end->timestamp;
        
        if ($nowTimestamp < $startTimestamp) {
            return 'upcoming';
        } elseif ($nowTimestamp >= $startTimestamp && $nowTimestamp <= $endTimestamp) {
            return 'ongoing';
        } else {
            return 'past';
        }
    }

    /**
     * Send targeted notifications to users based on event target_audience/course
     */
    private function sendTargetedNotifications(Event $event, string $action = 'created')
    {
        // Only notify for specific event statuses
        if (!in_array($event->status, ['upcoming', 'ongoing'])) {
            \Log::info("Event notification skipped: Event status is '{$event->status}', not 'upcoming' or 'ongoing'");
            return; // do not create notifications for completed/cancelled or other statuses
        }

        $query = User::query();

        switch ($event->target_audience) {
            case 'all_students':
                // No additional filters; notify all users
                break;
            case 'elementary':
                $query->where('education_level', 'Elementary');
                break;
            case 'high_school':
                $query->where('education_level', 'High School');
                break;
            case 'senior_high':
                $query->where('education_level', 'Senior High School');
                break;
            case 'college':
                $query->where('education_level', 'College');
                if (!empty($event->course) && strtolower($event->course) !== 'all_college') {
                    $query->where('department', strtoupper($event->course));
                }
                break;
        }

        // Ensure we only get unique users by email to avoid duplicates
        $targetUsers = $query->get()->unique('email')->values();

        \Log::info("Sending {$action} notifications for event '{$event->title}' (ID: {$event->id}, Status: {$event->status}, Target: {$event->target_audience}) to " . $targetUsers->count() . " users");

        if ($targetUsers->count() === 0) {
            \Log::warning("No users found matching target audience '{$event->target_audience}' for event {$event->id}");
            return;
        }

        $titlePrefix = $action === 'updated' ? 'Event Updated' : 'New Event';
        $notificationsCreated = 0;

        foreach ($targetUsers as $user) {
            try {
                if ($action === 'updated') {
                    // Delete existing notification and create a new one so it appears as new
                    $deleted = Notification::where('user_id', $user->id)
                        ->where('event_id', $event->id)
                        ->delete();
                    
                    // Create a fresh notification with new timestamp
                    $notification = Notification::create([
                        'user_id' => $user->id,
                        'event_id' => $event->id,
                        'title' => "$titlePrefix: {$event->title}",
                        'message' => $event->description,
                        'is_read' => false, // Mark as unread when event is updated
                    ]);
                    
                    $notificationsCreated++;
                    \Log::info("Created updated notification for user {$user->id} (ID: {$user->id}, Email: {$user->email}) - deleted {$deleted} old notification(s)");
                } else {
                // Avoid duplicate notifications on initial creation
                Notification::firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'event_id' => $event->id,
                    ],
                    [
                        'title' => "$titlePrefix: {$event->title}",
                        'message' => $event->description,
                    ]
                );
                $notificationsCreated++;
            }
            } catch (\Exception $e) {
                \Log::error("Error creating notification for user {$user->id}: " . $e->getMessage());
            }
        }
        
        \Log::info("Total notifications created: {$notificationsCreated} for event {$event->id}");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event)
    {
        try {
            // Delete related notifications first
            Notification::where('event_id', $event->id)->delete();
            
            // Delete the event
            $event->delete();
            
            // Check if this is an API request
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Event deleted successfully.'
                ]);
            }
            
            // For web requests, redirect with success message
            return redirect()->route('events.index')->with('success', 'Event deleted successfully.');
            
        } catch (\Exception $e) {
            // Check if this is an API request
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete event: ' . $e->getMessage()
                ], 500);
            }
            
            // For web requests, redirect with error message
            return redirect()->route('events.index')->with('error', 'Failed to delete event: ' . $e->getMessage());
        }
    }

    /**
     * API: Delete event endpoint for mobile app
     */
    public function apiDestroy(Request $request, $id)
    {
        try {
            $event = Event::findOrFail($id);
            
            // Delete related notifications first
            Notification::where('event_id', $event->id)->delete();
            
            // Delete the event
            $event->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Event deleted successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete event: ' . $e->getMessage()
            ], 500);
        }
    }
}