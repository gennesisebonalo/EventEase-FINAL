<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\AttendanceController as AdminAttendanceController;
use App\Http\Controllers\AttendeeController;
use App\Http\Controllers\AnalyticsController;

// Analytics routes
Route::get('/analytics', [\App\Http\Controllers\Admin\AnalyticsOverviewController::class, 'index'])->name('analytics.index');

// API routes for mobile app
Route::get('/api/events', [EventController::class, 'apiIndex'])->name('api.events.index');
Route::delete('/api/events/{id}', [EventController::class, 'apiDestroy'])->name('api.events.destroy');

// Analytics API routes
Route::get('/api/analytics', [AnalyticsController::class, 'getAnalytics'])->name('api.analytics');
Route::get('/api/analytics/detailed', [AnalyticsController::class, 'getDetailedAnalytics'])->name('api.analytics.detailed');
Route::get('/api/events/{id}/attendees', [AnalyticsController::class, 'getEventAttendees'])->name('api.events.attendees');

// Dashboard API routes for React frontend
Route::get('/api/dashboard/overview', [AnalyticsController::class, 'getDashboardOverview'])->name('api.dashboard.overview');
Route::get('/api/events/list', [AnalyticsController::class, 'getEventsList'])->name('api.events.list');
Route::post('/api/events/create', [AnalyticsController::class, 'createEvent'])->name('api.events.create');
Route::patch('/api/events/{id}/complete', [AnalyticsController::class, 'markEventCompleted'])->name('api.events.complete');

// Admin routes
Route::post('/admin/events', [EventController::class, 'store'])->name('admin.events.store');
Route::resource('events', EventController::class);

// Other routes
Route::get('/attendees', [AttendeeController::class, 'index'])->name('attendees.index');
Route::get('/attendees/export-pdf', [AttendeeController::class, 'exportPdf'])->name('attendees.export-pdf');



Route::get('/', function () {
    return view('welcome');
});

// RFID Reader interface (for physical RFID device)
Route::get('/rfid-reader', function () {
    return view('rfid-reader');
})->name('rfid.reader');

// RFID Attendance interface (for event check-in)
Route::get('/rfid-attendance', function () {
    $events = \App\Models\Event::with(['venue', 'category'])
        ->orderBy('start_time', 'asc')
        ->get();
    return view('rfid-attendance', compact('events'));
})->name('rfid.attendance');

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth'])->group(function () {
    Route::get('/admin', [DashboardController::class, 'index'])->name('admin.dashboard');
    Route::resource('admin/events', EventController::class);
    Route::get('/admin/events/{event}/analytics', [\App\Http\Controllers\Admin\EventAnalyticsController::class, 'show'])->name('admin.events.analytics');
    Route::get('/notifications', [DashboardController::class, 'notifications'])->name('notifications');
    Route::get('/calendar', [DashboardController::class, 'calendar'])->name('calendar');
    
    // Attendance management routes
    Route::get('/admin/attendance', [AdminAttendanceController::class, 'index'])->name('admin.attendance.index');
    Route::get('/admin/attendance/{eventId}', [AdminAttendanceController::class, 'show'])->name('admin.attendance.show');
    Route::get('/admin/attendance/{eventId}/export', [AdminAttendanceController::class, 'export'])->name('admin.attendance.export');
    
    // Settings route
    Route::get('/admin/settings', [\App\Http\Controllers\Admin\SettingsController::class, 'index'])->name('admin.settings');
    
    // You can add more admin routes here
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
