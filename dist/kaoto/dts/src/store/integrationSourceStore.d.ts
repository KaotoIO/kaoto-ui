interface ISourceCodeStore {
    sourceCode: string;
    setSourceCode: (val?: string) => void;
}
export declare const useIntegrationSourceStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ISourceCodeStore>>;
export default useIntegrationSourceStore;
