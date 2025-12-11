@extends('layouts.admin')

@section('content')
<div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">Event Analytics: {{ $event->title }}</h1>
        <a href="{{ route('events.index') }}" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
            Back to Events
        </a>
    </div>

    <!-- Event Info Card -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">Event Details</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <p class="text-gray-600">Date & Time</p>
                <p class="font-medium">{{ $event->start_time->format('F j, Y g:i A') }} - 
                                     {{ $event->end_time->format('g:i A') }}</p>
            </div>
            <div>
                <p class="text-gray-600">Venue</p>
                <p class="font-medium">{{ $event->venue->name }}</p>
            </div>
            <div>
                <p class="text-gray-600">Category</p>
                <p class="font-medium">{{ $event->category->name }}</p>
            </div>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
            <div class="text-3xl font-bold text-blue-600">{{ $totalAttendees }}</div>
            <div class="text-gray-600">Total Registrations</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
            <div class="text-3xl font-bold text-green-600">{{ $checkedInAttendees }}</div>
            <div class="text-gray-600">Checked In</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
            <div class="text-3xl font-bold text-purple-600">{{ $attendanceRate }}%</div>
            <div class="text-gray-600">Attendance Rate</div>
        </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Attendees by Educational Level -->
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Attendees by Educational Level</h2>
            <div class="h-64">
                <canvas id="educationalLevelChart"></canvas>
            </div>
        </div>

        <!-- Check-ins by Hour -->
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Check-ins by Hour</h2>
            <div class="h-64">
                <canvas id="checkInsChart"></canvas>
            </div>
        </div>
    </div>

    <!-- Recent Check-ins -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-semibold">Recent Check-ins</h2>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Educational Level</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checked In At</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    @forelse($event->attendees()->with('user')->whereNotNull('checked_in_at')->latest('checked_in_at')->take(10)->get() as $attendee)
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">{{ $attendee->user->name }}</td>
                            <td class="px-6 py-4 whitespace-nowrap">{{ $attendee->user->email }}</td>
                            <td class="px-6 py-4 whitespace-nowrap">{{ $attendee->user->educational_level ?? 'N/A' }}</td>
                            <td class="px-6 py-4 whitespace-nowrap">{{ $attendee->checked_in_at->format('M j, Y g:i A') }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" class="px-6 py-4 text-center text-gray-500">No check-ins yet</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    // Educational Level Chart
    const eduCtx = document.getElementById('educationalLevelChart').getContext('2d');
    new Chart(eduCtx, {
        type: 'doughnut',
        data: {
            labels: {!! json_encode($attendeesByLevel->keys()) !!},
            datasets: [{
                data: {!! json_encode($attendeesByLevel->values()) !!},
                backgroundColor: [
                    '#3B82F6',
                    '#10B981',
                    '#F59E0B',
                    '#EF4444',
                    '#8B5CF6',
                ],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });

    // Check-ins by Hour Chart
    const checkInCtx = document.getElementById('checkInsChart').getContext('2d');
    new Chart(checkInCtx, {
        type: 'bar',
        data: {
            labels: Object.keys({!! json_encode($checkInsByHour) !!}),
            datasets: [{
                label: 'Check-ins',
                data: Object.values({!! json_encode($checkInsByHour) !!}),
                backgroundColor: '#3B82F6',
                borderColor: '#2563EB',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
</script>
@endpush

<style>
    .chart-container {
        position: relative;
        height: 300px;
    }
</style>
@endsection
