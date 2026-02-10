<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\OtpCode;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;

class OtpController extends Controller
{
    // Tampilkan halaman lupa password (input username)
    public function create()
    {
        return Inertia::render('auth/forgot-password', [
            'status' => session('status'),
        ]);
    }



    // Kirim OTP
    public function store(Request $request)
    {
        $request->validate([
            'Username' => 'required|exists:user,Username',
        ]);

        $user = User::where('Username', $request->Username)->first();

        // Generate OTP
        $otp = rand(100000, 999999);
        $expiresAt = now()->addMinutes(10);

        // Simpan ke database
        OtpCode::updateOrCreate(
            ['user_id' => $user->IDuser],
            ['otp_code' => $otp, 'expires_at' => $expiresAt]
        );

        // Kirim Email (Real)
        try {
            if ($user->Email) {
                Mail::to($user->Email)->send(new OtpMail($otp, $user->Username));
            } else {
                // Fallback jika email kosong (seharusnya tidak terjadi jika validasi benar)
                Log::warning("User {$user->Username} has no email. OTP logged: {$otp}");
            }
        } catch (\Exception $e) {
            Log::error("Failed to send OTP email: " . $e->getMessage());
            // Tetap lanjut agar user tidak stuck (opsional, atau return error)
        }

        // LOG OTP tetap ada untuk backup debugging
        Log::info("OTP for {$user->Username}: {$otp}");

        // Redirect ke halaman verifikasi
        return redirect()->route('otp.verify.view', ['username' => $user->Username]);
    }

    // Tampilkan halaman verifikasi OTP
    public function verifyView(Request $request)
    {
        return Inertia::render('auth/verify-otp', [
            'username' => $request->username,
        ]);
    }

    // Verifikasi OTP
    public function verify(Request $request)
    {
        $request->validate([
            'Username' => 'required|exists:user,Username',
            'otp' => 'required|numeric',
        ]);

        $user = User::where('Username', $request->Username)->first();
        $otpRecord = OtpCode::where('user_id', $user->IDuser)
            ->where('otp_code', $request->otp)
            ->where('expires_at', '>', now())
            ->first();

        if (!$otpRecord) {
            throw ValidationException::withMessages([
                'otp' => 'OTP invalid or expired.',
            ]);
        }

        // Jika valid, hapus OTP
        $otpRecord->delete();

        // Login user atau redirect ke halaman reset password
        // Disini kita langsung login saja untuk simplifikasi, atau redirect ke form reset password
        // Kita redirect ke form reset password khusus
        
        // Buat token sementara agar aman
        $token = Hash::make($user->Username . now());
        session(['reset_token' => $token, 'reset_username' => $user->Username]);

        return redirect()->route('password.reset.custom');
    }

    // Tampilkan form reset password
    public function resetPasswordView()
    {
        if (!session('reset_token')) {
            return redirect()->route('login');
        }
        return Inertia::render('auth/reset-password-custom');
    }

    // Proses reset password
    public function resetPassword(Request $request)
    {
        if (!session('reset_token')) {
            return redirect()->route('login');
        }

        $request->validate([
            'password' => [
                'required',
                'confirmed',
                'min:8',
                'regex:/[A-Z]/',      // Minimal 1 Huruf Kapital
                'regex:/[0-9]/',      // Minimal 1 Angka
                'regex:/[@$!%*#?&]/', // Minimal 1 Karakter Spesial
            ],
        ], [
            'password.regex' => 'Password must contain at least one uppercase letter, one number, and one special character.',
        ]);

        $user = User::where('Username', session('reset_username'))->first();
        
        // Simpan PLAIN TEXT sesuai request user
        $user->Password = $request->password;
        $user->save();

        session()->forget(['reset_token', 'reset_username']);

        return redirect()->route('login')->with('status', 'Password has been reset!');
    }
}
