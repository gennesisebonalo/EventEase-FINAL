<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendee;
use App\Models\Event;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AttendanceController extends Controller
{
    /**
     * Join an event (user wants to attend)
     */
    public function joinEvent(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'event_id' => 'required|exists:events,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get the event details
            $event = Event::findOrFail($request->event_id);
            $now = now();

            // Allow early join for analytics: upcoming or ongoing are allowed; ended is blocked
            if ($now > $event->end_time) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event has already ended. Attendance was available until ' . $event->end_time->format('M d, Y H:i')
                ], 400);
            }

            // Upsert attendance: immediately mark as present for analytics
            $existingAttendance = Attendee::where('user_id', $request->user_id)
                ->where('event_id', $request->event_id)
                ->first();

            if ($existingAttendance) {
                if ($existingAttendance->status !== 'present') {
                    $existingAttendance->update([
                        'status' => 'present',
                        'checked_in_at' => now(),
                        'reason' => null,
                    ]);
                }
                $attendance = $existingAttendance->fresh();
            } else {
                $attendance = Attendee::create([
                    'user_id' => $request->user_id,
                    'event_id' => $request->event_id,
                    'status' => 'present',
                    'checked_in_at' => now(),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'You have been marked present for this event.',
                'data' => [
                    'attendance_id' => $attendance->id,
                    'status' => $attendance->status
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to join event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Decline an event with reason
     */
    public function declineEvent(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'event_id' => 'required|exists:events,id',
                'reason' => 'required|string|max:1000',
                'evidence_image' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get the event details
            $event = Event::findOrFail($request->event_id);
            $now = now();

            // Check if current time is within event time range
            if ($now < $event->start_time) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event has not started yet. Attendance will be available from ' . $event->start_time->format('M d, Y H:i')
                ], 400);
            }

            if ($now > $event->end_time) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event has already ended. Attendance was available until ' . $event->end_time->format('M d, Y H:i')
                ], 400);
            }

            // Check if user already has attendance record for this event
            $existingAttendance = Attendee::where('user_id', $request->user_id)
                ->where('event_id', $request->event_id)
                ->first();

            if ($existingAttendance) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already responded to this event'
                ], 400);
            }

            // Create attendance record with absent status
            $attendance = Attendee::create([
                'user_id' => $request->user_id,
                'event_id' => $request->event_id,
                'status' => 'absent',
                'reason' => $request->reason,
                'evidence_image' => $request->evidence_image,
                'declined_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Your decline has been recorded.',
                'data' => [
                    'attendance_id' => $attendance->id,
                    'status' => $attendance->status
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to decline event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Complete RFID tapping and mark as present
     */
    public function completeRFIDTapping(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'event_id' => 'required|exists:events,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get the event details
            $event = Event::findOrFail($request->event_id);
            $now = now();

            // Allow early RFID tapping (before start) but block after event end
            if ($now > $event->end_time) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event has already ended. RFID tapping was available until ' . $event->end_time->format('M d, Y H:i')
                ], 400);
            }

            // Find the attendance record
            $attendance = Attendee::where('user_id', $request->user_id)
                ->where('event_id', $request->event_id)
                ->where('status', 'pending')
                ->first();

            if (!$attendance) {
                return response()->json([
                    'success' => false,
                    'message' => 'No pending attendance found for this event'
                ], 404);
            }

            // Update attendance to present
            $attendance->update([
                'status' => 'present',
                'checked_in_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Successfully checked in to the event!',
                'data' => [
                    'attendance_id' => $attendance->id,
                    'status' => $attendance->status,
                    'checked_in_at' => $attendance->checked_in_at
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete RFID tapping: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Complete RFID tapping using RFID card ID
     * This endpoint is called when a physical RFID card is tapped
     */
    public function completeRFIDTappingByCard(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'rfid_card_id' => 'required|string',
                'event_id' => 'required|exists:events,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Find user by RFID chip ID (the actual chip ID from the reader, e.g., bbcc1199ff116622)
            $user = \App\Models\User::where('rfid_card_id', $request->rfid_card_id)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'RFID card not registered. Please register your card chip ID first.'
                ], 404);
            }

            // Use printed_id for recognition/display if available, otherwise use chip ID
            $displayId = $user->printed_id ?? $user->rfid_card_id;

            // Get the event details
            $event = Event::findOrFail($request->event_id);
            $now = now();

            // Allow early RFID tapping (before start) but block after event end
            if ($now > $event->end_time) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event has already ended. RFID tapping was available until ' . $event->end_time->format('M d, Y H:i')
                ], 400);
            }

            // Find the attendance record - check for pending first, but also allow updating existing records
            $attendance = Attendee::where('user_id', $user->id)
                ->where('event_id', $request->event_id)
                ->first();

            // If no attendance record exists, create one (user tapped ID without joining first)
            if (!$attendance) {
                $attendance = Attendee::create([
                    'user_id' => $user->id,
                    'event_id' => $request->event_id,
                    'status' => 'present',
                    'checked_in_at' => now(),
                ]);
            } elseif ($attendance->status === 'pending') {
                // Update pending attendance to present
                $attendance->update([
                    'status' => 'present',
                    'checked_in_at' => now(),
                ]);
            } elseif ($attendance->status === 'present') {
                // Already checked in - return success but don't update again
                return response()->json([
                    'success' => true,
                    'message' => 'Already checked in to this event!',
                    'data' => [
                        'user_id' => $user->id,
                        'user_name' => $user->name,
                        'printed_id' => $displayId,
                        'attendance_id' => $attendance->id,
                        'status' => $attendance->status,
                        'checked_in_at' => $attendance->checked_in_at
                    ]
                ]);
            } else {
                // For any other status (e.g., 'absent'), update to present
                $attendance->update([
                    'status' => 'present',
                    'checked_in_at' => now(),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Successfully checked in to the event!',
                'data' => [
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'printed_id' => $displayId,
                    'attendance_id' => $attendance->id,
                    'status' => $attendance->status,
                    'checked_in_at' => $attendance->checked_in_at
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete RFID tapping: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's attendance history
     */
    public function getUserAttendance(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $attendance = Attendee::with(['event.venue', 'event.category'])
                ->where('user_id', $request->user_id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($attendance) {
                    return [
                        'id' => $attendance->id,
                        'event' => [
                            'id' => $attendance->event->id,
                            'title' => $attendance->event->title,
                            'venue' => $attendance->event->venue->name ?? 'N/A',
                            'start_time' => $attendance->event->start_time,
                            'end_time' => $attendance->event->end_time,
                        ],
                        'status' => $attendance->status,
                        'reason' => $attendance->reason,
                        'checked_in_at' => $attendance->checked_in_at,
                        'declined_at' => $attendance->declined_at,
                        'created_at' => $attendance->created_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $attendance
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch attendance history: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get event attendance list for admin
     */
    public function getEventAttendance(Request $request, $eventId)
    {
        try {
            $event = Event::with(['venue', 'category'])->findOrFail($eventId);

            $attendance = Attendee::with(['user'])
                ->where('event_id', $eventId)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($attendance) {
                    return [
                        'id' => $attendance->id,
                        'user' => [
                            'id' => $attendance->user->id,
                            'name' => $attendance->user->name,
                            'email' => $attendance->user->email,
                            'student_id' => $attendance->user->student_id ?? 'N/A',
                        ],
                        'status' => $attendance->status,
                        'reason' => $attendance->reason,
                        'checked_in_at' => $attendance->checked_in_at,
                        'declined_at' => $attendance->declined_at,
                        'created_at' => $attendance->created_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'event' => [
                        'id' => $event->id,
                        'title' => $event->title,
                        'venue' => $event->venue->name ?? 'N/A',
                        'start_time' => $event->start_time,
                        'end_time' => $event->end_time,
                    ],
                    'attendance' => $attendance,
                    'summary' => [
                        'total' => $attendance->count(),
                        'present' => $attendance->where('status', 'present')->count(),
                        'absent' => $attendance->where('status', 'absent')->count(),
                        'pending' => $attendance->where('status', 'pending')->count(),
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch event attendance: ' . $e->getMessage()
            ], 500);
        }
    }
}