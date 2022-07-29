import { AlertProps } from '@rhoas/app-services-ui-shared';
declare type AlertToastGroupProps = {
    alerts: AlertProps[];
    onCloseAlert: (key: string | undefined) => void;
};
export declare const MASAlertToastGroup: ({ alerts, onCloseAlert }: AlertToastGroupProps) => JSX.Element;
export {};
