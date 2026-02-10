<?php

namespace Database\Seeders;

use App\Models\Template;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            // Greeting Templates
            [
                'name' => 'Balasan Otomatis Pertama',
                'category' => 'greeting',
                'content' => "Terima kasih sudah menghubungi kami! 🙏\n\nAda yang bisa kami bantu?",
                'variables' => [],
                'is_active' => true,
            ],
            [
                'name' => 'Sapaan Awal',
                'category' => 'greeting',
                'content' => "Halo {name}! 👋\n\nSelamat datang di layanan kami. Ada yang bisa saya bantu hari ini?",
                'variables' => ['name'],
                'is_active' => true,
            ],
            [
                'name' => 'Sapaan Pagi',
                'category' => 'greeting',
                'content' => "Selamat pagi {name}! ☀️\n\nSemoga harimu menyenangkan. Ada yang bisa kami bantu?",
                'variables' => ['name'],
                'is_active' => true,
            ],
            [
                'name' => 'Sapaan Siang',
                'category' => 'greeting',
                'content' => "Selamat siang {name}! 🌤️\n\nTerima kasih sudah menghubungi kami. Bagaimana kami bisa membantu Anda?",
                'variables' => ['name'],
                'is_active' => true,
            ],
            
            // Follow Up Templates
            [
                'name' => 'Follow Up Pesanan',
                'category' => 'follow_up',
                'content' => "Halo {name},\n\nKami ingin mengingatkan tentang pesanan Anda #{order_id}.\n\nStatus: {status}\nTotal: Rp {total}\n\nAda pertanyaan?",
                'variables' => ['name', 'order_id', 'status', 'total'],
                'is_active' => true,
            ],
            [
                'name' => 'Follow Up Pembayaran',
                'category' => 'follow_up',
                'content' => "Halo {name},\n\nKami belum menerima pembayaran untuk pesanan #{order_id}.\n\nTotal yang harus dibayar: Rp {total}\nBatas waktu: {deadline}\n\nSilakan lakukan pembayaran segera. Terima kasih!",
                'variables' => ['name', 'order_id', 'total', 'deadline'],
                'is_active' => true,
            ],
            [
                'name' => 'Follow Up Kepuasan',
                'category' => 'follow_up',
                'content' => "Halo {name},\n\nBagaimana pengalaman Anda dengan produk/layanan kami?\n\nKami sangat menghargai feedback Anda untuk meningkatkan kualitas layanan. 😊",
                'variables' => ['name'],
                'is_active' => true,
            ],
            
            // Closing Templates
            [
                'name' => 'Penutup Standar',
                'category' => 'closing',
                'content' => "Terima kasih {name}! 🙏\n\nJika ada pertanyaan lain, jangan ragu untuk menghubungi kami kembali.\n\nSemoga harimu menyenangkan!",
                'variables' => ['name'],
                'is_active' => true,
            ],
            [
                'name' => 'Penutup Setelah Pembelian',
                'category' => 'closing',
                'content' => "Terima kasih atas pembelian Anda, {name}! 🎉\n\nPesanan #{order_id} sedang kami proses.\n\nKami akan menginformasikan update selanjutnya segera.\n\nSampai jumpa!",
                'variables' => ['name', 'order_id'],
                'is_active' => true,
            ],
            [
                'name' => 'Penutup Dengan Promo',
                'category' => 'closing',
                'content' => "Terima kasih {name}! 🙏\n\nJangan lupa cek promo spesial kami:\n{promo_text}\n\nSampai jumpa lagi!",
                'variables' => ['name', 'promo_text'],
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            Template::create($template);
        }
    }
}
