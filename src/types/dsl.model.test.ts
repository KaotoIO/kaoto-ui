import { rawCapabilitiesStub } from '../stubs';
import { IDsl } from './dsl.model';

describe('DSL Model', () => {
  it('should parse a raw DSL', () => {
    const rawDsl = rawCapabilitiesStub[0];
    const dsl = new IDsl(rawDsl);

    expect(dsl.name).toBe(rawDsl.name);
    expect(dsl.description).toBe(rawDsl.description);
    expect(dsl.validationSchema).toBe(rawDsl.validationSchema);
    expect(dsl.vocabulary).toBe(rawDsl.vocabulary);
    expect(dsl.stepKinds).toEqual(['CAMEL-CONNECTOR', 'EIP', 'EIP-BRANCH']);
    expect(dsl.output).toBe(true);
    expect(dsl.input).toBe(true);
    expect(dsl.deployable).toBe(true);
    expect(dsl.supportsMultipleFlows).toBe(true);
    expect(dsl.supportsResourceDescription).toBe(true);
  });

  it('should parse the "default" property', () => {
    const rawDsl = rawCapabilitiesStub[3];
    const dsl = new IDsl(rawDsl);

    expect(dsl.default).toBe(true);
  });

  it('should set the "default" property to false if not present', () => {
    const rawDsl = rawCapabilitiesStub[0];
    const dsl = new IDsl(rawDsl);

    expect(dsl.default).toBe(false);
  });

  it.each([
    ['single step', ['single step']],
    ['[CAMEL-CONNECTOR, EIP, EIP-BRANCH]', ['CAMEL-CONNECTOR', 'EIP', 'EIP-BRANCH']],
    ['', ['']],
    [undefined, []],
  ])('should transform "stepKinds" property into an array ("%s")', (input, result) => {
    const rawDsl = { ...rawCapabilitiesStub[0], stepKinds: input };
    const dsl = new IDsl(rawDsl);

    expect(dsl.stepKinds).toEqual(result);
  });

  it('should not throw if there is a parsing error', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const rawDsl = {
      ...rawCapabilitiesStub[0],
      output: '}{',
      supportsResourceDescription: 'not boolean',
    };

    expect(() => new IDsl(rawDsl)).not.toThrow();

    const dsl = new IDsl(rawDsl);
    expect(dsl.output).toEqual(false);
    expect(dsl.supportsResourceDescription).toEqual(false);

    consoleSpy.mockRestore();
  });
});
