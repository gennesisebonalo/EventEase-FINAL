@extends('layouts.admin')

@section('title', 'Event Attendance Details')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">{{ $event->title }} - Attendance Details</h3>
                    <div class="card-tools">
                        <a href="{{ route('admin.attendance.index') }}" class="btn btn-sm btn-secondary">
                            Back to List
                        </a>
                        <a href="{{ route('admin.attendance.export', $event->id) }}" class="btn btn-sm btn-success">
                            Export CSV
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <!-- Event Info -->
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h5>Event Information</h5>
                            <p><strong>Venue:</strong> {{ $event->venue->name ?? 'N/A' }}</p>
                            <p><strong>Date:</strong> {{ \Carbon\Carbon::parse($event->start_time)->format('M d, Y H:i') }}</p>
                            <p><strong>End Time:</strong> {{ \Carbon\Carbon::parse($event->end_time)->format('M d, Y H:i') }}</p>
                        </div>
                        <div class="col-md-6">
                            <h5>Attendance Summary</h5>
                            <div class="row">
                                <div class="col-3">
                                    <div class="info-box">
                                        <span class="info-box-icon bg-success"><i class="fas fa-check"></i></span>
                                        <div class="info-box-content">
                                            <span class="info-box-text">Present</span>
                                            <span class="info-box-number">{{ $summary['present'] }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-3">
                                    <div class="info-box">
                                        <span class="info-box-icon bg-danger"><i class="fas fa-times"></i></span>
                                        <div class="info-box-content">
                                            <span class="info-box-text">Absent</span>
                                            <span class="info-box-number">{{ $summary['absent'] }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-3">
                                    <div class="info-box">
                                        <span class="info-box-icon bg-warning"><i class="fas fa-clock"></i></span>
                                        <div class="info-box-content">
                                            <span class="info-box-text">Pending</span>
                                            <span class="info-box-number">{{ $summary['pending'] }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-3">
                                    <div class="info-box">
                                        <span class="info-box-icon bg-info"><i class="fas fa-users"></i></span>
                                        <div class="info-box-content">
                                            <span class="info-box-text">Total</span>
                                            <span class="info-box-number">{{ $summary['total'] }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Attendance List -->
                    @if($attendance->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Student ID</th>
                                        <th>Status</th>
                                        <th>Reason</th>
                                        <th>Checked In</th>
                                        <th>Declined At</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($attendance as $record)
                                        <tr>
                                            <td>{{ $record->user->name }}</td>
                                            <td>{{ $record->user->email }}</td>
                                            <td>{{ $record->user->student_id ?? 'N/A' }}</td>
                                            <td>
                                                @if($record->status === 'present')
                                                    <span class="badge badge-success">Present</span>
                                                @elseif($record->status === 'absent')
                                                    <span class="badge badge-danger">Absent</span>
                                                @else
                                                    <span class="badge badge-warning">Pending</span>
                                                @endif
                                            </td>
                                            <td>{{ $record->reason ?? '-' }}</td>
                                            <td>
                                                @if($record->checked_in_at)
                                                    {{ $record->checked_in_at->format('M d, Y H:i') }}
                                                @else
                                                    -
                                                @endif
                                            </td>
                                            <td>
                                                @if($record->declined_at)
                                                    {{ $record->declined_at->format('M d, Y H:i') }}
                                                @else
                                                    -
                                                @endif
                                            </td>
                                            <td>
                                                @if($record->evidence_image)
                                                    <a href="{{ Storage::url($record->evidence_image) }}" 
                                                       target="_blank" class="btn btn-sm btn-info">
                                                        View Evidence
                                                    </a>
                                                @endif
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <div class="text-center py-4">
                            <p class="text-muted">No attendance records found for this event.</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
