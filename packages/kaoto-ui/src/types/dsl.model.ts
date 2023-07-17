const BRACKETS_REGEXP = /[\[\]]/g;

export interface ICapabilities {
  dsls: IDsl[];
}

/**
 * Definition of a DSL supported by the backend.
 *
 * @see https://github.com/KaotoIO/kaoto-backend/blob/411a91e0d79e895c5ded32c5a6fe0340cc059d43/api/src/main/java/io/kaoto/backend/api/service/language/LanguageService.java#L42
 */
export interface IRawDsl {
  name: string;
  description: string;
  stepKinds?: string;
  output: string;
  input: string;
  deployable: string;
  validationSchema: string;
  supportsMultipleFlows: string;
  supportsResourceDescription: string;
  vocabulary: Record<string, string>;
  default?: string;
}

export class IDsl
  implements Pick<IRawDsl, 'name' | 'description' | 'validationSchema' | 'vocabulary'>
{
  name: string;
  description: string;
  stepKinds: string[] = [];
  output = false;
  input = false;
  deployable = false;
  validationSchema: string;
  supportsMultipleFlows = false;
  supportsResourceDescription = false;
  vocabulary: Record<string, string> = {};
  default = false;

  constructor(rawDsl: IRawDsl) {
    this.name = rawDsl.name;
    this.description = rawDsl.description;
    this.validationSchema = rawDsl.validationSchema;
    this.vocabulary = rawDsl.vocabulary;

    try {
      BRACKETS_REGEXP.lastIndex = 0;
      this.stepKinds = rawDsl.stepKinds?.replaceAll(BRACKETS_REGEXP, '').trim().split(', ') ?? [];
      this.output = JSON.parse(rawDsl.output);
      this.input = JSON.parse(rawDsl.input);
      this.deployable = JSON.parse(rawDsl.deployable);
      this.supportsMultipleFlows = JSON.parse(rawDsl.supportsMultipleFlows);
      this.supportsResourceDescription = JSON.parse(rawDsl.supportsResourceDescription);
      this.default = JSON.parse(rawDsl.default ?? 'false');
    } catch (error) {
      console.error(`Error while parsing DSL ${rawDsl.name}`);
    }
  }
}
