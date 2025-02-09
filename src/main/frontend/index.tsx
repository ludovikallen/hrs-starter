import { router } from 'Frontend/generated/routes.js';
import { AuthProvider } from 'Frontend/util/auth';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { Toaster } from './components/ui/toaster';
import './global.css';

function App() {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
            <Toaster />
        </AuthProvider>
    );
}

const outlet = document.getElementById('outlet')!;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const root = (outlet as any)._root ?? createRoot(outlet);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(outlet as any)._root = root;
root.render(createElement(App));
