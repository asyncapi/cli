import { TypeScriptGenerator } from "@asyncapi/modelina";

const generator = new TypeScriptGenerator({ modelType: "interface" });
const jsonSchemaDraft7 = {
  type: "object",
  properties: {
    hello: {
      type: "string",
    },
  },
};

export async function createTypes(): Promise<void> {
  console.log("the function is running.");
  const models = await generator.generate(jsonSchemaDraft7);
  for (const model of models) {
    console.log(model.result);
  }
  console.log({ models });
}
