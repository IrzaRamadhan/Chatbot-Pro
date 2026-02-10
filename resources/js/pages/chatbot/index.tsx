import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Loader2, Phone, Server, Terminal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LogMessage {
    date: string;
    sender: string;
    jid: string;
    message: string;
}

export default function ChatbotConfig() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [status, setStatus] = useState<'online' | 'offline' | 'connecting'>('offline');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pairingCode, setPairingCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<LogMessage[]>([]);
    const socketInitialized = useRef(false);

    useEffect(() => {
        // Prevent duplicate socket connections
        if (socketInitialized.current) return;
        socketInitialized.current = true;

        // Connect to the separate Bot Server running on port 3000
        const newSocket = io('http://localhost:3000', {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        newSocket.on('connect', () => {
            console.log('Connected to Bot Server');
            setError(null);
        });

        newSocket.on('connect_error', (err) => {
            console.error('Connection Error:', err);
            setError('Could not connect to Bot Server (Is it running on port 3000?)');
            setStatus('offline');
        });

        newSocket.on('connection-status', (status) => {
            setStatus(status);
            if (status === 'online') {
                setPairingCode(null); // Clear code if connected
            }
        });

        newSocket.on('pairing-code', (code) => {
            setPairingCode(code);
            setIsLoading(false);
        });

        newSocket.on('pairing-error', (err) => {
            setError(err);
            setIsLoading(false);
        });

        newSocket.on('message-log', (log: LogMessage) => {
            setLogs((prev) => [log, ...prev].slice(0, 50)); // Keep last 50 logs
        });

        setSocket(newSocket);

        return () => {
            socketInitialized.current = false;
            newSocket.disconnect();
        };
    }, []);

    const handlePairing = (e: React.FormEvent) => {
        e.preventDefault();
        if (!socket || !phoneNumber) return;

        setError(null);
        setIsLoading(true);
        setPairingCode(null);

        // Format phone number: ensure it starts with country code (e.g., 62), remove '+'
        let formattedPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '62' + formattedPhone.slice(1);
        }

        socket.emit('pair-device', formattedPhone);
    };

    return (
        <AppLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Chatbot Configuration
                    </h2>
                    <Badge variant={status === 'online' ? 'default' : status === 'connecting' ? 'secondary' : 'destructive'} className="capitalize">
                        {status === 'online' ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <AlertCircle className="mr-1 h-3 w-3" />}
                        Bot Status: {status}
                    </Badge>
                </div>
            }
        >
            <Head title="Chatbot Configuration" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Connection Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5" />
                                    WhatsApp Connection
                                </CardTitle>
                                <CardDescription>Link your WhatsApp account to the chatbot.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {status === 'online' ? (
                                    <div className="flex flex-col items-center justify-center space-y-4 py-6 text-green-600">
                                        <CheckCircle2 className="h-16 w-16" />
                                        <p className="text-lg font-medium">Chatbot is Connected & Active</p>
                                        <p className="text-sm text-gray-500">Your device is successfully paired.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handlePairing} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number (e.g., 628123456789)</Label>
                                            <Input
                                                id="phone"
                                                placeholder="62812..."
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                disabled={isLoading || !!pairingCode}
                                            />
                                        </div>

                                        {!pairingCode && (
                                            <Button type="submit" className="w-full" disabled={isLoading || !phoneNumber}>
                                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Get Pairing Code
                                            </Button>
                                        )}

                                        {pairingCode && (
                                            <div className="mt-4 rounded-lg border-2 border-dashed border-indigo-200 bg-indigo-50 p-6 text-center dark:border-indigo-800 dark:bg-indigo-950/30">
                                                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Enter this code on your WhatsApp:</p>
                                                <p className="font-mono text-4xl font-bold tracking-widest text-indigo-600 dark:text-indigo-400">
                                                    {pairingCode}
                                                </p>
                                                <p className="mt-4 text-xs text-gray-500">
                                                    Open WhatsApp &gt; Linked Devices &gt; Link a Device &gt; Link with phone number instead
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mt-2 text-xs text-gray-400 hover:text-gray-600"
                                                    onClick={() => {
                                                        setPairingCode(null);
                                                        setIsLoading(false);
                                                    }}
                                                >
                                                    Cancel / Retry
                                                </Button>
                                            </div>
                                        )}
                                    </form>
                                )}
                            </CardContent>
                        </Card>

                        {/* Logs Card */}
                        <Card className="flex flex-col h-[500px]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Terminal className="h-5 w-5" />
                                    Live Logs
                                </CardTitle>
                                <CardDescription>Real-time activity from the bot server.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden p-0">
                                <ScrollArea className="h-full p-6 pt-0">
                                    <div className="space-y-4">
                                        {logs.length === 0 ? (
                                            <div className="flex h-32 items-center justify-center text-sm text-gray-500">
                                                No logs available yet...
                                            </div>
                                        ) : (
                                            logs.map((log, i) => (
                                                <div key={i} className="flex flex-col gap-1 border-b border-gray-100 pb-2 last:border-0 dark:border-gray-800">
                                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                                        <span>{log.date}</span>
                                                        <span className="font-medium text-indigo-500">{log.sender}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-mono break-all">
                                                        {log.message}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                            <CardFooter className="bg-gray-50 p-3 text-xs text-gray-400 dark:bg-gray-900/50">
                                <Server className="mr-2 h-3 w-3" />
                                Connected to localhost:3000
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
