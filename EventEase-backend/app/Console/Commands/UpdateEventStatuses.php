<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class UpdateEventStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'events:update-statuses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically update event statuses based on current time (upcoming, ongoing, completed)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = \Carbon\Carbon::now();
        $events = \App\Models\Event::where('status', '!=', 'cancelled')->get();
        $updated = 0;
        
        foreach ($events as $event) {
            $start = \Carbon\Carbon::parse($event->start_time);
            $end = \Carbon\Carbon::parse($event->end_time);
            
            $calculatedStatus = null;
            if ($now < $start) {
                $calculatedStatus = 'upcoming';
            } elseif ($now >= $start && $now <= $end) {
                $calculatedStatus = 'ongoing';
            } else {
                $calculatedStatus = 'completed';
            }
            
            if ($event->status !== $calculatedStatus) {
                $event->update(['status' => $calculatedStatus]);
                $updated++;
            }
        }
        
        $this->info("Updated {$updated} event status(es).");
        return 0;
    }
}
