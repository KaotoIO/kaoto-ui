import { PropsWithChildren, ReactNode } from 'react';
declare type Props = PropsWithChildren<{
    name: string;
    loading?: ReactNode;
    failure?: ReactNode;
}>;
export declare function Extension(props: Props): JSX.Element;
export default Extension;
