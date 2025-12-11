<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Attendees Report</title>
    <style>
        @page {
            margin: 20mm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 10pt;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #5d5fef;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            color: #5d5fef;
            font-size: 18pt;
        }
        .header p {
            margin: 5px 0;
            color: #666;
            font-size: 9pt;
        }
        .filters {
            margin-bottom: 15px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }
        .filters strong {
            color: #5d5fef;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th {
            background-color: #5d5fef;
            color: white;
            padding: 8px;
            text-align: left;
            font-size: 9pt;
            border: 1px solid #ddd;
        }
        td {
            padding: 6px;
            border: 1px solid #ddd;
            font-size: 8pt;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .status {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 7pt;
            font-weight: bold;
            display: inline-block;
        }
        .status-present {
            background-color: #10b981;
            color: white;
        }
        .status-absent {
            background-color: #ef4444;
            color: white;
        }
        .status-pending {
            background-color: #f59e0b;
            color: white;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 8pt;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .summary {
            margin-bottom: 15px;
            padding: 10px;
            background-color: #e8f4f8;
            border-left: 4px solid #5d5fef;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>EventEase - Attendees Report</h1>
        <p>Generated on {{ date('F d, Y h:i A') }}</p>
    </div>

    <div class="filters">
        <strong>Filters Applied:</strong> {{ $filterDescription }}
    </div>

    <div class="summary">
        <strong>Total Attendees: {{ $attendees->count() }}</strong>
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
            @forelse($attendees as $attendee)
                <tr>
                    <td>{{ $attendee->id }}</td>
                    <td>{{ optional($attendee->user)->name ?? 'N/A' }}</td>
                    <td>{{ optional($attendee->user)->email ?? 'N/A' }}</td>
                    <td>{{ optional($attendee->user)->education_level ?? 'N/A' }}</td>
                    <td>{{ optional($attendee->user)->year_level ?? 'N/A' }}</td>
                    <td>{{ optional($attendee->user)->block ?? 'N/A' }}</td>
                    <td>{{ optional($attendee->event)->title ?? 'N/A' }}</td>
                    <td>{{ optional($attendee->event->venue)->name ?? optional($attendee->event)->location ?? 'N/A' }}</td>
                    <td>
                        @if($attendee->event)
                            {{ \Carbon\Carbon::parse($attendee->event->start_time)->format('M d, Y h:i A') }} - 
                            {{ \Carbon\Carbon::parse($attendee->event->end_time)->format('h:i A') }}
                        @else
                            N/A
                        @endif
                    </td>
                    <td>
                        <span class="status status-{{ strtolower($attendee->status ?? 'pending') }}">
                            {{ ucfirst($attendee->status ?? 'Pending') }}
                        </span>
                    </td>
                    <td>{{ $attendee->created_at ? \Carbon\Carbon::parse($attendee->created_at)->format('M d, Y h:i A') : 'N/A' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="11" style="text-align: center; padding: 20px;">No attendees found</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>This report was generated by EventEase Admin System</p>
        <p>Page <span class="page"></span> of <span class="topage"></span></p>
    </div>
</body>
</html>

