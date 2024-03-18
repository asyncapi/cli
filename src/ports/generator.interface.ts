export interface IGenerator {
  generate: (
    asyncapi: string,
    template: string,
    output: string,
    options: Record<string, any>,
    genOption: Record<string, any>) => Promise<void>;
}
