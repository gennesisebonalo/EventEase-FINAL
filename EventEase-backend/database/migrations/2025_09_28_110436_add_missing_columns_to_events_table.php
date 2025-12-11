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
        Schema::table('events', function (Blueprint $table) {
            if (!Schema::hasColumn('events', 'location')) {
                $table->string('location')->nullable();
            }
            if (!Schema::hasColumn('events', 'invitation_type')) {
                $table->enum('invitation_type', ['college', 'basic_ed', 'all_students'])->default('college');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            if (Schema::hasColumn('events', 'location')) {
                $table->dropColumn('location');
            }
            if (Schema::hasColumn('events', 'invitation_type')) {
                $table->dropColumn('invitation_type');
            }
        });
    }
};
