import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyOtp({ username }: { username: string }) {
    const { data, setData, post, processing, errors } = useForm({
        Username: username,
        otp: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('otp.verify'));
    };

    return (
        <AuthLayout title="Verify OTP" description={`Enter the code sent to ${username}`}>
            <Head title="Verify OTP" />

            <div className="space-y-6">
                <form onSubmit={submit}>
                    <div className="grid gap-2">
                        <Label htmlFor="otp">OTP Code</Label>
                        <Input
                            id="otp"
                            type="text"
                            name="otp"
                            value={data.otp}
                            autoFocus
                            onChange={(e) => setData('otp', e.target.value)}
                            placeholder="123456"
                            maxLength={6}
                        />
                        <InputError message={errors.otp} />
                    </div>

                    <div className="my-6 flex items-center justify-start">
                        <Button className="w-full" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Verify Code
                        </Button>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
