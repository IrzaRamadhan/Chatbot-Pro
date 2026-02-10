<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Register the Composer autoloader...
require __DIR__ . '/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
$app = require_once __DIR__ . '/../bootstrap/app.php';

// Vercel-specific storage configuration
    // Force logs to stderr so errors appear in Vercel console
    putenv('LOG_CHANNEL=stderr');
    
    // Set storage path to /tmp which is writable in serverless functions
    $storage = '/tmp/storage';
    
    if (!is_dir($storage)) {
        mkdir($storage, 0777, true);
    }
    
    // Ensure essential storage subdirectories exist
    $directories = [
        '/framework/views',
        '/framework/cache',
        '/framework/sessions',
        '/logs',
        '/app/public',
    ];
    
    foreach ($directories as $dir) {
        if (!is_dir($storage . $dir)) {
            mkdir($storage . $dir, 0777, true);
        }
    }
    
    $app->useStoragePath($storage);
    
    // Fix for config caching issues in serverless
    if (!file_exists($storage . '/framework/cache')) {
         mkdir($storage . '/framework/cache', 0777, true);
    }

// Handle the request
$app->handleRequest(Request::capture());
