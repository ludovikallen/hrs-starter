import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import CreateUserDto from '@/generated/com/example/application/users/models/CreateUserDto';
import { UserService } from '@/generated/endpoints';
import { useAuth } from '@/util/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { Check, EyeIcon, EyeOffIcon, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

export const config: ViewConfig = {
    menu: { exclude: true },
    flowLayout: false,
    title: 'Register',
    loginRequired: false,
    skipLayouts: true,
};

interface PasswordChecklistProps {
    password: string;
}

const PasswordChecklist = ({ password }: PasswordChecklistProps) => {
    const criteria = [
        { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
        { label: 'Contains uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
        { label: 'Contains lowercase letter', test: (p: string) => /[a-z]/.test(p) },
        { label: 'Contains number', test: (p: string) => /\d/.test(p) },
        { label: 'Contains special character', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
    ];

    return (
        <div className="absolute mt-1 p-3 bg-white rounded-lg shadow-lg border border-gray-200 space-y-2 z-10 p-4">
            {criteria.map((criterion) => (
                <div key={criterion.label} className="flex items-center gap-2">
                    {criterion.test(password) ? (
                        <Check className="w-4 h-4 text-green-500" />
                    ) : (
                        <X className="w-4 h-4 text-red-500" />
                    )}
                    <span className={criterion.test(password) ? 'text-green-700' : 'text-gray-600'}>
                        {criterion.label}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default function RegisterView() {
    const { login } = useAuth();

    const [showPasswordChecklist, setShowPasswordChecklist] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isError, setIsError] = useState(false);

    const formSchema = z.object({
        email: z.string().email({
            message: 'Please enter a valid email address (e.g., name@example.com)',
        }),
        password: z
            .string()
            .min(8, { message: 'Password must be at least 8 characters' })
            .max(256, { message: 'Password must be at most 256 characters' })
            .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,256}$/, {
                message:
                    'Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.',
            }),
        firstName: z
            .string()
            .min(2, { message: 'First name must be at least 2 characters' })
            .max(256, { message: 'First name must be at most 256 characters' })
            .regex(/^[\p{L} ,.'-]+$/u, {
                message: 'First name must only contain valid character.',
            }),
        lastName: z
            .string()
            .min(2, { message: 'Last name must be at least 2 characters' })
            .max(256, { message: 'Last name must be at most 256 characters' })
            .regex(/^[\p{L} ,.'-]+$/u, {
                message: 'Last name must only contain valid character.',
            }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
            firstName: '',
            lastName: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsError(false);
        const userToCreate: CreateUserDto = {
            email: values.email,
            password: values.password,
            firstName: values.firstName,
            lastName: values.lastName,
        };
        try {
            const user = await UserService.create(userToCreate);

            if (user) {
                try {
                    await login(values.email, values.password);
                    document.location = '/';
                } catch {
                    document.location = '/login';
                }
            }
        } catch {
            setIsError(true);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="flex flex-row gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

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
                                    <FormItem className="relative">
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="pr-10"
                                                    {...field}
                                                    onFocus={() => setShowPasswordChecklist(true)}
                                                    onBlur={() => setShowPasswordChecklist(false)}
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
                                        {showPasswordChecklist && <PasswordChecklist password={field.value || ''} />}
                                        <FormMessage className="text-wrap" />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">
                                Create account
                            </Button>
                            {isError && (
                                <div className="flex flex-col text-red-500 text-sm font-medium">
                                    <span>Something went wrong while creating your account.</span>
                                    <span>Please check your details and try again.</span>
                                </div>
                            )}
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="underline underline-offset-4">
                            Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
