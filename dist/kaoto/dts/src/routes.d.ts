import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
export interface IAppRoute {
    label?: string;
    component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
    exact?: boolean;
    path: string;
    title: string;
    isAsync?: boolean;
    routes?: IAppRoute[];
}
export interface IAppRouteGroup {
    component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
    path: string;
    title: string;
    label?: string;
    routes?: IAppRoute[];
}
export declare type AppRouteConfig = IAppRoute | IAppRouteGroup;
declare const routes: AppRouteConfig[];
declare const AppRoutes: () => React.ReactElement;
export { AppRoutes, routes };
