import { TypeScriptGenerator } from "@asyncapi/modelina";

const generator = new TypeScriptGenerator({
  modelType: "interface",
  constraints: {
    modelName: () => {
      return "PayloadType";
    },
  },
});

export async function createTypes(payload: any): Promise<any> {
  const models = await generator.generate(payload[0].payload);
  for (const model of models) {
    return model.result;
  }
}
