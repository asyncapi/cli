This is a [Glee](https://github.com/asyncapi/glee) project bootstrapped with the [AsyncAPI CLI](https://github.com/asyncapi/cli).

## Getting Started

1) Install Dependencies:

```bash
npm install --ignore-scripts
```



2) run the development server:

```bash
npm run dev
```

3) send some text to the websocket server at `ws://0.0.0.0:3000/hello`

```bash
websocat ws://0.0.0.0:3000/hello
Hi!
```
You can start editing the API by modifying `functions/onHello.js` and `asyncapi.yaml`. The server auto-updates as you edit the file.

## Learn More

To learn more about Glee features and API, take a look at the [documentation](https://github.com/asyncapi/glee/tree/master/docs).

You can check out [the Glee Github repository](https://github.com/asyncapi/glee/) - your feedback and contributions are welcome!
