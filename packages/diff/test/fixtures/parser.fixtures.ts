/* eslint-disable sonarjs/no-duplicate-string */
export const outputJSONMessagesChannels =
  '{"asyncapi":"2.0.0","info":{"title":"My API","version":"1.0.0"},"channels":{"mychannel":{"publish":{"message":{"x-some-extension":"some extension","headers":{"type":"object","properties":{"some-common-header":{"type":"string","x-parser-schema-id":"<anonymous-schema-2>"}},"x-parser-schema-id":"<anonymous-schema-1>"},"x-parser-original-traits":[{"x-some-extension":"some extension","headers":{"type":"object","properties":{"some-common-header":{"type":"string"}}}}],"schemaFormat":"application/vnd.aai.asyncapi;version=2.0.0","x-parser-message-parsed":true,"x-parser-message-name":"channelMessage"}}}},"components":{"messages":{"channelMessage":{"x-some-extension":"some extension","headers":{"type":"object","properties":{"some-common-header":{"type":"string","x-parser-schema-id":"<anonymous-schema-2>"}},"x-parser-schema-id":"<anonymous-schema-1>"},"x-parser-original-traits":[{"x-some-extension":"some extension","headers":{"type":"object","properties":{"some-common-header":{"type":"string"}}}}],"schemaFormat":"application/vnd.aai.asyncapi;version=2.0.0","x-parser-message-parsed":true,"x-parser-message-name":"channelMessage"},"testMessage":{"payload":{"type":"object","properties":{"name":{"type":"string","x-parser-schema-id":"<anonymous-schema-3>"}},"x-parser-schema-id":"testSchema"},"x-some-extension":"some extension","headers":{"type":"object","properties":{"some-common-header":{"type":"string","x-parser-schema-id":"<anonymous-schema-5>"}},"x-parser-schema-id":"<anonymous-schema-4>"},"x-parser-original-traits":[{"x-some-extension":"some extension","headers":{"type":"object","properties":{"some-common-header":{"type":"string"}}}}],"x-parser-original-schema-format":"application/vnd.aai.asyncapi;version=2.0.0","x-parser-original-payload":{"type":"object","properties":{"name":{"type":"string"}}},"schemaFormat":"application/vnd.aai.asyncapi;version=2.0.0","x-parser-message-parsed":true,"x-parser-message-name":"testMessage"}},"schemas":{"testSchema":{"type":"object","properties":{"name":{"type":"string","x-parser-schema-id":"<anonymous-schema-3>"}},"x-parser-schema-id":"testSchema"}},"messageTraits":{"extension":{"x-some-extension":"some extension","headers":{"type":"object","properties":{"some-common-header":{"type":"string"}}}}}},"x-parser-spec-parsed":true}';

export const AsyncAPIDoc = `asyncapi: 2.0.0
info:
  title: My API
  version: '1.0.0'

channels:
  mychannel:
    publish:
      message:
        $ref: '#/components/messages/channelMessage'

components:
  messages:
    channelMessage:
      traits:
        - $ref: '#/components/messageTraits/extension'
    testMessage:
      traits:
        - $ref: '#/components/messageTraits/extension'
      payload:
        $ref: '#/components/schemas/testSchema'
  schemas:
    testSchema:
      type: object
      properties:
        name:
          type: string
  messageTraits:
    extension:
      x-some-extension: 'some extension'
      headers:
        type: object
        properties:
          some-common-header:
            type: string
`;
