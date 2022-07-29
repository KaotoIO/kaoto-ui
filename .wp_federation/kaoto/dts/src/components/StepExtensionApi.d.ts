import { IDeployment, IIntegration, IStepProps, IViewProps } from '../types';
/**
 * The API for a typical Step Extension
 * The following are methods that are exposed to a Step Extension.
 */
export interface IStepExtensionApi {
    getCatalogSteps: (namespace?: string) => Promise<IStepProps[]>;
    getDeployment: (name: string, namespace?: string) => Promise<string | unknown>;
    getDeploymentLogs: (name: string, namespace?: string, lines?: number) => void;
    getDeployments: (namespace?: string) => Promise<IDeployment[]>;
    getDSLs: (namespace?: string) => Promise<{
        [p: string]: string;
    }[]>;
    getIntegrationJson: (sourceCode: string, dsl: string, namespace?: string) => Promise<IIntegration>;
    getIntegrationSource: (integration: IIntegration, dsl: string, namespace?: string) => Promise<string | unknown>;
    getStep: () => IStepProps;
    getViews: (data: IStepProps[], namespace?: string) => Promise<IViewProps[]>;
    notifyKaoto: (title: string, body?: string, variant?: string) => void;
    onKaotoButtonClicked: (view: IViewProps) => void;
    startDeployment: (integration: any, name: string, namespace?: string) => Promise<string | unknown>;
    stopDeployment: (name: string, namespace?: string) => void;
    updateStep: (step: IStepProps) => void;
}
declare const onKaotoButtonClicked: (view: any) => void;
declare const getKaotoCatalogSteps: () => Promise<IStepProps[]>;
declare const getKaotoDeployment: (name: string, namespace?: string) => Promise<string | unknown>;
declare const getKaotoDeploymentLogs: (name: string, namespace?: string, lines?: number) => Promise<unknown>;
declare const getKaotoDeployments: () => Promise<IDeployment[]>;
declare const getKaotoDSLs: () => Promise<{
    [p: string]: string;
}[]>;
declare const getKaotoIntegrationSource: (integration: IIntegration) => Promise<any>;
declare const getKaotoIntegrationJson: (sourceCode: string, dsl: string, namespace?: string) => Promise<any>;
declare const getKaotoViews: (data: IStepProps[], namespace?: string) => Promise<IViewProps[]>;
declare const startKaotoDeployment: (integration: any, name: string, namespace?: string) => Promise<string>;
declare const stopKaotoDeployment: (name: string) => Promise<string>;
export { getKaotoCatalogSteps, getKaotoDeployment, getKaotoDeploymentLogs, getKaotoDeployments, getKaotoDSLs, getKaotoIntegrationJson, getKaotoIntegrationSource, getKaotoViews, onKaotoButtonClicked, startKaotoDeployment, stopKaotoDeployment, };
