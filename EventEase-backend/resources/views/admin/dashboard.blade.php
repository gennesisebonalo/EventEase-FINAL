<!DOCTYPE html>
<html lang="en" class="h-full bg-gray-900">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>EventEase Admin Dashboard</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary: #5d5fef;
            --primary-hover: #4b4dbf;
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --bg-card: #1e293b;
            --text-primary: #f8fafc;
            --text-secondary: #ffffffff;
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

        .header {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: var(--text-primary);
}

/* Overview Cards */
.overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
    margin-bottom: 30px;
}

.card {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    border-left: 4px solid #2962ff;
    position: relative;
}

.card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card h2 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: #2962ff;
}

.card p {
    margin: 8px 0 0;
    color: #666;
    font-size: 0.95rem;
}

/* Add Button */
.btn-add {
    display: inline-block;
    background-color: var(--primary);
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: bold;
    transition: background-color 0.3s ease;
    margin-bottom: 20px;
}

.btn-add:hover {
    background-color: var(--primary-hover);
}

/* Table */
table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

th, td {
    padding: 16px 20px;
    text-align: left;
    font-size: 0.95rem;
    color: #2c3e50;
}

th {
    background-color: #f0f2f5;
    font-weight: 600;
}

tr:nth-child(even) {
    background-color: #fafbfc;
}

tr:hover {
    background-color: #f4f8ff;
}

/* Modal */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
}

.modal {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-content {
    background: #fff;
    width: 90%;
    max-width: 1000px;
    max-height: 85vh;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;
}

.modal-header h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
}

.modal-body {
    padding: 20px 24px;
    overflow-y: auto;
    flex: 1;
}

.table-wrapper {
    overflow-x: auto;
}

.table-wrapper table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0;
}

.table-wrapper th {
    background-color: #f0f2f5;
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    font-size: 0.875rem;
    color: #2c3e50;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e0e0e0;
}

.table-wrapper td {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 0.9rem;
    color: #2c3e50;
}

.table-wrapper tr:hover {
    background-color: #f8f9fa;
}

/* Delete button styling */
.delete-btn {
    background: #ef4444;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s ease;
}

.delete-btn:hover {
    background: #dc2626;
    transform: scale(1.05);
}

.delete-btn:active {
    transform: scale(0.95);
}

.link {
    color: #2962ff;
    text-decoration: underline;
    background: none;
    border: none;
    cursor: pointer;
}

/* Status badges */
.status {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    display: inline-block;
    min-width: 90px;
    text-align: center;
    text-transform: capitalize;
}

.confirmed {
    background-color: #e0f7e9;
    color: #2e7d32;
}

.pending {
    background-color: #fff3cd;
    color: #ff9800;
}

.cancelled {
    background-color: #fdecea;
    color: #c62828;
}

/* Actions */
.actions a,
.actions button {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1.1rem;
    color: #555;
    transition: color 0.2s ease;
}

.actions a:hover,
.actions button:hover {
    color: #2962ff;
}

/* Notification animations */
@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

    </style>
    <script src="https://js.pusher.com/8.2.0/pusher.min.js"></script>
</head>
<body>
    <div class="container">
        <!-- Sidebar -->
        <div class="sidebar">
            <a href="/admin" class="active" title="Dashboard">
                <i class="fas fa-home"></i>
            </a>
            <a href="{{ route('events.index') }}" title="Events">
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
            <div class="header">EventEase Admin Dashboard</div>

            <!-- Overview Cards -->
            <div class="overview">
                <div class="card" id="ongoing-events-card" onclick="showEventsList('ongoing')" style="cursor: pointer; border-left-color: #10b981;">
                    <h2 id="ongoing-events-count" style="color: #10b981;">...</h2>
                    <p>Ongoing Events</p>
                    <div class="loading-spinner" style="display: none;">⏳</div>
                </div>
                <div class="card" id="upcoming-events-card" onclick="showEventsList('upcoming')" style="cursor: pointer; border-left-color: #3b82f6;">
                    <h2 id="upcoming-events-count" style="color: #3b82f6;">...</h2>
                    <p>Upcoming Events</p>
                    <div class="loading-spinner" style="display: none;">⏳</div>
                </div>
                <div class="card" id="completed-events-card" onclick="showEventsList('completed')" style="cursor: pointer; border-left-color: #6b7280;">
                    <h2 id="completed-events-count" style="color: #6b7280;">...</h2>
                    <p>Completed Events</p>
                    <div class="loading-spinner" style="display: none;">⏳</div>
                </div>
                <div class="card" id="registrations-card" onclick="showUsersList()" style="cursor: pointer; border-left-color: #8b5cf6;">
                    <h2 id="registrations-count" style="color: #8b5cf6;">...</h2>
                    <p>Registrations</p>
                    <div class="loading-spinner" style="display: none;">⏳</div>
                </div>
            </div>

            <!-- Manage Events Table -->
            <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 20px;">
                <!-- Search and Filter -->
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="text" id="search-input" placeholder="Search events..." style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; width: 200px;">
                    <select id="status-filter" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
                        <option value="">All Status</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                    </select>
                    <button onclick="refreshEvents()" style="padding: 8px 12px; background: #2962ff; color: white; border: none; border-radius: 6px; cursor: pointer;">🔄 Refresh</button>
                </div>
            </div>
            
            <div id="events-table-container">
                <table id="events-table">
                <thead>
                    <tr>
                        <th>Event Name</th>
                        <th>Date</th>
                        <th>Venue</th>
                        <th>Status</th>
                        <th>Attendees</th>
                    </tr>
                </thead>
                <tbody id="events-tbody">
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 20px;">
                            <div id="table-loading">Loading events...</div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Events List Modal -->
    <div id="events-list-modal-backdrop" class="modal-backdrop" style="display:none;" onclick="closeEventsListModal()"></div>
    <div id="events-list-modal" class="modal" style="display:none;">
        <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="events-list-modal-title">
            <div class="modal-header">
                <h3 id="events-list-modal-title" style="margin:0;font-size:1.1rem;font-weight:600;">Events</h3>
                <button onclick="closeEventsListModal()" aria-label="Close" style="font-size:1.2rem;cursor:pointer;background:none;border:none;">✕</button>
            </div>
            <div class="modal-body">
                <div id="events-list-loading" style="padding:20px;text-align:center;color:#666;display:none;">Loading events…</div>
                <div class="table-wrapper" style="overflow:auto;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr>
                                <th>Event Name</th>
                                <th>Date</th>
                                <th>Venue</th>
                                <th>Status</th>
                                <th>Attendees</th>
                            </tr>
                        </thead>
                        <tbody id="events-list-tbody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Users List Modal -->
    <div id="users-list-modal-backdrop" class="modal-backdrop" style="display:none;" onclick="closeUsersListModal()"></div>
    <div id="users-list-modal" class="modal" style="display:none;">
        <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="users-list-modal-title">
            <div class="modal-header">
                <h3 id="users-list-modal-title" style="margin:0;font-size:1.1rem;font-weight:600;">Registered Users</h3>
                <button onclick="closeUsersListModal()" aria-label="Close" style="font-size:1.2rem;cursor:pointer;background:none;border:none;">✕</button>
            </div>
            <div class="modal-body">
                <div id="users-list-loading" style="padding:20px;text-align:center;color:#666;display:none;">Loading users…</div>
                <div class="table-wrapper" style="overflow:auto;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Education Level</th>
                                <th>Year Level</th>
                                <th>Block</th>
                                <th>Department</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="users-list-tbody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Attendees Modal -->
    <div id="attendees-modal-backdrop" class="modal-backdrop" style="display:none;" onclick="closeAttendeesModal()"></div>
    <div id="attendees-modal" class="modal" style="display:none;">
        <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="attendees-modal-title">
            <div class="modal-header">
                <h3 id="attendees-modal-title" style="margin:0;font-size:1.1rem;font-weight:600;">Attendees</h3>
                <button onclick="closeAttendeesModal()" aria-label="Close" style="font-size:1.2rem;cursor:pointer;background:none;border:none;">✕</button>
            </div>
            <div class="modal-body">
                <div id="attendees-loading" style="padding:20px;text-align:center;color:#666;display:none;">Loading attendees…</div>
                <div class="table-wrapper" style="overflow:auto;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Educational Level</th>
                                <th>Year</th>
                                <th>Block</th>
                                <th>Status</th>
                                <th>Checked In At</th>
                            </tr>
                        </thead>
                        <tbody id="attendees-tbody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Global variables for state management
        let currentSortBy = 'created_at';
        let currentSortOrder = 'desc';
        let currentPage = 1;
        let isLoading = false;

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            loadDashboardData();
            loadEventsData();
            
            // Set up real-time updates every 30 seconds
            setInterval(() => {
                loadDashboardData();
                loadEventsData();
            }, 30000);
            
            // Set up search and filter event listeners
            document.getElementById('search-input').addEventListener('input', debounce(loadEventsData, 500));
            document.getElementById('status-filter').addEventListener('change', loadEventsData);
        });

        // Load dashboard overview data
        async function loadDashboardData() {
            try {
                showLoadingSpinners();
                const response = await fetch('/api/dashboard/overview');
                const result = await response.json();
                
                if (result.success) {
                    const data = result.data;
            
                    // Animate number changes
                    animateNumber('ongoing-events-count', data.ongoing_events);
                    animateNumber('upcoming-events-count', data.upcoming_events);
                    animateNumber('completed-events-count', data.completed_events);
                    animateNumber('registrations-count', data.total_registrations);
                } else {
                    console.error('Failed to load dashboard data:', result.error);
                }
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                hideLoadingSpinners();
            }
        }

        // Load events data with filtering and sorting
        async function loadEventsData() {
            if (isLoading) return;
            
            isLoading = true;
            try {
                const searchTerm = document.getElementById('search-input')?.value || '';
                const statusFilter = document.getElementById('status-filter')?.value || '';
                
                const params = new URLSearchParams({
                    search: searchTerm,
                    status: statusFilter,
                    sort_by: currentSortBy,
                    sort_order: currentSortOrder,
                    page: currentPage,
                    per_page: 10
                });
                
                // Show loading state in table
                const tbody = document.getElementById('events-tbody');
                const tableLoading = document.getElementById('table-loading');
                if (tableLoading) {
                    tableLoading.textContent = 'Loading events...';
                } else {
                    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;"><div id="table-loading">Loading events...</div></td></tr>';
                }
                
                const response = await fetch(`/api/events/list?${params}`);
                const result = await response.json();
                
                if (result.success) {
                    renderEventsTable(result.data.events, result.data.pagination);
                } else {
                    console.error('Failed to load events:', result.error);
                    tbody.innerHTML = 
                        '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load events</td></tr>';
                }
            } catch (error) {
                console.error('Error loading events:', error);
                const tbody = document.getElementById('events-tbody');
                tbody.innerHTML = 
                    '<tr><td colspan="6" style="text-align: center; color: red;">Error loading events</td></tr>';
            } finally {
                isLoading = false;
            }
        }

        // Render events table
        function renderEventsTable(events, pagination) {
            const tbody = document.getElementById('events-tbody');
            
            if (events.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No events found</td></tr>';
                return;
            }
            
            let html = '';
            events.forEach(event => {
                const statusClass = event.status === 'upcoming' ? 'pending' : 
                                  event.status === 'ongoing' ? 'confirmed' : 'cancelled';
                
                html += `
                    <tr>
                        <td>${event.title}</td>
                        <td>${event.date}</td>
                        <td>${event.location}</td>
                        <td><span class="status ${statusClass}">${event.status}</span></td>
                        <td>
                            <button class="link attendees-link" data-id="${event.id}" data-title="${String(event.title).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}">
                                ${event.attendees_count}
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            tbody.innerHTML = html;
            // Attach delegated click handler for attendees links
            document.getElementById('events-tbody').addEventListener('click', function(e) {
                const t = e.target;
                const target = (t && t.closest) ? t : (t && t.parentElement ? t.parentElement : null);
                const btn = target && target.closest ? target.closest('.attendees-link') : null;
                if (btn) {
                    const id = btn.getAttribute('data-id');
                    const title = btn.getAttribute('data-title') || '';
                    if (id) openAttendeesModal(id, title);
                }
            }, { once: true });
        }

        // Sort table
        function sortTable(field) {
            if (currentSortBy === field) {
                currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortBy = field;
                currentSortOrder = 'asc';
            }
            currentPage = 1;
            loadEventsData();
        }

        // Refresh events
        function refreshEvents() {
            loadEventsData();
        }

        // Mark event as completed
        async function markEventCompleted(eventId) {
            if (!confirm('Are you sure you want to mark this event as completed?')) return;
            
            try {
                const response = await fetch(`/api/events/${eventId}/complete`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Event marked as completed successfully!');
                    loadEventsData();
                    loadDashboardData();
                } else {
                    alert('Failed to mark event as completed: ' + result.message);
                }
            } catch (error) {
                console.error('Error marking event as completed:', error);
                alert('Error marking event as completed');
            }
        }

        // Delete event
        async function deleteEvent(eventId) {
            if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
            
            try {
                const response = await fetch(`/api/events/${eventId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                });
                
                if (response.ok) {
                    alert('Event deleted successfully!');
                    loadEventsData();
                    loadDashboardData();
                } else {
                    alert('Failed to delete event');
                }
            } catch (error) {
                console.error('Error deleting event:', error);
                alert('Error deleting event');
            }
        }

        // Animate number changes
        function animateNumber(elementId, newValue) {
            const element = document.getElementById(elementId);
            const currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
            
            if (currentValue === newValue) return;
            
            const duration = 1000;
            const startTime = performance.now();
            
            function updateNumber(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const current = Math.round(currentValue + (newValue - currentValue) * progress);
                element.textContent = current.toLocaleString();
                
                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                }
            }
            
            requestAnimationFrame(updateNumber);
        }

        // Show/hide loading spinners
        function showLoadingSpinners() {
            document.querySelectorAll('.loading-spinner').forEach(spinner => {
                spinner.style.display = 'inline';
            });
        }

        function hideLoadingSpinners() {
            document.querySelectorAll('.loading-spinner').forEach(spinner => {
                spinner.style.display = 'none';
            });
        }

        // Attendees modal logic
        let attendeesPollInterval = null;
        let previousAttendeeCount = 0;
        let previousAttendeeIds = new Set();

        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            const bgColor = type === 'success' ? '#10b981' : '#ef4444';
            notification.style.cssText = `position:fixed;top:20px;right:20px;background:${bgColor};color:white;padding:12px 20px;border-radius:8px;z-index:10000;box-shadow:0 4px 12px rgba(0,0,0,0.3);animation:slideIn 0.3s ease-out;font-size:14px;font-weight:500;`;
            notification.textContent = message;
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        async function fetchAndRenderAttendees(eventId) {
            const tbody = document.getElementById('attendees-tbody');
            const loading = document.getElementById('attendees-loading');
            try {
                loading.style.display = 'block';
                const res = await fetch(`/api/events/${eventId}/attendees`);
                const result = await res.json();
                loading.style.display = 'none';
                if (result.success) {
                    const attendees = result.data.attendees || [];
                    const currentAttendeeIds = new Set(attendees.map(a => a.id));
                    
                    // Detect new attendees
                    if (previousAttendeeIds.size > 0) {
                        const newAttendees = attendees.filter(a => !previousAttendeeIds.has(a.id));
                        if (newAttendees.length > 0) {
                            showNotification(`🔔 ${newAttendees.length} new attendee${newAttendees.length !== 1 ? 's' : ''} joined!`);
                        }
                    }
                    
                    previousAttendeeIds = currentAttendeeIds;
                    
                    if (!attendees.length) {
                        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#666;">No attendees found</td></tr>';
                        console.log('Attendees loaded: 0 attendees');
                    } else {
                        tbody.innerHTML = attendees.map(a => `
                            <tr>
                                <td>${a.name ?? '—'}</td>
                                <td>${a.education_level ?? '—'}</td>
                                <td>${a.year_level ?? '—'}</td>
                                <td>${a.block ?? '—'}</td>
                                <td style="text-transform:capitalize;">${a.status}</td>
                                <td>${a.checked_in_at ?? '—'}</td>
                            </tr>
                        `).join('');
                        console.log(`Attendees loaded successfully: ${attendees.length} attendees`);
                        
                        // Show notification on first load
                        if (previousAttendeeCount === 0 && attendees.length > 0) {
                            showNotification(`✓ Loaded ${attendees.length} attendee${attendees.length !== 1 ? 's' : ''}`);
                        }
                        
                        previousAttendeeCount = attendees.length;
                    }
                } else {
                    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">Failed to fetch attendees</td></tr>';
                    console.error('Failed to fetch attendees:', result.error || result.message);
                    showNotification('Failed to fetch attendees', 'error');
                }
            } catch (e) {
                loading.style.display = 'none';
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">Error fetching attendees</td></tr>';
                console.error('Error fetching attendees:', e);
                showNotification('Error fetching attendees', 'error');
            }
        }

        async function openAttendeesModal(eventId, title) {
            const backdrop = document.getElementById('attendees-modal-backdrop');
            const modal = document.getElementById('attendees-modal');
            const titleEl = document.getElementById('attendees-modal-title');
            const tbody = document.getElementById('attendees-tbody');
            const loading = document.getElementById('attendees-loading');
            titleEl.textContent = `Attendees • ${title}`;
            tbody.innerHTML = '';
            loading.style.display = 'block';
            backdrop.style.display = 'block';
            modal.style.display = 'flex';
            // Reset tracking variables
            previousAttendeeCount = 0;
            previousAttendeeIds = new Set();
            await fetchAndRenderAttendees(eventId);
            // Start polling every 5s while modal is open
            attendeesPollInterval = setInterval(() => fetchAndRenderAttendees(eventId), 5000);
        }

        function closeAttendeesModal() {
            document.getElementById('attendees-modal-backdrop').style.display = 'none';
            const modal = document.getElementById('attendees-modal');
            modal.style.display = 'none';
            if (attendeesPollInterval) {
                clearInterval(attendeesPollInterval);
                attendeesPollInterval = null;
            }
            // Reset tracking variables
            previousAttendeeCount = 0;
            previousAttendeeIds = new Set();
        }

        // Show events list modal based on status
        async function showEventsList(status) {
            const backdrop = document.getElementById('events-list-modal-backdrop');
            const modal = document.getElementById('events-list-modal');
            const titleEl = document.getElementById('events-list-modal-title');
            const tbody = document.getElementById('events-list-tbody');
            const loading = document.getElementById('events-list-loading');
            
            const statusLabels = {
                'ongoing': 'Ongoing Events',
                'upcoming': 'Upcoming Events',
                'completed': 'Completed Events'
            };
            
            titleEl.textContent = statusLabels[status] || 'Events';
            tbody.innerHTML = '';
            loading.style.display = 'block';
            backdrop.style.display = 'block';
            modal.style.display = 'flex';
            
            try {
                const now = new Date().toISOString();
                let url = '/api/events/list?per_page=100';
                
                if (status === 'ongoing') {
                    url += `&status=ongoing`;
                } else if (status === 'upcoming') {
                    url += `&status=upcoming`;
                } else if (status === 'completed') {
                    url += `&status=completed`;
                }
                
                const res = await fetch(url);
                const result = await res.json();
                loading.style.display = 'none';
                
                if (result.success && result.data.events) {
                    const events = result.data.events;
                    if (!events.length) {
                        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#666;">No events found</td></tr>';
                    } else {
                        tbody.innerHTML = events.map(e => {
                            const startTime = e.start_time ? new Date(e.start_time) : null;
                            const dateStr = startTime ? startTime.toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : 'N/A';
                            
                            return `
                                <tr>
                                    <td>${e.title || '—'}</td>
                                    <td>${dateStr}</td>
                                    <td>${e.location || '—'}</td>
                                    <td style="text-transform:capitalize;">${e.status || '—'}</td>
                                    <td>${e.attendees_count || 0}</td>
                                </tr>
                            `;
                        }).join('');
                    }
                } else {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red;">Failed to fetch events</td></tr>';
                }
            } catch (e) {
                loading.style.display = 'none';
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red;">Error fetching events</td></tr>';
                console.error('Error fetching events:', e);
            }
        }

        function closeEventsListModal() {
            document.getElementById('events-list-modal-backdrop').style.display = 'none';
            document.getElementById('events-list-modal').style.display = 'none';
        }

        // Show users list modal
        async function showUsersList() {
            const backdrop = document.getElementById('users-list-modal-backdrop');
            const modal = document.getElementById('users-list-modal');
            const tbody = document.getElementById('users-list-tbody');
            const loading = document.getElementById('users-list-loading');
            
            tbody.innerHTML = '';
            loading.style.display = 'block';
            backdrop.style.display = 'block';
            modal.style.display = 'flex';
            
            await loadUsersList();
        }

        // Load users list
        async function loadUsersList() {
            const tbody = document.getElementById('users-list-tbody');
            const loading = document.getElementById('users-list-loading');
            
            try {
                loading.style.display = 'block';
                const res = await fetch('/api/users');
                const result = await res.json();
                loading.style.display = 'none';
                
                if (result.success && result.data) {
                    const users = result.data;
                    if (!users.length) {
                        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#666;">No users found</td></tr>';
                    } else {
                        tbody.innerHTML = users.map(u => `
                            <tr id="user-row-${u.id}">
                                <td>${u.name || '—'}</td>
                                <td>${u.email || '—'}</td>
                                <td>${u.education_level || '—'}</td>
                                <td>${u.year_level || '—'}</td>
                                <td>${u.block || '—'}</td>
                                <td>${u.department || '—'}</td>
                                <td>
                                    <button onclick="deleteUser(${u.id}, '${String(u.name || u.email || 'User').replace(/'/g, "\\'").replace(/"/g, '&quot;')}')" 
                                            class="delete-btn"
                                            title="Delete User">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </td>
                            </tr>
                        `).join('');
                    }
                } else {
                    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:red;">Failed to fetch users</td></tr>';
                }
            } catch (e) {
                loading.style.display = 'none';
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:red;">Error fetching users</td></tr>';
                console.error('Error fetching users:', e);
            }
        }

        // Delete user function
        async function deleteUser(userId, userName) {
            if (!confirm(`Are you sure you want to delete user "${userName}"?\n\nThis will permanently delete:\n- User account\n- All attendance records\n- All notifications\n\nThis action cannot be undone!`)) {
                return;
            }

            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                const response = await fetch(`/api/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                const result = await response.json();

                if (result.success) {
                    // Remove the row from the table
                    const row = document.getElementById(`user-row-${userId}`);
                    if (row) {
                        row.style.transition = 'opacity 0.3s';
                        row.style.opacity = '0';
                        setTimeout(() => {
                            row.remove();
                            // Check if table is empty
                            const remainingRows = document.querySelectorAll('#users-list-tbody tr').length;
                            if (remainingRows === 0) {
                                document.getElementById('users-list-tbody').innerHTML = '<tr><td colspan="7" style="text-align:center;color:#666;">No users found</td></tr>';
                            }
                        }, 300);
                    }

                    // Show success notification
                    showNotification(`User "${userName}" deleted successfully`, 'success');
                    
                    // Refresh dashboard to update registration count
                    loadDashboardData();
                } else {
                    showNotification(`Failed to delete user: ${result.message || 'Unknown error'}`, 'error');
                }
            } catch (e) {
                console.error('Error deleting user:', e);
                showNotification('Error deleting user. Please try again.', 'error');
            }
        }

        function closeUsersListModal() {
            document.getElementById('users-list-modal-backdrop').style.display = 'none';
            document.getElementById('users-list-modal').style.display = 'none';
        }

        // Debounce function for search
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // Pusher for real-time updates (only if configured)
        (function initPusher() {
            try {
                var APP_KEY = '{{ env('PUSHER_APP_KEY') }}';
                var APP_CLUSTER = '{{ env('PUSHER_APP_CLUSTER') }}';
                if (!APP_KEY || !APP_CLUSTER) {
                    console.log('Pusher not configured, skipping (using polling).');
                    return;
                }
                Pusher.logToConsole = false;
                var pusher = new Pusher(APP_KEY, {
                    cluster: APP_CLUSTER,
                    forceTLS: true,
                });
                var channel = pusher.subscribe('events');
                channel.bind('App\\\Events\\\NewEventCreated', function(data) {
                    try {
                        alert('A new event has been created: ' + (data && data.event ? data.event.title : 'New Event'));
                        loadEventsData();
                        loadDashboardData();
                    } catch (e) { /* no-op */ }
                });
            } catch (error) {
                console.log('Pusher init failed, continuing without realtime.');
            }
        })();
    </script>
</body>
</html>
