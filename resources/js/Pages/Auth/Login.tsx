import { useEffect, FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { ThemeToggle } from '@/Components/ThemeToggle';

export default function Login({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        email: string;
        password: string;
        remember: boolean;
    }>({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login'); // eksplisit mengirim ke /login
    };

    return (
        <>
            <Head title="Log in" />
            <div className="min-h-screen flex flex-col md:flex-row">
                {/* Top right theme toggle */}
                <div className="absolute top-4 right-4">
                    <ThemeToggle />
                </div>

                {/* Left side - Login Form */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-16">
                    <div className="w-full max-w-md space-y-8">
                        {/* Logo/Branding */}
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold">Welcome back</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Please sign in to your account
                            </p>
                        </div>

                        {status && (
                            <Alert>
                                <AlertDescription>{status}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={submit} className="mt-8 space-y-6">
                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="pl-10"
                                            autoComplete="username"
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                            </svg>
                                        </div>
                                    </div>
                                    {errors.email && <div className="mt-1 text-sm text-destructive">{errors.email}</div>}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            className="pl-10"
                                            autoComplete="current-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                    </div>
                                    {errors.password && <div className="mt-1 text-sm text-destructive">{errors.password}</div>}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input
                                        name="remember"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary transition duration-150"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    <span className="ml-2 text-sm text-muted-foreground">Ingat Saya</span>
                                </label>
                            </div>

                            <div>
                                <Button
                                    disabled={processing}
                                    className="w-full py-2.5"
                                    type="submit"
                                >
                                    {processing ? 'Signing in...' : 'Sign in'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right side - Illustration */}
                <div className="hidden md:block md:w-1/2 bg-primary/5 dark:bg-gray-800">
                    <div className="h-full w-full flex items-center justify-center p-8">
                        <div className="max-w-md">
                            {/* You can replace this with your own illustration or image */}
                            <div className="text-center">
                                <img src="images/login.png" alt="Koperasi SMP Negeri 1 Purwokerto" className="mx-auto h-64 w-64" />
                                <h3 className="mt-6 text-xl font-bold">Koperasi SMP Negeri 1 Purwokerto</h3>
                                <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
                                    Selamat datang di aplikasi Koperasi SMP Negeri 1 Purwokerto. Silahkan login untuk melanjutkan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}