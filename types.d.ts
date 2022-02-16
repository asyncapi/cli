declare module '@asyncapi/generator' {
    export default class Generator {
      constructor(template: string, outputdir: string, options?: any)

      async generateFromFile(filepath: string)
      async generateFromURL(url: string)
      async generateFomString(asyncapiString: string, parserOptions: any = {})
    }
}
