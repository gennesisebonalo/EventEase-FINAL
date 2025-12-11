<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Attendee;

class DashboardController extends Controller
{
    public function index()
    {
        $events = Event::with(['venue', 'category'])
            ->withCount('attendees')
            ->get();
            
        return view('admin.dashboard', compact('events'));
    }

    public function notifications()
    {
        return view('admin.notifications');
    }

    public function calendar()
    {
        $events = \App\Models\Event::all();
        return view('admin.calendar', compact('events'));
    }
}
