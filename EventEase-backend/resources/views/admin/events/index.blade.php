<!DOCTYPE html>
<html lang="en" class="h-full bg-gray-900">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Manage Events - EventEase</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
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
            background-color: var(--bg-primary);
            overflow-y: auto;
        }
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
        }
        .page-header h1 {
            margin: 0;
            font-size: 1.8rem;
            color: var(--text-primary);
        }
        .btn-add {
            background-color: var(--primary);
            color: white;
            padding: 10px 16px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 0.95rem;
            transition: background-color 0.2s ease;
        }
        .btn-add:hover {
            background-color: var(--primary-hover);
        }
        /* Filters */
        .filters {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        .filters input, .filters select {
            padding: 8px 12px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            font-size: 0.9rem;
            background-color: var(--bg-card);
            color: var(--text-primary);
        }
        /* Table */
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        th, td {
            padding: 14px 16px;
            text-align: left;
            color: var(--text-primary);
            border-bottom: 1px solid var(--border-color);
        }
        th {
            background-color: var(--bg-card);
            font-weight: 600;
            color: var(--text-primary);
        }
        tr {
            background-color: var(--bg-card);
        }
        tr:nth-child(even) {
            background-color: var(--bg-secondary);
        }
        /* Status badges */
        .status {
            padding: 6px 10px;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: bold;
            text-transform: capitalize;
        }
        .confirmed { background-color: #e6f4ea; color: #2e7d32; }
        .pending { background-color: #fff3e0; color: #ef6c00; }
        .cancelled { background-color: #fdecea; color: #c62828; }
        .upcoming { background-color: #dbe9ff; color: #2962ff; }
        .ongoing { background-color: #d4edda; color: #155724; }
        .completed { background-color: #f8d7da; color: #721c24; }
        .past { background-color: #f8d7da; color: #721c24; }
        /* Actions */
        .actions {
            display: flex;
            gap: 12px;
        }
        .actions a, .actions button {
            border: none;
            background: none;
            cursor: pointer;
            color: var(--text-secondary);
            font-size: 1.1rem;
            transition: color 0.2s ease;
            padding: 4px 8px;
            border-radius: 4px;
        }
        .actions a:hover, .actions button:hover {
            color: var(--primary);
            background-color: rgba(93, 95, 239, 0.1);
        }
        .actions button[type="submit"]:hover {
            color: var(--danger);
            background-color: rgba(239, 68, 68, 0.1);
        }
        /* Notifications */
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        }
        .notification.success {
            background-color: #4CAF50;
        }
        .notification.error {
            background-color: #F44336;
        }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    </style>
</head>
<body>
    <!-- Flash Messages -->
    @if(session('success'))
        <div class="notification success" id="notification">
            {{ session('success') }}
        </div>
    @endif
    
    @if(session('error'))
        <div class="notification error" id="notification">
            {{ session('error') }}
        </div>
    @endif

    <div class="container">
        <!-- Sidebar -->
        <div class="sidebar">
            <a href="/admin" title="Dashboard">
                <i class="fas fa-home"></i>
            </a>
            <a href="{{ route('events.index') }}" title="Events" class="active">
                <i class="fas fa-calendar"></i>
            </a>
            <a href="{{ route('attendees.index') }}" title="Attendees">
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
            <div class="page-header">
                <h1>Manage Events</h1>
                <a href="{{ route('events.create') }}" class="btn-add">+ Add New Event</a>
            </div>

            <form method="GET" action="{{ route('events.index') }}" class="filters">
                <input type="text" name="search" placeholder="Search by title" value="{{ request('search') }}">
                <select name="status">
                    <option value="">All Statuses</option>
                    <option value="upcoming" {{ request('status') == 'upcoming' ? 'selected' : '' }}>Upcoming</option>
                    <option value="ongoing" {{ request('status') == 'ongoing' ? 'selected' : '' }}>Ongoing</option>
                    <option value="past" {{ request('status') == 'past' ? 'selected' : '' }}>Past</option>
                </select>
                <button type="submit" class="btn-add" style="background:#0066cc; padding: 8px 12px;">Filter</button>
            </form>

            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Venue</th>
                        <th>Status</th>
                        <th>Target Audience</th>
                        <th>Course</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($events as $event)
                        <tr>
                            <td>{{ $event->title }}</td>
                            <td>{{ \Carbon\Carbon::parse($event->start_time)->format('F d, Y') }}</td>
                            <td>{{ \Carbon\Carbon::parse($event->end_time)->format('F d, Y') }}</td>
                            <td>{{ $event->venue->name ?? 'N/A' }}</td>
                            <td>
                                @php
                                    // Calculate current status based on time (real-time calculation)
                                    // This ensures status is always accurate regardless of database value
                                    $now = \Carbon\Carbon::now();
                                    
                                    // Parse event times - handle both datetime strings and Carbon instances
                                    $start = \Carbon\Carbon::parse($event->start_time);
                                    $end = \Carbon\Carbon::parse($event->end_time);
                                    
                                    // Ensure all times are in the same timezone
                                    $start->setTimezone($now->timezone);
                                    $end->setTimezone($now->timezone);
                                    
                                    // Calculate status based on current time vs event times
                                    // Use direct comparison (Carbon handles this correctly)
                                    if ($now->lt($start)) {
                                        // Current time is before start time
                                        $currentStatus = 'upcoming';
                                    } elseif ($now->gte($start) && $now->lte($end)) {
                                        // Current time is between start and end (inclusive)
                                        $currentStatus = 'ongoing';
                                    } else {
                                        // Current time is after end time
                                        $currentStatus = 'completed';
                                    }
                                    
                                    // Format for display: capitalize first letter
                                    $displayStatus = ucfirst($currentStatus);
                                @endphp
                                <span class="status {{ $currentStatus }}">{{ $displayStatus }}</span>
                            </td>
                            <td>{{ ucfirst(str_replace('_',' ', $event->target_audience ?? '')) }}</td>
                            <td>{{ strtoupper($event->course ?? '') }}</td>
                            <td class="actions">
                                <a href="{{ route('events.edit', $event->id) }}" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <form action="{{ route('events.destroy', $event->id) }}" method="POST" style="display:inline;">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" title="Delete" onclick="return confirmDelete('{{ $event->title }}')" style="background: none; border: none; padding: 0; margin: 0; cursor: pointer;">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" style="text-align:center; padding: 20px; color: var(--text-primary);">No events found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <script>
        // Improved delete confirmation
        function confirmDelete(eventTitle) {
            return confirm(`Are you sure you want to delete "${eventTitle}"?\n\nThis action cannot be undone and will also delete all related notifications.`);
        }

        // Auto-hide notifications after 5 seconds
        document.addEventListener('DOMContentLoaded', function() {
            const notification = document.getElementById('notification');
            if (notification) {
                setTimeout(function() {
                    notification.style.animation = 'slideOut 0.3s ease-in';
                    setTimeout(function() {
                        notification.remove();
                    }, 300);
                }, 5000);
            }
        });

        // Add slideOut animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        // Auto-refresh page every 60 seconds to update event statuses
        // This ensures statuses are recalculated and updated in the database
        setInterval(function() {
            // Only refresh if user is still on this page (not navigating away)
            if (document.visibilityState === 'visible') {
                window.location.reload();
            }
        }, 60000); // 60 seconds
    </script>
</body>
</html>
