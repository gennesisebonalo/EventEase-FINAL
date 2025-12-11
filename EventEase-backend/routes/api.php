<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\AttendanceController;
use App\Models\EventCategory;
use App\Models\Venue;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::put('/profile', [AuthController::class, 'updateProfile']);

// Health check for mobile app connectivity tests
Route::get('/health', function() {
    return response()->json([
        'status' => 'ok',
        'time' => now(),
    ]);
});

// Public events listing for mobile app
Route::get('/events', [EventController::class, 'apiIndex']);

// Categories API
Route::get('/categories', function() {
    $categories = EventCategory::select('id', 'name')->get();
    return response()->json(['data' => $categories]);
});

// Venues API
Route::get('/venues', function() {
    $venues = Venue::select('id', 'name', 'capacity', 'address')->get();
    return response()->json(['data' => $venues]);
});

// Notifications API (optionally filter by user_id) - only for upcoming/ongoing events
Route::get('/notifications', function(Request $request) {
    try {
        $query = \App\Models\Notification::with(['event', 'user'])
            ->whereHas('event', function($q) {
                $q->whereIn('status', ['upcoming', 'ongoing']);
            })
            ->orderBy('created_at', 'desc');

        if ($request->filled('user_id')) {
            $userId = $request->integer('user_id');
            $query->where('user_id', $userId);
            
            // Get event IDs where user has already tapped their ID (status = 'present')
            // Don't filter out 'pending' status - events should stay visible until user taps ID
            $tappedEventIds = \App\Models\Attendee::where('user_id', $userId)
                ->where('status', 'present') // Only filter out events where user has tapped (not just joined)
                ->pluck('event_id')
                ->toArray();
            
            // Exclude notifications for events where user has already tapped their ID
            // BUT: Always show "Event Updated" notifications even if user has tapped (they need to know about updates)
            if (!empty($tappedEventIds)) {
                // Show all notifications EXCEPT those that are for tapped events AND are NOT update notifications
                // This means: show non-tapped events OR any notification with "Event Updated:" title
                $query->where(function($q) use ($tappedEventIds) {
                    $q->whereNotIn('event_id', $tappedEventIds)
                      ->orWhere('title', 'like', 'Event Updated:%');
                });
                
                \Log::info("Notifications API: User {$userId} has tapped events: " . implode(', ', $tappedEventIds) . ". Showing non-tapped events + all update notifications.");
            }
        }

        $notifications = $query->get();
        \Log::info("Notifications API: Returning " . $notifications->count() . " notifications for user " . ($request->filled('user_id') ? $request->integer('user_id') : 'all'));
        
        // Log each notification for debugging
        foreach ($notifications as $n) {
            \Log::info("Notification ID {$n->id}: '{$n->title}' for event {$n->event_id}");
        }
        
        $mapped = $notifications->map(function($n) {
            return [
                'id' => $n->id,
                'title' => $n->title,
                'message' => $n->message,
                'is_read' => $n->is_read,
                'created_at' => $n->created_at,
                'event' => [
                    'id' => optional($n->event)->id,
                    'title' => optional($n->event)->title,
                    'start_time' => optional($n->event)->start_time,
                    'end_time' => optional($n->event)->end_time,
                    'status' => optional($n->event)->status,
                ]
            ];
        });
        return response()->json(['data' => $mapped]);
    } catch (\Exception $e) {
        \Log::error("Notifications API Error: " . $e->getMessage());
        \Log::error($e->getTraceAsString());
        return response()->json([
            'error' => 'Failed to fetch notifications',
            'message' => $e->getMessage()
        ], 500);
    }
});

// Users API
Route::get('/users', function(Request $request) {
    $users = \App\Models\User::select('id', 'name', 'email', 'education_level', 'year_level', 'block', 'department', 'printed_id', 'rfid_card_id')
        ->orderBy('created_at', 'desc')
        ->get();
    
    return response()->json([
        'success' => true,
        'data' => $users
    ]);
});

Route::post('/users/{id}/link-rfid', function(Request $request, $id) {
    try {
        $user = \App\Models\User::findOrFail($id);
        
        $request->validate([
            'rfid_card_id' => 'required|string|max:255|unique:users,rfid_card_id,' . $id . ',id',
            'printed_id' => 'nullable|string|max:255|unique:users,printed_id,' . $id . ',id',
        ]);
        
        $user->update([
            'rfid_card_id' => $request->rfid_card_id,
            'printed_id' => $request->printed_id ?? $user->printed_id,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'RFID chip ID linked successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'rfid_card_id' => $user->rfid_card_id,
                'printed_id' => $user->printed_id,
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to link RFID: ' . $e->getMessage()
        ], 500);
    }
});

Route::delete('/users/{id}', function(Request $request, $id) {
    try {
        $user = \App\Models\User::findOrFail($id);
        
        // Handle events where user is organizer (reassign to first available user before deletion)
        $firstUser = \App\Models\User::where('id', '!=', $id)->first();
        if ($firstUser) {
            \App\Models\Event::where('organizer_id', $id)->update(['organizer_id' => $firstUser->id]);
        }
        
        // Delete related data
        \App\Models\Attendee::where('user_id', $id)->delete();
        \App\Models\Notification::where('user_id', $id)->delete();
        
        // Delete the user
        $user->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete user: ' . $e->getMessage()
        ], 500);
    }
});

// Attendance API routes
Route::post('/attendance/join', [AttendanceController::class, 'joinEvent']);
Route::post('/attendance/decline', [AttendanceController::class, 'declineEvent']);
Route::post('/attendance/rfid-complete', [AttendanceController::class, 'completeRFIDTapping']);
Route::post('/attendance/rfid-complete-by-card', [AttendanceController::class, 'completeRFIDTappingByCard']);
Route::get('/attendance/user-history', [AttendanceController::class, 'getUserAttendance']);
Route::get('/attendance/event/{eventId}', [AttendanceController::class, 'getEventAttendance']);
