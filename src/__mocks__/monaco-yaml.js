/**
 * We're mocking this module since it spawn a web worker at runtime
 * for the language server.
 */
export const setDiagnosticsOptions = jest.fn();
