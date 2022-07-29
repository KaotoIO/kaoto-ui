import { IDeployment, IStepProps } from '../types';
export declare function accessibleRouteChangeHandler(): number;
export declare function findDeploymentFromList(name: string, deployments: IDeployment[]): IDeployment;
/**
 * Returns a Step index when provided with the `UUID`.
 * `UUID` is originally set using the Step UUID.
 * @param UUID
 * @param steps
 */
export declare function findStepIdxWithUUID(UUID: string, steps?: IStepProps[]): any;
export declare function formatDateTime(date: string): string;
export declare function shorten(str: string, maxLen: number, separator?: string): string;
export declare function truncateString(str: string, num: number): string;
/**
 * A custom hook for setting the page title.
 * @param title
 */
export declare function useDocumentTitle(title: string): void;
/**
 * A custom hook for setting mutable refs.
 * @param value
 */
export declare function usePrevious(value: any): undefined;
export * from './validationService';
