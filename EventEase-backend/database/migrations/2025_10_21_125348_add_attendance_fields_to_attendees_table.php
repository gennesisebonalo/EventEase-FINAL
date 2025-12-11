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
        Schema::table('attendees', function (Blueprint $table) {
            $table->enum('status', ['present', 'absent', 'pending'])->default('pending');
            $table->text('reason')->nullable();
            $table->string('evidence_image')->nullable();
            $table->timestamp('checked_in_at')->nullable();
            $table->timestamp('declined_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendees', function (Blueprint $table) {
            $table->dropColumn(['status', 'reason', 'evidence_image', 'checked_in_at', 'declined_at']);
        });
    }
};
