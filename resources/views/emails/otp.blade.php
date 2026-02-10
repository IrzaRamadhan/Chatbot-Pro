<!DOCTYPE html>
<html>
<head>
    <title>Password Reset OTP</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4f46e5;">Chatbot Admin Password Reset</h2>
        <p>Hello, <strong>{{ $username }}</strong>!</p>
        <p>You requested a password reset. Please use the following One-Time Password (OTP) to proceed:</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #111;">{{ $otp }}</span>
        </div>
        
        <p>This code is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">This is an automated message, please do not reply.</p>
    </div>
</body>
</html>
