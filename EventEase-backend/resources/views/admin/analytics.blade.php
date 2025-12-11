<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>EventEase Analytics</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f3f4f6;
        }
        .sidebar {
            width: 80px;
            transition: all 0.3s;
        }
        .sidebar:hover {
            width: 250px;
        }
        .sidebar-item {
            @apply flex items-center p-4 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors;
        }
        .sidebar-item i {
            @apply text-xl w-6 text-center;
        }
        .sidebar-item span {
            @apply ml-4 whitespace-nowrap overflow-hidden;
        }
        .stat-card {
            @apply bg-white rounded-lg shadow p-6 flex-1;
        }
        .event-card {
            @apply bg-white rounded-lg shadow overflow-hidden;
        }
        .progress-bar {
            @apply h-2 bg-gray-200 rounded-full overflow-hidden;
        }
        .progress-fill {
            @apply h-full bg-blue-500;
        }
    </style>
</head>

<body class="flex bg-gray-100">
    
    <!-- Sidebar -->
    <div class="sidebar bg-white shadow-md">
        <div class="p-4">
            <div class="text-2xl font-bold text-blue-600 text-center">EE</div>
        </div>
        <nav class="mt-8">
            <a href="#" class="sidebar-item">
                <i class="fas fa-home"></i>
                <span>Dashboard</span>
            </a>
            <a href="#" class="sidebar-item bg-blue-50 text-blue-600">
                <i class="fas fa-calendar-alt"></i>
                <span>Events</span>
            </a>
            <a href="#" class="sidebar-item">
                <i class="fas fa-users"></i>
                <span>Attendees</span>
            </a>
            <a href="#" class="sidebar-item">
                <i class="fas fa-chart-bar"></i>
                <span>Analytics</span>
            </a>
            <a href="#" class="sidebar-item">
                <i class="fas fa-cog"></i>
                <span>Settings</span>
            </a>
        </nav>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto pl-6 pr-6 pt-6">

        <!-- Header -->
        <header class="bg-white shadow-sm rounded-lg">
            <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <h1 class="text-2xl font-semibold text-gray-900">Events</h1>

                <div class="relative w-64">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-search text-gray-400"></i>
                    </div>
                    <input type="text"
                        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Search events...">
                </div>
            </div>
        </header>

        <div class="h-6"></div>

        <!-- Stats -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="stat-card">
                    <div class="text-3xl font-bold">0</div>
                    <div class="text-gray-500 text-sm">Total Events</div>
                </div>
                <div class="stat-card">
                    <div class="text-3xl font-bold">0</div>
                    <div class="text-gray-500 text-sm">Total Reg</div>
                </div>
                <div class="stat-card">
                    <div class="text-3xl font-bold">0</div>
                    <div class="text-gray-500 text-sm">Total Check In</div>
                </div>
                <div class="stat-card">
                    <div class="text-3xl font-bold">A</div>
                    <div class="text-gray-500 text-sm">&nbsp;</div>
                </div>
            </div>
        </section>

        <div class="h-6"></div>

        <!-- Filters -->
        <section class="bg-white shadow-sm rounded-lg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div class="flex space-x-4 overflow-x-auto">
                    <button class="px-4 py-2 text-sm font-medium rounded-full bg-blue-100 text-blue-700">All Events</button>
                    <button class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full">Upcoming</button>
                    <button class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full">Ongoing</button>
                    <button class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full">Completed</button>
                </div>
            </div>
        </section>

        <div class="h-8"></div>

        <!-- Event Cards -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <!-- Event Card Example (your original design kept intact) -->
                <div class="event-card">
                    <div class="p-6">
                        <div class="flex justify-between items-start">
                            <h3 class="text-lg font-medium text-gray-900">Christmas Party 2025</h3>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Upcoming
                            </span>
                        </div>
                        <div class="mt-4 flex items-center text-sm text-gray-500">
                            <i class="far fa-calendar-alt mr-2"></i>
                            <span>Dec 19, 2025</span>
                        </div>
                        <div class="mt-1 flex items-center text-sm text-gray-500">
                            <i class="fas fa-map-marker-alt mr-2"></i>
                            <span>Gymnasium</span>
                        </div>
                        <div class="mt-4">
                            <div class="flex justify-between text-sm text-gray-500 mb-1">
                                <span>0 0 0%</span>
                                <span>Progress 0/0</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 0%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-6 py-3 text-center">
                        <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</button>
                    </div>
                </div>

                <!-- Event Card 2 -->
                <div class="event-card">
                    <div class="p-6">
                        <div class="flex justify-between items-start">
                            <h3 class="text-lg font-medium text-gray-900">CCS Days 2025</h3>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completed
                            </span>
                        </div>
                        <div class="mt-4 flex items-center text-sm text-gray-500">
                            <i class="far fa-calendar-alt mr-2"></i>
                            <span>Oct 30, 2025</span>
                        </div>
                        <div class="mt-1 flex items-center text-sm text-gray-500">
                            <i class="fas fa-map-marker-alt mr-2"></i>
                            <span>Gymnasium</span>
                        </div>
                        <div class="mt-4">
                            <div class="flex justify-between text-sm text-gray-500 mb-1">
                                <span>1 1 100</span>
                                <span>Progress 1/1</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 100%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-6 py-3 text-center">
                        <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</button>
                    </div>
                </div>

                <!-- Event Card 3 -->
                <div class="event-card">
                    <div class="p-6">
                        <div class="flex justify-between items-start">
                            <h3 class="text-lg font-medium text-gray-900">Worship Service By the IT Department</h3>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Upcoming
                            </span>
                        </div>
                        <div class="mt-4 flex items-center text-sm text-gray-500">
                            <i class="far fa-calendar-alt mr-2"></i>
                            <span>Oct 16, 2025</span>
                        </div>
                        <div class="mt-1 flex items-center text-sm text-gray-500">
                            <i class="fas fa-map-marker-alt mr-2"></i>
                            <span>Gymnasium</span>
                        </div>
                        <div class="mt-4">
                            <div class="flex justify-between text-sm text-gray-500 mb-1">
                                <span>0 0 0%</span>
                                <span>Progress 0/0</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 0%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-6 py-3 text-center">
                        <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</button>
                    </div>
                </div>

            </div>
        </section>

    </div>

</body>
</html>
