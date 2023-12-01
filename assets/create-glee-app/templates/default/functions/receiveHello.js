export default async function (event) {  
  return {
    reply: [{
      payload: `Hello from Glee! You said: "${event.payload}".`
    }]
  }
}
