const fileTemplate =
  'import { GleeFunction, GleeFunctionEvent } from "@asyncapi/glee"; {{{payloadType}}} type GleeFunctionEventWithCustomPayload = GleeFunctionEvent & { payload?: PayloadType;}; const {{functionName}}: GleeFunction = async ( event: GleeFunctionEventWithCustomPayload,) => { return { reply: [{payload:`Hello from Glee! You said: "${event.payload}".`,},],};};export default {{functionName}}; ';

export default fileTemplate;
