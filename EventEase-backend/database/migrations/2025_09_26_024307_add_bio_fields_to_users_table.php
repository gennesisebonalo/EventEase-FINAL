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
        Schema::table('users', function (Blueprint $table) {
            $table->text('bio')->nullable()->after('profile_pic');
            $table->string('education_level')->nullable()->after('bio'); // Basic Education, College
            $table->string('section')->nullable()->after('education_level'); // For basic education
            $table->string('strand')->nullable()->after('section'); // For senior high
            $table->string('department')->nullable()->after('strand'); // For college
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['bio', 'education_level', 'section', 'strand', 'department']);
        });
    }
};
