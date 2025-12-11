@extends('layouts.admin')

@section('title', 'Attendance Management')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Event Attendance Overview</h3>
                </div>
                <div class="card-body">
                    @if($events->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>Event Title</th>
                                        <th>Venue</th>
                                        <th>Date</th>
                                        <th>Total Attendees</th>
                                        <th>Present</th>
                                        <th>Absent</th>
                                        <th>Pending</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($events as $event)
                                        @php
                                            $attendance = \App\Models\Attendee::where('event_id', $event->id)->get();
                                            $present = $attendance->where('status', 'present')->count();
                                            $absent = $attendance->where('status', 'absent')->count();
                                            $pending = $attendance->where('status', 'pending')->count();
                                        @endphp
                                        <tr>
                                            <td>{{ $event->title }}</td>
                                            <td>{{ $event->venue->name ?? 'N/A' }}</td>
                                            <td>{{ \Carbon\Carbon::parse($event->start_time)->format('M d, Y H:i') }}</td>
                                            <td>{{ $attendance->count() }}</td>
                                            <td>
                                                <span class="badge badge-success">{{ $present }}</span>
                                            </td>
                                            <td>
                                                <span class="badge badge-danger">{{ $absent }}</span>
                                            </td>
                                            <td>
                                                <span class="badge badge-warning">{{ $pending }}</span>
                                            </td>
                                            <td>
                                                <a href="{{ route('admin.attendance.show', $event->id) }}" 
                                                   class="btn btn-sm btn-primary">
                                                    View Details
                                                </a>
                                                <a href="{{ route('admin.attendance.export', $event->id) }}" 
                                                   class="btn btn-sm btn-success">
                                                    Export CSV
                                                </a>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <div class="text-center py-4">
                            <p class="text-muted">No events found.</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
