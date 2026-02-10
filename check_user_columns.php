<?php
use Illuminate\Support\Facades\Schema;

$columns = Schema::getColumnListing('user');
echo implode(", ", $columns);
