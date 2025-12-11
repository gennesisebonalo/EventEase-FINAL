<!DOCTYPE html>
<html lang="en" class="h-full bg-gray-900">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>EventEase Attendees</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
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
        
        /* Sidebar */
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
        
        /* Main Content */
        .main-content {
            flex: 1;
            padding: 2rem;
            overflow-y: auto;
            background-color: var(--bg-primary);
        }
        
        .header {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: var(--text-primary);
        }
        
        /* Table */
        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 1.5rem;
            background: var(--bg-card);
            border-radius: 0.75rem;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid var(--border-color);
        }
        
        th, td {
            padding: 1rem 1.25rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }
        
        th {
            background-color: rgba(30, 41, 59, 0.7);
            color: var(--text-secondary);
            font-weight: 500;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
        }
        
        tbody tr {
            transition: background-color 0.2s;
        }
        
        tbody tr:hover {
            background-color: rgba(255, 255, 255, 0.03);
        }
        
        td {
            color: var(--text-primary);
            font-size: 0.875rem;
        }
        
        /* Status Badges */
        .status-badge {
            display: inline-block;
            padding: 0.35rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: capitalize;
        }
        
        .status-present {
            background-color: rgba(16, 185, 129, 0.1);
            color: #10b981;
        }
        
        .status-absent {
            background-color: rgba(239, 68, 68, 0.1);
            color: #ef4444;
        }
        
        .status-pending {
            background-color: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
        }

        /* Filter Section */
        .filters {
            background: var(--bg-card);
            padding: 1.5rem;
            border-radius: 0.75rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        .filters h3 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .filter-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .filter-group {
            display: flex;
            flex-direction: column;
        }

        .filter-group label {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .filter-group select {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 0.5rem;
            padding: 0.75rem;
            color: var(--text-primary);
            font-size: 0.875rem;
            cursor: pointer;
            transition: border-color 0.2s;
        }

        .filter-group select:hover {
            border-color: var(--primary);
        }

        .filter-group select:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(93, 95, 239, 0.1);
        }

        .filter-actions {
            display: flex;
            gap: 0.75rem;
            margin-top: 1rem;
        }

        .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
        }

        .btn-primary {
            background: var(--primary);
            color: white;
        }

        .btn-primary:hover {
            background: var(--primary-hover);
        }

        .btn-secondary {
            background: var(--bg-secondary);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        /* Group Header */
        .group-header {
            background: rgba(93, 95, 239, 0.1);
            padding: 1rem 1.25rem;
            margin-top: 1.5rem;
            border-radius: 0.5rem;
            border-left: 4px solid var(--primary);
            font-weight: 600;
            color: var(--text-primary);
        }

        .group-header:first-child {
            margin-top: 0;
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
            <a href="{{ route('attendees.index') }}" class="active" title="Attendees">
                <i class="fas fa-users"></i>
            </a>
            <a href="{{ route('analytics.index') }}" title="Analytics">
                <i class="fas fa-chart-bar"></i>
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
            <div class="header" style="display: flex; justify-content: space-between; align-items: center;">
                <span>Attendees</span>
                <a href="{{ route('attendees.export-pdf', request()->all()) }}" 
                   class="btn btn-primary" 
                   style="background: #10b981; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-weight: 500;">
                    <i class="fas fa-file-pdf"></i> Download PDF
                </a>
            </div>

            <!-- Filter Section -->
            <div class="filters">
                <h3>Filter Attendees</h3>
                <form method="GET" action="{{ route('attendees.index') }}">
                    <div class="filter-row">
                        <div class="filter-group">
                            <label for="event_id">Event</label>
                            <select name="event_id" id="event_id">
                                <option value="">All Events</option>
                                @foreach($events as $event)
                                    <option value="{{ $event->id }}" {{ request('event_id') == $event->id ? 'selected' : '' }}>
                                        {{ $event->title }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="education_level">Education Level</label>
                            <select name="education_level" id="education_level">
                                <option value="">All Levels</option>
                                @foreach($educationLevels as $level)
                                    <option value="{{ $level }}" {{ request('education_level') == $level ? 'selected' : '' }}>
                                        {{ $level }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="year_level">Year Level</label>
                            <select name="year_level" id="year_level">
                                <option value="">All Years</option>
                                @foreach($yearLevels as $year)
                                    <option value="{{ $year }}" {{ request('year_level') == $year ? 'selected' : '' }}>
                                        {{ $year }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="block">Block</label>
                            <select name="block" id="block">
                                <option value="">All Blocks</option>
                                @foreach($blocks as $block)
                                    <option value="{{ $block }}" {{ request('block') == $block ? 'selected' : '' }}>
                                        {{ $block }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="filter-actions">
                        <button type="submit" class="btn btn-primary">Apply Filters</button>
                        <a href="{{ route('attendees.index') }}" class="btn btn-secondary">Clear Filters</a>
                    </div>
                </form>
            </div>

            @php
                // Group attendees based on active filters
                $groupedAttendees = [];
                
                // Determine grouping strategy based on active filters
                $hasEventFilter = request('event_id');
                $hasEducationFilter = request('education_level');
                $hasYearFilter = request('year_level');
                $hasBlockFilter = request('block');
                
                $activeFiltersCount = ($hasEventFilter ? 1 : 0) + ($hasEducationFilter ? 1 : 0) + 
                                     ($hasYearFilter ? 1 : 0) + ($hasBlockFilter ? 1 : 0);
                
                if ($activeFiltersCount > 1) {
                    // Multiple filters: group by all non-filtered criteria
                    $groupedAttendees = $attendees->groupBy(function($attendee) use ($hasEventFilter, $hasEducationFilter, $hasYearFilter, $hasBlockFilter) {
                        $parts = [];
                        if (!$hasEventFilter) {
                            $parts[] = 'Event: ' . (optional($attendee->event)->title ?? 'No Event');
                        }
                        if (!$hasEducationFilter) {
                            $parts[] = 'Education: ' . (optional($attendee->user)->education_level ?? 'No Education Level');
                        }
                        if (!$hasYearFilter) {
                            $parts[] = 'Year: ' . (optional($attendee->user)->year_level ?? 'No Year');
                        }
                        if (!$hasBlockFilter) {
                            $parts[] = 'Block: ' . (optional($attendee->user)->block ?? 'No Block');
                        }
                        return !empty($parts) ? implode(' | ', $parts) : 'All Attendees';
                    });
                } elseif ($hasEventFilter) {
                    // Only event filter: group by education level, year, and block
                    $groupedAttendees = $attendees->groupBy(function($attendee) {
                        $eduLevel = optional($attendee->user)->education_level ?? 'No Education Level';
                        $year = optional($attendee->user)->year_level ?? 'No Year';
                        $block = optional($attendee->user)->block ?? 'No Block';
                        return "{$eduLevel} - Year {$year} - Block {$block}";
                    });
                } elseif ($hasEducationFilter) {
                    // Only education filter: group by event, year, and block
                    $groupedAttendees = $attendees->groupBy(function($attendee) {
                        $eventTitle = optional($attendee->event)->title ?? 'No Event';
                        $year = optional($attendee->user)->year_level ?? 'No Year';
                        $block = optional($attendee->user)->block ?? 'No Block';
                        return "{$eventTitle} - Year {$year} - Block {$block}";
                    });
                } elseif ($hasYearFilter) {
                    // Only year filter: group by event, education, and block
                    $groupedAttendees = $attendees->groupBy(function($attendee) {
                        $eventTitle = optional($attendee->event)->title ?? 'No Event';
                        $eduLevel = optional($attendee->user)->education_level ?? 'No Education Level';
                        $block = optional($attendee->user)->block ?? 'No Block';
                        return "{$eventTitle} - {$eduLevel} - Block {$block}";
                    });
                } elseif ($hasBlockFilter) {
                    // Only block filter: group by event, education, and year
                    $groupedAttendees = $attendees->groupBy(function($attendee) {
                        $eventTitle = optional($attendee->event)->title ?? 'No Event';
                        $eduLevel = optional($attendee->user)->education_level ?? 'No Education Level';
                        $year = optional($attendee->user)->year_level ?? 'No Year';
                        return "{$eventTitle} - {$eduLevel} - Year {$year}";
                    });
                } else {
                    // No filters: group by event
                    $groupedAttendees = $attendees->groupBy(function($attendee) {
                        return optional($attendee->event)->title ?? 'No Event';
                    });
                }
            @endphp

            @if($groupedAttendees->count() > 0)
                @foreach($groupedAttendees as $groupName => $groupAttendees)
                    <div class="group-header">
                        {{ $groupName }} ({{ $groupAttendees->count() }} {{ Str::plural('attendee', $groupAttendees->count()) }})
                    </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Education Level</th>
                        <th>Year</th>
                        <th>Block</th>
                        <th>Event</th>
                        <th>Venue</th>
                        <th>Event Date</th>
                        <th>Status</th>
                        <th>Recorded At</th>
                    </tr>
                </thead>
                <tbody>
                            @foreach ($groupAttendees as $attendee)
                        <tr>
                                    <td>{{ optional($attendee->user)->printed_id ?? 'N/A' }}</td>
                            <td>{{ optional($attendee->user)->name ?? $attendee->name }}</td>
                            <td>{{ optional($attendee->user)->email ?? $attendee->email }}</td>
                                    <td>{{ optional($attendee->user)->education_level ?? 'N/A' }}</td>
                                    <td>{{ optional($attendee->user)->year_level ?? 'N/A' }}</td>
                                    <td>{{ optional($attendee->user)->block ?? 'N/A' }}</td>
                            <td>{{ optional($attendee->event)->title ?? 'N/A' }}</td>
                            <td>{{ optional(optional($attendee->event)->venue)->name ?? 'N/A' }}</td>
                            <td>
                                @if(optional($attendee->event)->start_time)
                                    {{ \Carbon\Carbon::parse($attendee->event->start_time)->format('M d, Y h:i A') }}
                                    @if(optional($attendee->event)->end_time)
                                        – {{ \Carbon\Carbon::parse($attendee->event->end_time)->format('h:i A') }}
                                    @endif
                                @else
                                    N/A
                                @endif
                            </td>
                            <td>
                                @php $status = $attendee->status ?? 'pending'; @endphp
                                <span class="status-badge status-{{ $status }}">
                                    {{ ucfirst($status) }}
                                </span>
                            </td>
                            <td>{{ $attendee->created_at ? $attendee->created_at->format('M d, Y h:i A') : 'N/A' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
                @endforeach
            @else
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    No attendees found matching the selected filters.
                </div>
            @endif
        </div>
    </div>
</body>
</html>
