[![AsyncAPI Optimizer](./assets/readme-banner.png)](https://www.asyncapi.com)

AsyncAPI offers many ways to reuse certain parts of the document like messages or schemas definitions or references to external files, not to even mention the traits. Purpose of **AsyncAPI Optimizer** is to enable different ways to optimize AsyncAPI files. It is a library that can be used in UIs and CLIs.

> **This package now lives in the [`asyncapi/cli`](https://github.com/asyncapi/cli) monorepo** under
> `packages/optimizer/` and is released from there (same npm name `@asyncapi/optimizer`).
>
> **v2 is a breaking release for direct library consumers.** Errors are now typed classes carrying a stable
> `.code` (`OptimizerError` / `OptimizerErrorCode`) instead of plain `Error` + `console.error`; `getReport()`
> now returns `{ type, elements }[]`; and `@asyncapi/parser` is now a **peerDependency** (install it alongside).
> The optimization algorithm and `getOptimizedDocument()` behaviour are unchanged. See the migration guide:
> [`docs/optimizer-migration.md`](https://github.com/asyncapi/cli/blob/master/docs/optimizer-migration.md).

![npm](https://img.shields.io/npm/v/@asyncapi/optimizer?style=for-the-badge) ![npm](https://img.shields.io/npm/dt/@asyncapi/optimizer?style=for-the-badge)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Testing](#testing)
- [Usage](#usage)
  - [Node.js](#nodejs)
  - [Generating report](#generating-report)
  - [Applying the suggested changes](#applying-the-suggested-changes)
- [API documentation](#api-documentation)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Testing

1. Clone the CLI monorepo
   `git clone https://github.com/asyncapi/cli.git`
2. Install the dependencies from the repo root
   `npm i`
3. Build this package with `npm run optimizer:build`, or from `packages/optimizer` run `npm run example`. You can open `examples/index.js` and modify it or add your own AsyncAPI document.

## Usage

### Node.js

```typescript
import { Optimizer } from '@asyncapi/optimizer'
import type { Report } from '@asyncapi/optimizer'

const yaml = `
asyncapi: 3.0.0
info:
  title: Example Service
  version: 1.0.0
  description: Example Service.
servers:
  production:
    host: 'test.mosquitto.org:{port}'
    protocol: mqtt
    description: Test broker
    variables:
      port:
        description: Secure connection (TLS) is available through port 8883.
        default: '1883'
        enum:
          - '1883'
          - '8883'
operations:
  user/deleteAccount.subscribe:
    action: send
    channel:
      $ref: '#/channels/commentLikedChannel'
channels:
  commentLikedChannel:
    address: comment/liked
    messages:
      commentLikedMessage:
        description: Message that is being sent when a comment has been liked by someone.
        payload:
          type: object
          title: commentLikedPayload
          properties:
            commentId:
              type: string
              description: an id object
              x-origin: ./schemas.yaml#/schemas/idSchema
          x-origin: ./schemas.yaml#/schemas/commentLikedSchema
        x-origin: ./messages.yaml#/messages/commentLikedMessage
    x-origin: ./channels.yaml#/channels/commentLikedChannel`

const optimizer = new Optimizer(yaml)
```

### Generating report

```typescript
const report = await optimizer.getReport()
/*
v2: getReport() returns { type, elements }[] (not a keyed object).

[
  { type: 'removeComponents', elements: [] },
  { type: 'reuseComponents', elements: [] },
  {
    type: 'moveAllToComponents',
    elements: [
      {
        path: 'channels.commentLikedChannel.messages.commentLikedMessage.payload.properties.commentId',
        action: 'move',
        target: 'components.schemas.idSchema'
      },
      {
        path: 'channels.commentLikedChannel.messages.commentLikedMessage.payload',
        action: 'move',
        target: 'components.schemas.commentLikedSchema'
      },
      {
        path: 'channels.commentLikedChannel.messages.commentLikedMessage',
        action: 'move',
        target: 'components.messages.commentLikedMessage'
      },
      {
        path: 'operations.user/deleteAccount.subscribe',
        action: 'move',
        target: 'components.operations.subscribe'
      },
      {
        path: 'channels.commentLikedChannel',
        action: 'move',
        target: 'components.channels.commentLikedChannel'
      },
      {
        path: 'servers.production',
        action: 'move',
        target: 'components.servers.production'
      }
    ]
  },
  { type: 'moveDuplicatesToComponents', elements: [] }
]
 */
```

### Applying the suggested changes

```typescript
const optimizedDocument = optimizer.getOptimizedDocument({
  output: 'YAML',
  rules: {
    reuseComponents: true,
    removeComponents: true,
    moveAllToComponents: true,
    moveDuplicatesToComponents: false,
  },
  disableOptimizationFor: {
    schema: false,
  },
})
/*
the optimizedDocument value will be:

asyncapi: 3.0.0
info:
  title: Example Service
  version: 1.0.0
  description: Example Service.
servers:
  production:
    $ref: '#/components/servers/production'
operations:
  user/deleteAccount.subscribe:
    action: send
    channel:
      $ref: '#/channels/commentLikedChannel'
  user/deleteAccount:
    subscribe:
      $ref: '#/components/operations/subscribe'
channels:
  commentLikedChannel:
    $ref: '#/components/channels/commentLikedChannel'
components:
  schemas:
    idSchema:
      type: string
      description: an id object
      x-origin: ./schemas.yaml#/schemas/idSchema
    commentLikedSchema:
      type: object
      title: commentLikedPayload
      properties:
        commentId:
          $ref: '#/components/schemas/idSchema'
      x-origin: ./schemas.yaml#/schemas/commentLikedSchema
  messages:
    commentLikedMessage:
      description: Message that is being sent when a comment has been liked by someone.
      payload:
        $ref: '#/components/schemas/commentLikedSchema'
      x-origin: ./messages.yaml#/messages/commentLikedMessage
  operations: {}
  channels:
    commentLikedChannel:
      address: comment/liked
      messages:
        commentLikedMessage:
          $ref: '#/components/messages/commentLikedMessage'
      x-origin: ./channels.yaml#/channels/commentLikedChannel
  servers:
    production:
      host: test.mosquitto.org:{port}
      protocol: mqtt
      description: Test broker
      variables:
        port:
          description: Secure connection (TLS) is available through port 8883.
          default: '1883'
          enum:
            - '1883'
            - '8883'
 */
```

## API documentation

For using the optimizer to optimize file you just need to import the `Optimizer` class. Use its two methods to get the report (`getReport()`) and get the optimized document (`getOptimizedDocument()`).

See [API documentation](./API.md) for more example and full API reference information.
