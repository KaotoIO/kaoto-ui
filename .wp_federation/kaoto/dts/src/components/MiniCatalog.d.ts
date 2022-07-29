import { IStepProps, IStepQueryParams } from '../types';
export interface IMiniCatalog {
    handleSelectStep?: (selectedStep: any) => void;
    queryParams?: IStepQueryParams;
    steps?: IStepProps[];
}
export declare const MiniCatalog: (props: IMiniCatalog) => JSX.Element;
