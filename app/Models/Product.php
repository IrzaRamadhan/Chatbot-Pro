<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    // Karena nama tabel di Supabase "product" (singular), bukan "products" (plural)
    protected $table = 'product';

    // Agar bisa diisi semua kolomnya
    protected $guarded = [];
}
