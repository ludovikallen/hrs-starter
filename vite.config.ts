import path from 'path';
import { UserConfigFn } from 'vite';
import { overrideVaadinConfig } from './vite.generated';

const customConfig: UserConfigFn = () => ({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src/main/frontend'),
        },
    },
});

export default overrideVaadinConfig(customConfig);
