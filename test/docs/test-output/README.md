# AsyncAPI Sample App

## Overview

This is a sample app.

- **Version:** 1.0.1
- **Server URL:** mqtt://api.streetlights.smartylighting.com:{port}


## Usage

```javascript
const AsyncAPISampleApp = require('./client');
const wsClient = new AsyncAPISampleApp();

async function main() {
  try {
    await wsClient.connect();
    // use wsClient to send/receive messages
    await wsClient.close();
  } catch (error) {
    console.error('Failed to connect:', error);
  }
}

main();
```


## API

### `connect()`
Establishes a WebSocket connection.

### `registerMessageHandler(handlerFunction)`
Registers a callback for incoming messages.

### `registerErrorHandler(handlerFunction)`
Registers a callback for connection errors.

### `close()`
Closes the WebSocket connection.


### Available Operations

#### `receiveLightMeasured(payload)`




#### `receiveTurnOn(payload)`




#### `smartylighting/streetlights/1/0/action/{streetlightId}/turn/on.subscribe(payload)`




#### `turnOnOff(payload)`




#### `dimLight(payload)`




