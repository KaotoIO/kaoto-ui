export declare function createValidator(schema: object): (model: object) => {
    details: import("ajv").ErrorObject<string, Record<string, any>, unknown>[];
};
declare type JsonSchemaConfiguratorProps = {
    schema: any;
    configuration: any;
    onChangeModel: (configuration: unknown, isValid: boolean) => void;
};
export declare const JsonSchemaConfigurator: ({ schema, configuration, onChangeModel, }: JsonSchemaConfiguratorProps) => JSX.Element;
export {};
