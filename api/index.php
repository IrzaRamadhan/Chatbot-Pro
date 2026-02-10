<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Register the Composer autoloader...
require __DIR__ . '/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
$app = require_once __DIR__ . '/../bootstrap/app.php';

// Vercel-specific storage configuration
if (isset($_ENV['VERCEL']) || getenv('VERCEL')) {
    // Force logs to stderr so errors appear in Vercel console
    putenv('LOG_CHANNEL=stderr');
    
    $storage = '/tmp/storage';
    
    if (!is_dir($storage)) {
        mkdir($storage, 0777, true);
        mkdir($storage . '/framework/views', 0777, true);
        mkdir($storage . '/framework/cache', 0777, true);
        mkdir($storage . '/framework/sessions', 0777, true);
        mkdir($storage . '/logs', 0777, true);
    }
    
    $app->useStoragePath($storage);
}

// Handle the request
$app->handleRequest(Request::capture());
