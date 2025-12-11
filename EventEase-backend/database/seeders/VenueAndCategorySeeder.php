<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Venue;
use App\Models\EventCategory;

class VenueAndCategorySeeder extends Seeder
{
    public function run(): void
    {
        // Venues
        Venue::create([
            'name' => 'Main Auditorium',
            'address' => 'Building A, Ground Floor',
            'capacity' => 500,
        ]);
        Venue::create([
            'name' => 'Conference Room A',
            'address' => 'Building B, 2nd Floor',
            'capacity' => 50,
        ]);
        Venue::create([
            'name' => 'Conference Room B',
            'address' => 'Building B, 3rd Floor',
            'capacity' => 40,
        ]);
        Venue::create([
            'name' => 'Gymnasium',
            'address' => 'Sports Complex',
            'capacity' => 200,
        ]);
        Venue::create([
            'name' => 'Library Hall',
            'address' => 'Library Building, 1st Floor',
            'capacity' => 100,
        ]);
        Venue::create([
            'name' => 'Computer Lab 1',
            'address' => 'IT Building, 3rd Floor',
            'capacity' => 30,
        ]);
        Venue::create([
            'name' => 'Computer Lab 2',
            'address' => 'IT Building, 2nd Floor',
            'capacity' => 35,
        ]);
        Venue::create([
            'name' => 'Cafeteria',
            'address' => 'Student Center',
            'capacity' => 150,
        ]);
        Venue::create([
            'name' => 'Outdoor Amphitheater',
            'address' => 'Central Campus',
            'capacity' => 300,
        ]);
        Venue::create([
            'name' => 'Science Laboratory',
            'address' => 'Science Building, 2nd Floor',
            'capacity' => 25,
        ]);
        Venue::create([
            'name' => 'Chemistry Lab',
            'address' => 'Science Building, 1st Floor',
            'capacity' => 20,
        ]);
        Venue::create([
            'name' => 'Physics Lab',
            'address' => 'Science Building, 3rd Floor',
            'capacity' => 22,
        ]);
        Venue::create([
            'name' => 'Art Studio',
            'address' => 'Arts Building, 1st Floor',
            'capacity' => 30,
        ]);
        Venue::create([
            'name' => 'Music Room',
            'address' => 'Arts Building, 2nd Floor',
            'capacity' => 25,
        ]);
        Venue::create([
            'name' => 'Drama Theater',
            'address' => 'Arts Building, Ground Floor',
            'capacity' => 80,
        ]);
        Venue::create([
            'name' => 'Swimming Pool',
            'address' => 'Sports Complex',
            'capacity' => 50,
        ]);
        Venue::create([
            'name' => 'Basketball Court',
            'address' => 'Sports Complex',
            'capacity' => 100,
        ]);
        Venue::create([
            'name' => 'Tennis Court',
            'address' => 'Sports Complex',
            'capacity' => 20,
        ]);
        Venue::create([
            'name' => 'Student Lounge',
            'address' => 'Student Center, 2nd Floor',
            'capacity' => 60,
        ]);
        Venue::create([
            'name' => 'Faculty Room',
            'address' => 'Administration Building',
            'capacity' => 40,
        ]);
        Venue::create([
            'name' => 'Chapel',
            'address' => 'Religious Center',
            'capacity' => 120,
        ]);
        Venue::create([
            'name' => 'Garden Pavilion',
            'address' => 'Botanical Garden',
            'capacity' => 80,
        ]);
        Venue::create([
            'name' => 'Roof Deck',
            'address' => 'Main Building, 5th Floor',
            'capacity' => 100,
        ]);
        Venue::create([
            'name' => 'Online/Virtual',
            'address' => 'Virtual Platform',
            'capacity' => 1000,
        ]);

        // Event Categories
        EventCategory::create([
            'name' => 'Academic',
            'description' => 'Academic competitions, seminars, and educational events',
        ]);
        EventCategory::create([
            'name' => 'Sports',
            'description' => 'Sports competitions, tournaments, and athletic events',
        ]);
        EventCategory::create([
            'name' => 'Cultural',
            'description' => 'Cultural festivals, traditions, and heritage events',
        ]);
        EventCategory::create([
            'name' => 'Social',
            'description' => 'Social gatherings, parties, and community events',
        ]);
        EventCategory::create([
            'name' => 'Arts',
            'description' => 'Music, drama, art exhibitions, and creative events',
        ]);
        EventCategory::create([
            'name' => 'Technology',
            'description' => 'Tech talks, hackathons, and innovation events',
        ]);
        EventCategory::create([
            'name' => 'Health & Wellness',
            'description' => 'Health awareness, fitness, and wellness programs',
        ]);
        EventCategory::create([
            'name' => 'Career Development',
            'description' => 'Job fairs, career talks, and professional development',
        ]);
        EventCategory::create([
            'name' => 'Religious',
            'description' => 'Religious ceremonies, prayer meetings, and spiritual events',
        ]);
        EventCategory::create([
            'name' => 'Environmental',
            'description' => 'Environmental awareness, sustainability, and green initiatives',
        ]);
        EventCategory::create([
            'name' => 'Community Service',
            'description' => 'Volunteer work, charity events, and community outreach',
        ]);
        EventCategory::create([
            'name' => 'Entertainment',
            'description' => 'Concerts, shows, entertainment, and recreational activities',
        ]);
        EventCategory::create([
            'name' => 'Science & Research',
            'description' => 'Science fairs, research presentations, and scientific events',
        ]);
        EventCategory::create([
            'name' => 'Leadership',
            'description' => 'Leadership training, workshops, and development programs',
        ]);
        EventCategory::create([
            'name' => 'International',
            'description' => 'International events, cultural exchange, and global programs',
        ]);
        EventCategory::create([
            'name' => 'Graduation',
            'description' => 'Graduation ceremonies, commencement, and milestone celebrations',
        ]);
        EventCategory::create([
            'name' => 'Orientation',
            'description' => 'New student orientation, welcome events, and introductions',
        ]);
        EventCategory::create([
            'name' => 'Workshop',
            'description' => 'Training workshops, skill development, and hands-on learning',
        ]);
        EventCategory::create([
            'name' => 'Seminar',
            'description' => 'Educational seminars, lectures, and knowledge sharing',
        ]);
        EventCategory::create([
            'name' => 'Conference',
            'description' => 'Professional conferences, meetings, and business events',
        ]);
        EventCategory::create([
            'name' => 'Fundraising',
            'description' => 'Fundraising events, charity drives, and donation campaigns',
        ]);
        EventCategory::create([
            'name' => 'Awards & Recognition',
            'description' => 'Award ceremonies, recognition events, and achievement celebrations',
        ]);
        EventCategory::create([
            'name' => 'Networking',
            'description' => 'Networking events, meetups, and professional connections',
        ]);
        EventCategory::create([
            'name' => 'Recreation',
            'description' => 'Recreational activities, games, and leisure events',
        ]);
        EventCategory::create([
            'name' => 'Other',
            'description' => 'Other events that do not fit into specific categories',
        ]);
    }
}
