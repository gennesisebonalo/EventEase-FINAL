<?php

namespace App\Http\Controllers;

use App\Models\Attendee;
use App\Models\Event;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class AttendeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Attendee::with(['user', 'event.venue']);

        // Filter by event
        if ($request->filled('event_id')) {
            $query->where('event_id', $request->event_id);
        }

        // Filter by education level
        if ($request->filled('education_level')) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('education_level', $request->education_level);
            });
        }

        // Filter by year level (handle both "1st" and "1st Year" formats, and N/A for null/empty)
        if ($request->filled('year_level')) {
            $yearLevel = $request->year_level;
            if ($yearLevel === 'N/A') {
                $query->whereHas('user', function($q) {
                    $q->whereNull('year_level')
                      ->orWhere('year_level', '')
                      ->orWhere('year_level', 'N/A');
                });
            } else {
                $query->whereHas('user', function($q) use ($yearLevel) {
                    $q->where(function($subQ) use ($yearLevel) {
                        $subQ->where('year_level', $yearLevel)
                             ->orWhere('year_level', $yearLevel . ' Year');
                    });
                });
            }
        }

        // Filter by block (handle N/A for null/empty)
        if ($request->filled('block')) {
            $block = $request->block;
            if ($block === 'N/A') {
                $query->whereHas('user', function($q) {
                    $q->whereNull('block')
                      ->orWhere('block', '')
                      ->orWhere('block', 'N/A');
                });
            } else {
                $query->whereHas('user', function($q) use ($block) {
                    $q->where('block', $block);
                });
            }
        }

        $attendees = $query->latest()->get();

        // Get filter options for dropdowns
        $events = Event::orderBy('title')->get();
        $educationLevels = \App\Models\User::distinct()->whereNotNull('education_level')->pluck('education_level')->sort()->values();
        
        // Predefined year levels: 1st to 5th, plus N/A
        $yearLevels = collect(['1st', '2nd', '3rd', '4th', '5th', 'N/A']);
        
        // Predefined blocks: A to G, plus N/A
        $blocks = collect(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'N/A']);

        return view('attendees.index', compact('attendees', 'events', 'educationLevels', 'yearLevels', 'blocks'));
    }

    public function exportPdf(Request $request)
    {
        $query = Attendee::with(['user', 'event.venue']);

        // Apply the same filters as index method
        if ($request->filled('event_id')) {
            $query->where('event_id', $request->event_id);
        }

        if ($request->filled('education_level')) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('education_level', $request->education_level);
            });
        }

        if ($request->filled('year_level')) {
            $yearLevel = $request->year_level;
            if ($yearLevel === 'N/A') {
                $query->whereHas('user', function($q) {
                    $q->whereNull('year_level')
                      ->orWhere('year_level', '')
                      ->orWhere('year_level', 'N/A');
                });
            } else {
                $query->whereHas('user', function($q) use ($yearLevel) {
                    $q->where(function($subQ) use ($yearLevel) {
                        $subQ->where('year_level', $yearLevel)
                             ->orWhere('year_level', $yearLevel . ' Year');
                    });
                });
            }
        }

        if ($request->filled('block')) {
            $block = $request->block;
            if ($block === 'N/A') {
                $query->whereHas('user', function($q) {
                    $q->whereNull('block')
                      ->orWhere('block', '')
                      ->orWhere('block', 'N/A');
                });
            } else {
                $query->whereHas('user', function($q) use ($block) {
                    $q->where('block', $block);
                });
            }
        }

        $attendees = $query->latest()->get();
        
        // Build filter description
        $filters = [];
        if ($request->filled('event_id')) {
            $event = Event::find($request->event_id);
            $filters[] = 'Event: ' . ($event ? $event->title : 'N/A');
        }
        if ($request->filled('education_level')) {
            $filters[] = 'Education Level: ' . $request->education_level;
        }
        if ($request->filled('year_level')) {
            $filters[] = 'Year Level: ' . $request->year_level;
        }
        if ($request->filled('block')) {
            $filters[] = 'Block: ' . $request->block;
        }
        $filterDescription = !empty($filters) ? implode(', ', $filters) : 'All Attendees';

        $pdf = Pdf::loadView('attendees.pdf', compact('attendees', 'filterDescription'));
        
        $filename = 'attendees_' . date('Y-m-d_His') . '.pdf';
        
        // Use stream to open in browser (user can then download from browser)
        // This works better with HTTP connections
        return response($pdf->output(), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="' . $filename . '"')
            ->header('Cache-Control', 'private, max-age=0, must-revalidate')
            ->header('Pragma', 'public');
    }
}
