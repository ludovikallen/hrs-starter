import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/util/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

const loginI18n = {
    header: { title: 'Login', description: 'Access your account' },
    validation: {
        email: 'Please enter a valid email address.',
        password: 'Password is required.',
    },
};

export const config: ViewConfig = {
    menu: { exclude: true },
    flowLayout: false,
    title: 'Login',
    loginRequired: false,
    skipLayouts: true,
};

export default function LoginView() {
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const formSchema = z.object({
        email: z.string().email({
            message: loginI18n.validation.email,
        }),
        password: z.string().min(1, {
            message: loginI18n.validation.password,
        }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const result = await login(values.email, values.password);
            if (result.error) {
                setErrorMessage('Invalid username or password!');
            } else {
                document.location = '/';
            }
        } catch {
            setErrorMessage('Invalid username or password!');
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-center">{loginI18n.header.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="name@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="pr-10"
                                                    {...field}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}>
                                                    {showPassword ? (
                                                        <EyeOffIcon className="h-4 w-4 text-gray-500" />
                                                    ) : (
                                                        <EyeIcon className="h-4 w-4 text-gray-500" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}

                            <Button type="submit" className="w-full">
                                Login
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="underline underline-offset-4">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
