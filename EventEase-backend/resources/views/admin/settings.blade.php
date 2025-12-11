<!DOCTYPE html>
<html lang="en" class="h-full bg-gray-900">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Settings - EventEase Admin</title>
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

        .settings-section {
            background: white;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        }

        .settings-section h2 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #2c3e50;
            margin: 0 0 20px 0;
            padding-bottom: 12px;
            border-bottom: 2px solid #f0f2f5;
        }

        .settings-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 0;
            border-bottom: 1px solid #f0f2f5;
        }

        .settings-item:last-child {
            border-bottom: none;
        }

        .settings-item-label {
            flex: 1;
        }

        .settings-item-label h3 {
            font-size: 1rem;
            font-weight: 600;
            color: #2c3e50;
            margin: 0 0 4px 0;
        }

        .settings-item-label p {
            font-size: 0.875rem;
            color: #666;
            margin: 0;
        }

        .settings-item-action {
            margin-left: 20px;
        }

        .btn {
            padding: 8px 16px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        .btn-primary {
            background-color: var(--primary);
            color: white;
        }

        .btn-primary:hover {
            background-color: var(--primary-hover);
        }

        .btn-secondary {
            background-color: #e0e0e0;
            color: #2c3e50;
        }

        .btn-secondary:hover {
            background-color: #d0d0d0;
        }

        .btn-danger {
            background-color: var(--danger);
            color: white;
        }

        .btn-danger:hover {
            background-color: #dc2626;
        }

        .input-group {
            margin-bottom: 16px;
        }

        .input-group label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            color: #2c3e50;
            margin-bottom: 6px;
        }

        .input-group input,
        .input-group select,
        .input-group textarea {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 0.875rem;
            color: #2c3e50;
            transition: border-color 0.2s ease;
        }

        .input-group input:focus,
        .input-group select:focus,
        .input-group textarea:focus {
            outline: none;
            border-color: var(--primary);
        }

        .input-group textarea {
            resize: vertical;
            min-height: 100px;
        }

        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-size: 0.875rem;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease-out;
        }

        .notification.success {
            background-color: var(--success);
        }

        .notification.error {
            background-color: var(--danger);
        }

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
            <a href="{{ route('analytics.index') }}" title="Analytics">
                <i class="fas fa-chart-bar"></i>
            </a>
            <a href="{{ route('rfid.reader') }}" title="RFID Card Registration">
                <i class="fas fa-id-card"></i>
            </a>
            <a href="{{ route('rfid.attendance') }}" title="RFID Attendance">
                <i class="fas fa-clipboard-check"></i>
            </a>
            <a href="{{ route('admin.settings') }}" class="active" title="Settings">
                <i class="fas fa-cog"></i>
            </a>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <div class="header">Settings</div>

            <!-- General Settings -->
            <div class="settings-section">
                <h2><i class="fas fa-cog"></i> General Settings</h2>
                
                <div class="settings-item">
                    <div class="settings-item-label">
                        <h3>Application Name</h3>
                        <p>EventEase - Event Management System</p>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-label">
                        <h3>Version</h3>
                        <p>1.0.0</p>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-label">
                        <h3>Environment</h3>
                        <p>{{ app()->environment() }}</p>
                    </div>
                </div>
            </div>

            <!-- Notification Settings -->
            <div class="settings-section">
                <h2><i class="fas fa-bell"></i> Notification Settings</h2>
                
                <div class="settings-item">
                    <div class="settings-item-label">
                        <h3>Real-time Notifications</h3>
                        <p>Enable real-time event notifications via Pusher</p>
                    </div>
                    <div class="settings-item-action">
                        <span id="pusher-status" style="padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; background: #e0e0e0; color: #2c3e50;">
                            {{ env('PUSHER_APP_KEY') ? 'Enabled' : 'Disabled' }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- System Information -->
            <div class="settings-section">
                <h2><i class="fas fa-info-circle"></i> System Information</h2>
                
                <div class="settings-item">
                    <div class="settings-item-label">
                        <h3>PHP Version</h3>
                        <p>{{ phpversion() }}</p>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-label">
                        <h3>Laravel Version</h3>
                        <p>{{ app()->version() }}</p>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-label">
                        <h3>Server Time</h3>
                        <p id="server-time">{{ now()->format('Y-m-d H:i:s') }}</p>
                    </div>
                </div>
            </div>

            <!-- Help & Support -->
            <div class="settings-section">
                <h2><i class="fas fa-question-circle"></i> Help & Support</h2>
                
                <div class="settings-item">
                    <div class="settings-item-label">
                        <h3>Documentation</h3>
                        <p>View system documentation and user guides</p>
                    </div>
                    <div class="settings-item-action">
                        <button class="btn btn-secondary" onclick="alert('Documentation coming soon!')">
                            View Docs
                        </button>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-label">
                        <h3>Contact Support</h3>
                        <p>Get help from the support team</p>
                    </div>
                    <div class="settings-item-action">
                        <button class="btn btn-secondary" onclick="alert('Support: support@eventease.com')">
                            Contact
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Update server time every second
        setInterval(function() {
            const now = new Date();
            document.getElementById('server-time').textContent = now.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }, 1000);

        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    </script>
</body>
</html>

