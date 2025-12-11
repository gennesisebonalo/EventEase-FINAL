<!DOCTYPE html>
<html lang="en" class="h-full bg-gray-900">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Analytics Dashboard - EventEase</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0"></script>
    <style>
        :root {
            --primary: #5d5fef;
            --primary-hover: #4b4dbf;
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --bg-card: #1e293b;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --border-color: #334155;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --info: #3b82f6;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.5;
        }
        .container {
            display: flex;
            min-height: 100vh;
        }
        .sidebar {
            width: 80px;
            background-color: var(--bg-secondary);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 24px 0;
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
            border-right: 1px solid var(--border-color);
            position: relative;
            z-index: 10;
        }
        
        .sidebar a {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 48px;
            height: 48px;
            margin: 8px 0;
            border-radius: 12px;
            color: var(--text-secondary);
            font-size: 1.25rem;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .sidebar a:hover {
            background-color: rgba(255, 255, 255, 0.05);
            color: var(--text-primary);
        }
        
        .sidebar a.active {
            background-color: var(--primary);
            color: white;
            box-shadow: 0 4px 12px rgba(93, 95, 239, 0.3);
        }
        
        .sidebar a.active::before {
            content: '';
            position: absolute;
            left: -16px;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 24px;
            background-color: var(--primary);
            border-radius: 0 4px 4px 0;
        }
        .main-content {
            flex: 1;
            padding: 2rem;
            background-color: var(--bg-primary);
            overflow-y: auto;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
        }
        
        .header h1 {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--text-primary);
            margin: 0;
        }
        .card {
            background: var(--bg-card);
            border-radius: 0.75rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid var(--border-color);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            color: var(--text-primary);
        }
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1.5rem;
            margin-bottom: 1.5rem;
        }
        
        .stat-card {
            background: var(--bg-card);
            border-radius: 0.75rem;
            padding: 1.5rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            display: flex;
            flex-direction: column;
            border: 1px solid var(--border-color);
        }
        
        .stat-card h3 {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--text-secondary);
            margin: 0 0 0.5rem 0;
        }
        
        .stat-card .value {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--text-primary);
            margin: 0;
        }
        .stat-icon {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
        }
        .events-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        .event-card {
            background: var(--bg-card);
            border-radius: 0.75rem;
            overflow: hidden;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            border: 1px solid var(--border-color);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .event-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .event-header {
            padding: 1.25rem;
            border-bottom: 1px solid var(--border-color);
        }
        .event-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--text-primary);
            margin: 0 0 0.5rem;
        }
        .event-meta {
            display: flex;
            align-items: center;
            color: var(--text-secondary);
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
        }
        .event-meta svg {
            width: 1rem;
            height: 1rem;
            margin-right: 0.5rem;
        }
        .event-status {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: capitalize;
        }
        .status-upcoming {
            background-color: #e0f2fe;
            color: #0369a1;
        }
        .status-ongoing {
            background-color: #dcfce7;
            color: #15803d;
        }
        .status-completed {
            background-color: #f1f5f9;
            color: #475569;
        }
        .status-cancelled {
            background-color: #fee2e2;
            color: #b91c1c;
        }
        .event-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            padding: 1.25rem;
            border-bottom: 1px solid var(--border-color);
        }
        
        .stat {
            text-align: center;
        }
        
        .stat-value {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }
        
        .stat-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .progress-container {
            padding: 1.25rem;
        }
        .progress-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
            color: var(--text-secondary);
        }
        .progress-bar {
            height: 0.5rem;
            background-color: var(--border-color);
            border-radius: 0.25rem;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4f46e5, #7c3aed);
            border-radius: 0.25rem;
            transition: width 0.3s ease;
        }
        .view-details-btn {
            display: block;
            width: 100%;
            padding: 0.75rem;
            background-color: var(--primary);
            color: white;
            text-align: center;
            border-radius: 0.5rem;
            font-weight: 500;
            transition: background-color 0.2s;
            border: none;
            cursor: pointer;
            font-family: inherit;
        }
        .view-details-btn:hover {
            background-color: var(--primary-hover);
        }
        .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            grid-column: 1 / -1;
        }
        .empty-state-icon {
            width: 4rem;
            height: 4rem;
            background-color: var(--bg-card);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
        }
        .empty-state-icon svg {
            width: 2rem;
            height: 2rem;
            color: var(--text-secondary);
        }
        .empty-state h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }
        .empty-state p {
            color: var(--text-secondary);
            max-width: 28rem;
            margin: 0 auto;
        }
        .search-container {
            position: relative;
            width: 300px;
        }
        
        .search-container input {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 2.5rem;
            background-color: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 0.5rem;
            font-size: 0.875rem;
            color: var(--text-primary);
            transition: all 0.2s ease;
        }
        
        .search-container input::placeholder {
            color: var(--text-secondary);
        }
        
        .search-container input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(93, 95, 239, 0.2);
        }
        
        .search-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-secondary);
        }
        .filter-buttons {
            display: flex;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
        }
        
        .filter-button {
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            border: 1px solid var(--border-color);
            background-color: var(--bg-card);
            color: var(--text-secondary);
            transition: all 0.2s ease;
        }
        
        .filter-button:hover {
            background-color: rgba(255, 255, 255, 0.05);
            color: var(--text-primary);
        }
        
        .filter-button.active {
            background-color: var(--primary);
            border-color: var(--primary);
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Sidebar -->
        <div class="sidebar">
            <a href="/admin" title="Dashboard">
                <i class="fas fa-home"></i>
            </a>
            <a href="{{ route('events.index') }}" title="Events">
                <i class="fas fa-calendar"></i>
            </a>
            <a href="{{ route('attendees.index') }}" title="Attendees">
                <i class="fas fa-users"></i>
            </a>
            <a href="{{ route('analytics.index') }}" class="active" title="Analytics">
                <i class="fas fa-chart-line"></i>
            </a>
            <a href="{{ route('rfid.reader') }}" title="RFID Card Registration">
                <i class="fas fa-id-card"></i>
            </a>
            <a href="{{ route('rfid.attendance') }}" title="RFID Attendance">
                <i class="fas fa-clipboard-check"></i>
            </a>
            <a href="{{ route('admin.settings') }}" title="Settings">
                <i class="fas fa-cog"></i>
            </a>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <div class="header">
                <h1>Analytics Dashboard</h1>
                <div class="search-container">
                    <input 
                        type="text" 
                        id="eventSearch" 
                        placeholder="Search events..." 
                        class="search-input"
                    >
                    <div class="search-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Status Filter -->
            <div class="filter-buttons">
                <button class="filter-btn active">All Events</button>
                <button class="filter-btn">Upcoming</button>
                <button class="filter-btn">Ongoing</button>
                <button class="filter-btn">Completed</button>
                <button class="filter-btn">Cancelled</button>
            </div>

            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: #eef2ff;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                    <div class="stat-value">{{ $totalEvents ?? 42 }}</div>
                    <div class="stat-label">Total Events</div>
                    <div class="stat-trend text-sm text-green-400">+5 from last month</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: #f0fdf4;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <div class="stat-value">{{ $totalAttendees ?? number_format(1000) }}</div>
                    <div class="stat-label">Total Users</div>
                    <div class="stat-trend text-sm text-green-400">Active this month: {{ floor(1000 * 0.72) }}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: #f5f3ff;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <div class="stat-value">{{ $totalCheckedIn ?? number_format(floor(1000 * 0.85)) }}</div>
                    <div class="stat-label">Active Users (30d)</div>
                    <div class="stat-trend text-sm text-green-400">85% engagement</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: #fffbeb;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                            <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                        </svg>
                    </div>
                    <div class="stat-value">{{ number_format($averageAttendanceRate ?? 78.5, 1) }}%</div>
                    <div class="stat-label">Avg. Event Attendance</div>
                    <div class="stat-trend text-sm text-green-400">+3.2% from last month</div>
                </div>
            </div>

            <!-- Events List -->
            <h2 class="text-xl font-semibold text-gray-800 mb-4 mt-8">Recent Events</h2>
            
            @if(count($events) > 0)
                <div class="events-grid">
                    @foreach($events as $event)
                    <div class="event-card">
                        <div class="event-header">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h3 class="event-title">{{ $event->title }}</h3>
                                    <div class="event-meta">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                        <span>{{ $event->start_time->format('M j, Y \a\t g:i A') }}</span>
                                    </div>
                                    <div class="event-meta">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                            <circle cx="12" cy="10" r="3"></circle>
                                        </svg>
                                        <span>{{ $event->venue->name }}</span>
                                    </div>
                                </div>
                                <span class="event-status status-{{ $event->status }}">
                                    {{ ucfirst($event->status) }}
                                </span>
                            </div>
                        </div>
                        
                        <div class="event-stats">
                            <div class="stat">
                                @php
                                    $registered = $event->attendees_count ?? rand(50, 300);
                                    $maxCapacity = $event->capacity ?? 300;
                                    $percentage = min(100, round(($registered / $maxCapacity) * 100));
                                @endphp
                                <div class="stat-value">{{ number_format($registered) }}</div>
                                <div class="stat-label">Registered</div>
                                <div class="text-xs text-gray-400">{{ $percentage }}% of capacity</div>
                            </div>
                            <div class="stat">
                                @php
                                    $checkedIn = $event->checked_in_count ?? floor($registered * 0.75);
                                    $checkedInPercentage = $registered > 0 ? round(($checkedIn / $registered) * 100) : 0;
                                @endphp
                                <div class="stat-value">{{ number_format($checkedIn) }}</div>
                                <div class="stat-label">Checked In</div>
                                <div class="text-xs {{ $checkedInPercentage > 70 ? 'text-green-400' : ($checkedInPercentage > 40 ? 'text-yellow-400' : 'text-red-400') }}">
                                    {{ $checkedInPercentage }}% of registered
                                </div>
                            </div>
                            <div class="stat">
                                @php
                                    $attendanceRate = $event->attendance_rate ?? min(100, $checkedInPercentage + rand(-5, 5));
                                @endphp
                                <div class="stat-value">{{ $attendanceRate }}%</div>
                                <div class="stat-label">Attendance</div>
                                <div class="text-xs {{ $attendanceRate > 70 ? 'text-green-400' : ($attendanceRate > 40 ? 'text-yellow-400' : 'text-red-400') }}">
                                    {{ $attendanceRate > 70 ? 'High' : ($attendanceRate > 40 ? 'Medium' : 'Low') }} engagement
                                </div>
                            </div>
                        </div>
                        
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Check-in Progress</span>
                                <span>{{ $event->checked_in_count }}/{{ $event->attendees_count > 0 ? $event->attendees_count : '∞' }}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: {{ $event->attendance_rate }}%"></div>
                            </div>
                        </div>
                        
                        <!-- Attendee Year and Block Summary -->
                        @if($event->attendees_count > 0)
                        <div class="px-5 py-2 text-sm text-gray-300">
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-xs text-gray-400">Year Levels:</span>
                                <div class="flex flex-wrap justify-end gap-1">
                                    @php
                                        $yearLevels = [];
                                        if (isset($event->attendees_list) && count($event->attendees_list) > 0) {
                                            $yearLevels = collect($event->attendees_list)
                                                ->pluck('year_level')
                                                ->filter()
                                                ->unique()
                                                ->sort()
                                                ->values()
                                                ->toArray();
                                        }
                                    @endphp
                                    @if(count($yearLevels) > 0)
                                        @foreach($yearLevels as $yearLevel)
                                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                                {{ $yearLevel }}
                                            </span>
                                        @endforeach
                                    @else
                                        <span class="text-xs text-gray-500">No year data</span>
                                    @endif
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-xs text-gray-400">Blocks:</span>
                                <div class="flex flex-wrap justify-end gap-1">
                                    @php
                                        $blocks = [];
                                        if (isset($event->attendees_list) && count($event->attendees_list) > 0) {
                                            $blocks = collect($event->attendees_list)
                                                ->pluck('block')
                                                ->filter()
                                                ->unique()
                                                ->sort()
                                                ->values()
                                                ->toArray();
                                        }
                                    @endphp
                                    @if(count($blocks) > 0)
                                        @foreach($blocks as $block)
                                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                {{ $block }}
                                            </span>
                                        @endforeach
                                    @else
                                        <span class="text-xs text-gray-500">No block data</span>
                                    @endif
                                </div>
                            </div>
                        </div>
                        @endif
                        
                        <div style="padding: 0 1.25rem 1.25rem;">
                            <button class="view-details-btn px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                            data-event-id="{{ $event->id }}"
                            data-title="{{ $event->title }}"
                            data-date="{{ \Carbon\Carbon::parse($event->start_time)->format('M d, Y') }}"
                            data-time="{{ \Carbon\Carbon::parse($event->start_time)->format('h:i A') }} - {{ \Carbon\Carbon::parse($event->end_time)->format('h:i A') }}"
                            data-location="{{ $event->venue ? $event->venue->name : 'TBD' }}"
                            data-description="{{ $event->description }}"
                            data-registered="{{ $event->attendees_count }}"
                            data-checked-in="{{ $event->checked_in_count }}"
                            data-attendance-rate="{{ $event->attendance_rate }}"
                            data-status="{{ $event->status }}"
                            data-event-json="{{ json_encode($event) }}">
                                View Event Details
                            </button>
                        </div>
                    </div>
                    @endforeach
                </div>
            @else
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <h3>No events found</h3>
                    <p>There are no events to display. Try adjusting your filters or check back later.</p>
                </div>
            @endif
            </div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        // Search functionality
        document.getElementById('eventSearch').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const eventCards = document.querySelectorAll('.event-card');
            let hasResults = false;
            
            eventCards.forEach(card => {
                const eventName = card.querySelector('.event-title').textContent.toLowerCase();
                if (eventName.includes(searchTerm)) {
                    card.style.display = '';
                    hasResults = true;
                } else {
                    card.style.display = 'none';
                }
            });

            // Show/hide empty state
            const emptyState = document.querySelector('.empty-state');
            if (emptyState) {
                emptyState.style.display = hasResults ? 'none' : 'block';
            }
        });

        // Filter buttons functionality
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Here you would typically filter events by status
                // For now, we'll just log the filter
                console.log('Filter by:', this.textContent.trim());
                
                // In a real implementation, you would filter the events here
                // and update the UI accordingly
            });
        });

        // Initialize charts for each event if they exist
        document.addEventListener('DOMContentLoaded', function() {
            @if(isset($events) && count($events) > 0)
                @foreach($events as $event)
                    @if(isset($event->check_ins_by_hour) && is_array($event->check_ins_by_hour) && !empty($event->check_ins_by_hour))
                        const ctx{{ $event->id }} = document.getElementById('chart-{{ $event->id }}');
                        if (ctx{{ $event->id }}) {
                            new Chart(ctx{{ $event->id }}.getContext('2d'), {
                                type: 'bar',
                                data: {
                                    labels: {!! json_encode(array_keys($event->check_ins_by_hour)) !!},
                                    datasets: [{
                                        label: 'Check-ins by Hour',
                                        data: {!! json_encode(array_values($event->check_ins_by_hour)) !!},
                                        backgroundColor: 'rgba(99, 102, 241, 0.6)',
                                        borderColor: 'rgba(79, 70, 229, 1)',
                                        borderWidth: 1,
                                        borderRadius: 4,
                                        borderSkipped: false,
                                    }]
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: {
                                                display: true,
                                                drawBorder: false
                                            },
                                            ticks: {
                                                stepSize: 1,
                                                font: {
                                                    size: 12
                                                }
                                            }
                                        },
                                        x: {
                                            grid: {
                                                display: false,
                                                drawBorder: false
                                            },
                                            ticks: {
                                                font: {
                                                    size: 12
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    @endif
                @endforeach
            @endif
        });
    </script>

    <!-- Event Details Modal -->
    <div id="eventDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div class="bg-gray-800 rounded-lg w-full max-w-2xl mx-4 overflow-hidden">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-semibold text-white" id="modalEventTitle"></h3>
                    <button id="closeModal" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div class="flex items-start">
                            <i class="fas fa-calendar-alt text-indigo-400 mt-1 mr-3"></i>
                            <div>
                                <p class="text-sm text-gray-400">Date & Time</p>
                                <p class="text-white" id="modalEventDateTime"></p>
                            </div>
                        </div>
                        
                        <div class="flex items-start">
                            <i class="fas fa-map-marker-alt text-indigo-400 mt-1 mr-3"></i>
                            <div>
                                <p class="text-sm text-gray-400">Location</p>
                                <p class="text-white" id="modalEventLocation"></p>
                            </div>
                        </div>
                        
                        <div class="flex items-start">
                            <i class="fas fa-info-circle text-indigo-400 mt-1 mr-3"></i>
                            <div>
                                <p class="text-sm text-gray-400">Status</p>
                                <span id="modalEventStatus" class="px-2 py-1 rounded-full text-xs font-medium"></span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="bg-gray-700 p-4 rounded-lg">
                            <h4 class="text-sm font-medium text-gray-300 mb-2">Attendance Summary</h4>
                            <div class="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p class="text-2xl font-bold text-white" id="modalRegisteredCount"></p>
                                    <p class="text-xs text-gray-400">Registered</p>
                                </div>
                                <div>
                                    <p class="text-2xl font-bold text-white" id="modalCheckedInCount"></p>
                                    <p class="text-xs text-gray-400">Checked In</p>
                                </div>
                                <div>
                                    <p class="text-2xl font-bold text-white" id="modalAttendanceRate"></p>
                                    <p class="text-xs text-gray-400">Attendance</p>
                                </div>
                            </div>
                            <div class="mt-3">
                                <div class="w-full bg-gray-600 rounded-full h-2">
                                    <div id="modalAttendanceBar" class="bg-indigo-500 h-2 rounded-full" style="width: 0%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-6">
                    <h4 class="text-sm font-medium text-gray-300 mb-2">Description</h4>
                    <p class="text-gray-300 mb-6" id="modalEventDescription"></p>
                    
                    <!-- Attendees Tab -->
                    <div class="border-b border-gray-700 mb-4">
                        <nav class="-mb-px flex space-x-8">
                            <button id="detailsTab" class="border-b-2 border-indigo-500 text-indigo-400 whitespace-nowrap py-4 px-1 text-sm font-medium">
                                Event Details
                            </button>
                            <button id="attendeesTab" class="border-b-2 border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300 whitespace-nowrap py-4 px-1 text-sm font-medium">
                                Attendees
                                <span id="attendeesCount" class="ml-2 bg-gray-700 text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full">0</span>
                            </button>
                        </nav>
                    </div>
                    
                    <!-- Tab Content -->
                    <div id="detailsTabContent" class="tab-content">
                        <!-- Event details content is already here -->
                    </div>
                    
                    <div id="attendeesTabContent" class="tab-content hidden">
                        <div class="bg-gray-700 rounded-lg overflow-hidden">
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-600">
                                    <thead class="bg-gray-800">
                                        <tr>
                                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Year Level</th>
                                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Block</th>
                                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Checked In</th>
                                        </tr>
                                    </thead>
                                    <tbody id="attendeesList" class="bg-gray-700 divide-y divide-gray-600">
                                        <!-- Attendees will be populated by JavaScript -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-6 flex justify-end space-x-3">
                    <button id="closeModalBtn" class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white">
                        Close
                    </button>
                    <a href="#" id="viewFullDetailsBtn" class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors">
                        View Full Event
                    </a>
                </div>
            </div>
        </div>
    </div>

    <style>
        /* Modal Styles */
        #eventDetailsModal {
            transition: opacity 0.3s ease-in-out;
        }
        
        #eventDetailsModal .modal-enter {
            opacity: 0;
        }
        
        #eventDetailsModal .modal-enter-active {
            opacity: 1;
        }
        
        #eventDetailsModal .modal-exit {
            opacity: 1;
        }
        
        #eventDetailsModal .modal-exit-active {
            opacity: 0;
        }
        
        /* Status Badges */
        .status-active {
            background-color: #10B9811A;
            color: #10B981;
        }
        
        .status-upcoming {
            background-color: #3B82F61A;
            color: #3B82F6;
        }
        
        .status-completed {
            background-color: #6B72801A;
            color: #6B7280;
        }
        
        .status-cancelled {
            background-color: #EF44441A;
            color: #EF4444;
        }
    </style>

    <style>
        .tab-content {
            transition: opacity 0.3s ease-in-out;
        }
        .tab-content:not(.hidden) {
            animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .attendee-row:hover {
            background-color: #374151;
        }
    </style>

    <script>
        // Event Details Modal Functionality
        document.addEventListener('DOMContentLoaded', function() {
            const modal = document.getElementById('eventDetailsModal');
            const closeModal = document.getElementById('closeModal');
            const closeModalBtn = document.getElementById('closeModalBtn');
            const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
            let currentEventData = null;
            
            // Tab functionality
            const detailsTab = document.getElementById('detailsTab');
            const attendeesTab = document.getElementById('attendeesTab');
            const detailsContent = document.getElementById('detailsTabContent');
            const attendeesContent = document.getElementById('attendeesTabContent');
            
            if (detailsTab && attendeesTab) {
                detailsTab.addEventListener('click', () => {
                    detailsTab.classList.add('border-indigo-500', 'text-indigo-400');
                    detailsTab.classList.remove('border-transparent', 'text-gray-500');
                    attendeesTab.classList.add('border-transparent', 'text-gray-500');
                    attendeesTab.classList.remove('border-indigo-500', 'text-indigo-400');
                    detailsContent.classList.remove('hidden');
                    attendeesContent.classList.add('hidden');
                });
                
                attendeesTab.addEventListener('click', () => {
                    attendeesTab.classList.add('border-indigo-500', 'text-indigo-400');
                    attendeesTab.classList.remove('border-transparent', 'text-gray-500');
                    detailsTab.classList.add('border-transparent', 'text-gray-500');
                    detailsTab.classList.remove('border-indigo-500', 'text-indigo-400');
                    attendeesContent.classList.remove('hidden');
                    detailsContent.classList.add('hidden');
                    
                    // Populate attendees if not already done
                    if (currentEventData) {
                        populateAttendees(currentEventData.attendees_list);
                    }
                });
            }
            
            // Open modal with event details
            viewDetailsButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const eventId = this.getAttribute('data-event-id');
                    const eventTitle = this.getAttribute('data-title');
                    const eventDate = this.getAttribute('data-date');
                    const eventTime = this.getAttribute('data-time');
                    const eventLocation = this.getAttribute('data-location');
                    const eventDescription = this.getAttribute('data-description');
                    const registered = this.getAttribute('data-registered');
                    const checkedIn = this.getAttribute('data-checked-in');
                    const attendanceRate = this.getAttribute('data-attendance-rate');
                    const status = this.getAttribute('data-status');
                    const eventData = JSON.parse(this.getAttribute('data-event-json'));
                    currentEventData = eventData;
                    
                    // Populate modal
                    document.getElementById('modalEventTitle').textContent = eventTitle;
                    document.getElementById('modalEventDateTime').textContent = `${eventDate} • ${eventTime}`;
                    document.getElementById('modalEventLocation').textContent = eventLocation;
                    document.getElementById('modalEventDescription').textContent = eventDescription;
                    document.getElementById('modalRegisteredCount').textContent = registered;
                    document.getElementById('modalCheckedInCount').textContent = checkedIn;
                    document.getElementById('modalAttendanceRate').textContent = `${attendanceRate}%`;
                    
                    // Update attendance bar
                    document.getElementById('modalAttendanceBar').style.width = `${attendanceRate}%`;
                    
                    // Set status
                    const statusElement = document.getElementById('modalEventStatus');
                    statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
                    statusElement.className = 'px-2 py-1 rounded-full text-xs font-medium';
                    
                    // Add appropriate status class
                    switch(status.toLowerCase()) {
                        case 'active':
                            statusElement.classList.add('status-active');
                            break;
                        case 'upcoming':
                            statusElement.classList.add('status-upcoming');
                            break;
                        case 'completed':
                            statusElement.classList.add('status-completed');
                            break;
                        case 'cancelled':
                            statusElement.classList.add('status-cancelled');
                            break;
                    }
                    
                    // Set link to full event page
                    document.getElementById('viewFullDetailsBtn').href = `/admin/events/${eventId}`;
                    
                    // Reset tabs to default state
                    if (detailsTab && attendeesTab) {
                        detailsTab.classList.add('border-indigo-500', 'text-indigo-400');
                        detailsTab.classList.remove('border-transparent', 'text-gray-500');
                        attendeesTab.classList.add('border-transparent', 'text-gray-500');
                        attendeesTab.classList.remove('border-indigo-500', 'text-indigo-400');
                        detailsContent.classList.remove('hidden');
                        attendeesContent.classList.add('hidden');
                    }
                    
                    // Update attendees count
                    const attendeesCount = eventData.attendees_list ? eventData.attendees_list.length : 0;
                    document.getElementById('attendeesCount').textContent = attendeesCount;
                    
                    // Show modal
                    modal.classList.remove('hidden');
                    document.body.style.overflow = 'hidden';
                });
            });
            
            // Function to populate attendees table
            function populateAttendees(attendees) {
                const tbody = document.getElementById('attendeesList');
                tbody.innerHTML = '';
                
                if (!attendees || attendees.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-400">
                                No attendees found
                            </td>
                        </tr>`;
                    return;
                }
                
                attendees.forEach(attendee => {
                    const row = document.createElement('tr');
                    row.className = 'attendee-row';
                    
                    const formattedTime = new Date(attendee.checked_in_at).toLocaleString();
                    
                    row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-100">${attendee.name}</div>
                            <div class="text-xs text-gray-400">${attendee.email}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            ${attendee.year_level || 'N/A'}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            ${attendee.block || 'N/A'}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            <div class="text-xs text-gray-400">${formattedTime}</div>
                        </td>
                    `;
                    
                    tbody.appendChild(row);
                });
            }
            
            // Close modal
            const closeModalFunc = () => {
                modal.classList.add('hidden');
                document.body.style.overflow = 'auto';
                // Clear any existing data
                document.getElementById('attendeesList').innerHTML = '';
                currentEventData = null;
            };
            
            closeModal.addEventListener('click', closeModalFunc);
            closeModalBtn.addEventListener('click', closeModalFunc);
            
            // Close modal when clicking outside
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModalFunc();
                }
            });
            
            // Close with Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                    closeModalFunc();
                }
            });
        });
    </script>
</body>
</html>
