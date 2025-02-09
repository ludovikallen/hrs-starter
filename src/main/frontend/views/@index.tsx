import { useAuth } from '@/util/auth';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';

export const config: ViewConfig = {
    menu: { order: 0, icon: 'line-awesome/svg/globe-solid.svg' },
    title: 'Hello World',
    loginRequired: false,
};

export default function HelloWorldView() {
    const { state } = useAuth();

    const name = state.user ? state.user.firstName + ' ' + state.user.lastName : 'stranger';

    return <div className="flex flex-row justify-center pt-8 items-center">Hello {name}!</div>;
}
