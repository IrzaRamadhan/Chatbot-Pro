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
        Schema::create('otp_codes', function (Blueprint $table) {
            $table->id();
            // Referencing user.IDuser
            $table->unsignedBigInteger('user_id'); 
            $table->string('otp_code');
            $table->timestamp('expires_at');
            $table->timestamps();

            // Constraint manually because table name 'user' and PK 'IDuser' are non-standard
            $table->foreign('user_id')->references('IDuser')->on('user')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('otp_codes');
    }
};
