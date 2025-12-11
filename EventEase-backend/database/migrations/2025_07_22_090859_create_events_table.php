<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('start_time');
            $table->dateTime('end_time');

            // Foreign keys
            $table->foreignId('venue_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained('event_categories')->onDelete('cascade');
            $table->foreignId('organizer_id')->constrained('users')->onDelete('cascade');

            // New fields
            $table->string('location'); // e.g. School Gymnasium
            $table->enum('invitation_type', ['college', 'basic_ed', 'all_students']);
            $table->enum('status', ['upcoming', 'ongoing', 'completed', 'cancelled'])->default('upcoming');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
