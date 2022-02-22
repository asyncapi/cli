declare module '@asyncapi/generator' {
    export default class Generator {
      constructor(template: string, outputdir: string, options?: any)

      generateFomString(asyncapiString: string, parserOptions?: any ): Promise<any>
    }
}
