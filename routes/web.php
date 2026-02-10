<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

// TEMP ROUTE: Verify Admin1 Email
Route::get('/verify-email-admin', function () {
    $user = \App\Models\User::where('Username', 'admin1')->first();
    if ($user) {
        return "Current Email for admin1: " . $user->Email;
    }
    return "User admin1 not found.";
});

    Route::get('products', function () {
        return Inertia::render('dashboard'); // Placeholder
    })->name('products.index');

    Route::get('users', function () {
        return Inertia::render('dashboard'); // Placeholder
    })->name('users.index');

    Route::get('transactions', function () {
        return Inertia::render('dashboard'); // Placeholder
    })->name('transactions.index');

    Route::resource('templates', \App\Http\Controllers\TemplateController::class);

    Route::get('chatbot', function () {
        return Inertia::render('chatbot/index');
    })->name('chatbot.index');
});

// TEST ROUTE: Untuk mengecek koneksi ke tabel product di Supabase
Route::get('/test-products', function () {
    return \App\Models\Product::all();
});

// TEST ROUTE: Untuk mengecek koneksi ke tabel user di Supabase
Route::get('/test-users', function () {
    return [
       'columns' => \Illuminate\Support\Facades\Schema::getColumnListing('user'),
       'users' => \App\Models\User::all()
    ];
});





// API Route for Bot
Route::get('/api/products', function () {
    return \App\Models\Product::all();
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
