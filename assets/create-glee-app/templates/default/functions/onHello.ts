import { GleeFunctionReturn } from "@asyncapi/glee"

export default async function (event): Promise<GleeFunctionReturn> {  
  return {
    send: [{
      payload: `Hello from Glee! You said: '${event.payload}'.`,
      channel: "hello",
      server: "websockets"
    }]
  }
}
