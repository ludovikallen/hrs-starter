import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useViewConfig } from '@vaadin/hilla-file-router/runtime.js';
import { effect, signal } from '@vaadin/hilla-react-signals';
import { useAuth } from 'Frontend/util/auth.js';
import { User } from 'lucide-react';
import { Suspense, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';

const documentTitleSignal = signal('');
effect(() => {
    document.title = documentTitleSignal.value;
});

// Publish for Vaadin to use
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).Vaadin.documentTitleSignal = documentTitleSignal;

export default function MainLayout() {
    const currentTitle = useViewConfig()?.title;

    useEffect(() => {
        if (currentTitle) {
            documentTitleSignal.value = currentTitle;
        }
    }, [currentTitle]);

    const { state, logout } = useAuth();

    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="ml-auto rounded-full">
                                <User className="h-6 w-6" />
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        {state.user ? (
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={async () => {
                                        await logout();
                                        document.location.reload();
                                    }}>
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        ) : (
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <Link to="/register" className="hover:no-underline w-full">
                                        Register
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem>
                                    <Link to="/login" className="hover:no-underline w-full">
                                        Login
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        )}
                    </DropdownMenu>
                </div>
            </header>

            <Suspense>
                <Outlet />
            </Suspense>
        </div>
    );
}
