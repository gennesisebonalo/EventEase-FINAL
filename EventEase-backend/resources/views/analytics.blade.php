<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EventEase Analytics Dashboard</title>
    
    <!-- Chart.js CDN -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #F8FAFC;
            color: #1F2937;
        }

        .dashboard-container {
            display: flex;
            min-height: 100vh;
        }

        /* Sidebar */
        .sidebar {
            width: 80px;
            background: white;
            border-right: 1px solid #E5E7EB;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 20px;
        }

        .sidebar-item {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 50px;
            height: 50px;
            margin: 10px 0;
            border-radius: 12px;
            color: #6B7280;
            font-size: 1.2rem;
            text-decoration: none;
            transition: all 0.2s;
        }

        .sidebar-item:hover,
        .sidebar-item.active {
            background-color: #EFF6FF;
            color: #3B82F6;
        }

        /* Main Content */
        .main-content {
            flex: 1;
            padding: 30px;
        }

        .page-header {
            margin-bottom: 30px;
        }

        .page-title {
            font-size: 2rem;
            font-weight: bold;
            color: #1F2937;
            margin-bottom: 8px;
        }

        .page-subtitle {
            color: #6B7280;
            font-size: 1rem;
        }

        /* Metrics Cards */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .metric-card {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #E5E7EB;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .metric-value {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 8px;
        }

        .metric-label {
            color: #6B7280;
            font-size: 0.875rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .metric-card.total-events .metric-value { color: #3B82F6; }
        .metric-card.total-attendees .metric-value { color: #10B981; }
        .metric-card.ongoing-events .metric-value { color: #F59E0B; }
        .metric-card.feedback-score .metric-value { color: #EF4444; }

        /* Chart Section */
        .chart-section {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #E5E7EB;
        }

        .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .chart-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1F2937;
        }

        .refresh-button {
            background: #3B82F6;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .refresh-button:hover {
            background: #2563EB;
        }

        .chart-container {
            position: relative;
            height: 400px;
        }

        /* Loading States */
        .loading {
            opacity: 0.6;
            pointer-events: none;
        }

        .loading::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            margin: -10px 0 0 -10px;
            border: 2px solid #E5E7EB;
            border-top: 2px solid #3B82F6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .main-content {
                padding: 20px;
            }
            
            .metrics-grid {
                grid-template-columns: 1fr;
            }
            
            .chart-container {
                height: 300px;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <!-- Sidebar -->
        <div class="sidebar">
            <a href="/admin" class="sidebar-item">🏠</a>
            <a href="/admin/events" class="sidebar-item">📅</a>
            <a href="/admin/attendees" class="sidebar-item">👥</a>
            <a href="/analytics" class="sidebar-item active">📊</a>
            <a href="#" class="sidebar-item">⚙️</a>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Page Header -->
            <div class="page-header">
                <h1 class="page-title">Analytics Overview</h1>
                <p class="page-subtitle">Real-time event statistics and insights</p>
            </div>

            <!-- Metrics Cards -->
            <div class="metrics-grid">
                <div class="metric-card total-events">
                    <div class="metric-value" id="totalEvents">0</div>
                    <div class="metric-label">Total Events</div>
                </div>
                
                <div class="metric-card total-attendees">
                    <div class="metric-value" id="totalAttendees">0</div>
                    <div class="metric-label">Total Attendees</div>
                </div>
                
                <div class="metric-card ongoing-events">
                    <div class="metric-value" id="ongoingEvents">0</div>
                    <div class="metric-label">Ongoing Events</div>
                </div>
                
                <div class="metric-card feedback-score">
                    <div class="metric-value" id="feedbackScore">0.0</div>
                    <div class="metric-label">Feedback Score</div>
                </div>
            </div>

            <!-- Chart Section -->
            <div class="chart-section">
                <div class="chart-header">
                    <h2 class="chart-title">Event Attendance Trends</h2>
                    <button class="refresh-button" id="refresh-analytics">Refresh</button>
                </div>
                <div class="chart-container">
                    <canvas id="attendanceChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <!-- Include the analytics dashboard script -->
    <script src="/js/analytics-dashboard.js"></script>
</body>
</html>
