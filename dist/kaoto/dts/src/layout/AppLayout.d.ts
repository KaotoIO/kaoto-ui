import { ReactNode } from 'react';
interface IAppLayout {
    children: ReactNode;
}
declare const AppLayout: ({ children }: IAppLayout) => JSX.Element;
export { AppLayout };
