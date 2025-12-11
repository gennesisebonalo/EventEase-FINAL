<?php

if (!function_exists('get_event_status')) {
    function get_event_status($startTime, $endTime)
    {
        $now = now();
        if ($now->isBefore($startTime)) {
            return 'Upcoming';
        } elseif ($now->isBetween($startTime, $endTime)) {
            return 'Ongoing';
        } else {
            return 'Completed';
        }
    }
} 