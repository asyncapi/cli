export const asyncapiYAMLWithoutComponents = `asyncapi: 3.0.0
info:
  title: Streetlights API
  version: 1.0.0
channels:
  'smartylighting/event/{streetlightId}/lighting/measured':
    address: 'smartylighting/event/{streetlightId}/lighting/measured'
    messages:
      receiveLightMeasurement.message:
        name: lightMeasured
        title: Light measured
        contentType: application/json
        traits:
          - headers:
              type: object
              properties:
                my-app-header:
                  type: integer
                  minimum: 0
                  maximum: 100
        payload:
          type: object
          properties:
            lumens:
              type: integer
              minimum: 0
            sentAt:
              type: string
              format: date-time
    parameters:
      streetlightId: {}
  'smartylighting/action/{streetlightId}/turn/on':
    address: 'smartylighting/action/{streetlightId}/turn/on'
    messages:
      turnOn.message:
        name: turnOnOff
        title: Turn on/off
        headers:
          type: object
        traits:
          - headers:
              properties:
                my-app-header:
                  type: integer
                  minimum: 0
                  maximum: 100
        payload:
          type: object
          properties:
            sentAt:
              type: string
              format: date-time
    parameters:
      streetlightId: {}
operations:
  receiveLightMeasurement:
    action: send
    channel:
      $ref: '#/channels/smartylighting~1event~1{streetlightId}~1lighting~1measured'
    traits:
      - bindings:
          kafka:
            clientId: 
              type: string
              enum: ['myClientId']

    messages:
      - $ref: >-
          #/channels/smartylighting~1event~1{streetlightId}~1lighting~1measured/messages/receiveLightMeasurement.message
  turnOn:
    action: receive
    channel:
      $ref: '#/channels/smartylighting~1action~1{streetlightId}~1turn~1on'
    traits:
      - bindings:
          kafka:
            clientId:
              type: string
              enum: ['myClientId']
    messages:
      - $ref: >-
          #/channels/smartylighting~1action~1{streetlightId}~1turn~1on/messages/turnOn.message
`

export const inputYAML = `asyncapi: 3.0.0
info:
  title: Untidy AsyncAPI file
  version: 1.0.0
  description: >-
    This file contains duplicate and unused messages across the file and is used to test the optimizer.
channels:
  withDuplicatedMessage1:
    x-origin: ./messages.yaml#/withDuplicatedMessage1FromXOrigin
    address: user/signedup
    messages:
      duped1:
        payload:
          type: object
          description: I am duplicated
  withDuplicatedMessage2:
    address: user/signedup
    messages:
      duped2:
        payload:
          type: object
          description: I am duplicated
  withFullFormMessage:
    address: user/signedup
    messages:
      canBeReused:
        payload:
          type: object
          description: I can be reused.
  UserSignedUp1:
    address: user/signedup
    messages:
      myMessage:
        $ref: '#/components/messages/UserSignedUp'
  UserSignedUp2:
    address: user/signedup
    messages:
      myMessage:
        $ref: '#/components/messages/UserSignedUp'
  deleteAccount:
    address: user/deleteAccount
    messages:
      deleteUser:
        $ref: '#/components/messages/DeleteUser'
operations:
  user/deleteAccount.subscribe:
    action: send
    channel:
      $ref: '#/channels/deleteAccount'
    messages:
      - $ref: '#/channels/deleteAccount/messages/deleteUser'
components:
  channels:
    unUsedChannel:
      address: user/unused
      messages:
        myMessage:
          $ref: '#/components/messages/UserSignedUp'
  schemas:
    canBeReused:
      type: object
      description: I can be reused.
  messages:
    unUsedMessage:
      payload:
        type: boolean
    DeleteUser:
      payload:
        type: string
        description: userId of the user that is going to be deleted
    UserSignedUp:
      payload:
        type: object
        properties:
          displayName:
            type: string
            description: Name of the user
          email:
            type: string
            format: email
            description: Email of the user`

export const outputYAML_mATCFalse_mDTCTrue_schemaFalse = `asyncapi: 3.0.0
info:
  title: Untidy AsyncAPI file
  version: 1.0.0
  description: >-
    This file contains duplicate and unused messages across the file and is used
    to test the optimizer.
channels:
  withDuplicatedMessage1:
    x-origin: ./messages.yaml#/withDuplicatedMessage1FromXOrigin
    address: user/signedup
    messages:
      duped1:
        $ref: '#/components/messages/duped1'
  withDuplicatedMessage2:
    address: user/signedup
    messages:
      duped2:
        $ref: '#/components/messages/duped1'
  withFullFormMessage:
    address: user/signedup
    messages:
      canBeReused:
        payload:
          $ref: '#/components/schemas/canBeReused'
  UserSignedUp1:
    $ref: '#/components/channels/UserSignedUp1'
  UserSignedUp2:
    $ref: '#/components/channels/UserSignedUp1'
  deleteAccount:
    address: user/deleteAccount
    messages:
      deleteUser:
        $ref: '#/components/messages/DeleteUser'
operations:
  user/deleteAccount.subscribe:
    action: send
    channel:
      $ref: '#/channels/deleteAccount'
    messages:
      - $ref: '#/channels/deleteAccount/messages/deleteUser'
components:
  schemas:
    canBeReused:
      type: object
      description: I can be reused.
    payload:
      type: object
      description: I am duplicated
  messages:
    DeleteUser:
      payload:
        type: string
        description: userId of the user that is going to be deleted
    UserSignedUp:
      payload:
        type: object
        properties:
          displayName:
            type: string
            description: Name of the user
          email:
            type: string
            format: email
            description: Email of the user
    duped1:
      payload:
        $ref: '#/components/schemas/payload'
  channels:
    UserSignedUp1:
      address: user/signedup
      messages:
        myMessage:
          $ref: '#/components/messages/UserSignedUp'`

export const inputJSON = `{
  "asyncapi": "3.0.0",
  "info": {
    "title": "Untidy AsyncAPI file",
    "version": "1.0.0",
    "description": "This file contains duplicate and unused messages across the file and is used to test the optimizer."
  },
  "channels": {
    "withDuplicatedMessage1": {
      "x-origin": "./messages.yaml#/withDuplicatedMessage1FromXOrigin",
      "address": "user/signedup",
      "messages": {
        "duped1": {
          "payload": {
            "type": "object",
            "description": "I am duplicated"
          }
        }
      }
    },
    "withDuplicatedMessage2": {
      "address": "user/signedup",
      "messages": {
        "duped2": {
          "payload": {
            "type": "object",
            "description": "I am duplicated"
          }
        }
      }
    },
    "withFullFormMessage": {
      "address": "user/signedup",
      "messages": {
        "canBeReused": {
          "payload": {
            "type": "object",
            "description": "I can be reused."
          }
        }
      }
    },
    "UserSignedUp1": {
      "address": "user/signedup",
      "messages": {
        "myMessage": {
          "$ref": "#/components/messages/UserSignedUp"
        }
      }
    },
    "UserSignedUp2": {
      "address": "user/signedup",
      "messages": {
        "myMessage": {
          "$ref": "#/components/messages/UserSignedUp"
        }
      }
    },
    "deleteAccount": {
      "address": "user/deleteAccount",
      "messages": {
        "deleteUser": {
          "$ref": "#/components/messages/DeleteUser"
        }
      }
    }
  },
  "operations": {
    "user/deleteAccount.subscribe": {
      "action": "send",
      "channel": {
        "$ref": "#/channels/deleteAccount"
      },
      "messages": [
        {
          "$ref": "#/channels/deleteAccount/messages/deleteUser"
        }
      ]
    }
  },
  "components": {
    "channels": {
      "unUsedChannel": {
        "address": "user/unused",
        "messages": {
          "myMessage": {
            "$ref": "#/components/messages/UserSignedUp"
          }
        }
      }
    },
    "schemas": {
      "canBeReused": {
        "type": "object",
        "description": "I can be reused."
      }
    },
    "messages": {
      "unUsedMessage": {
        "payload": {
          "type": "boolean"
        }
      },
      "DeleteUser": {
        "payload": {
          "type": "string",
          "description": "userId of the user that is going to be deleted"
        }
      },
      "UserSignedUp": {
        "payload": {
          "type": "object",
          "properties": {
            "displayName": {
              "type": "string",
              "description": "Name of the user"
            },
            "email": {
              "type": "string",
              "format": "email",
              "description": "Email of the user"
            }
          }
        }
      }
    }
  }
}`

// eslint-disable-next-line quotes
export const outputJSON_mATCFalse_mDTCTrue_schemaFalse = `{"asyncapi":"3.0.0","info":{"title":"Untidy AsyncAPI file","version":"1.0.0","description":"This file contains duplicate and unused messages across the file and is used to test the optimizer."},"channels":{"withDuplicatedMessage1":{"x-origin":"./messages.yaml#/withDuplicatedMessage1FromXOrigin","address":"user/signedup","messages":{"duped1":{"$ref":"#/components/messages/duped1"}}},"withDuplicatedMessage2":{"address":"user/signedup","messages":{"duped2":{"$ref":"#/components/messages/duped1"}}},"withFullFormMessage":{"address":"user/signedup","messages":{"canBeReused":{"payload":{"$ref":"#/components/schemas/canBeReused"}}}},"UserSignedUp1":{"$ref":"#/components/channels/UserSignedUp1"},"UserSignedUp2":{"$ref":"#/components/channels/UserSignedUp1"},"deleteAccount":{"address":"user/deleteAccount","messages":{"deleteUser":{"$ref":"#/components/messages/DeleteUser"}}}},"operations":{"user/deleteAccount.subscribe":{"action":"send","channel":{"$ref":"#/channels/deleteAccount"},"messages":[{"$ref":"#/channels/deleteAccount/messages/deleteUser"}]}},"components":{"schemas":{"canBeReused":{"type":"object","description":"I can be reused."},"payload":{"type":"object","description":"I am duplicated"}},"messages":{"DeleteUser":{"payload":{"type":"string","description":"userId of the user that is going to be deleted"}},"UserSignedUp":{"payload":{"type":"object","properties":{"displayName":{"type":"string","description":"Name of the user"},"email":{"type":"string","format":"email","description":"Email of the user"}}}},"duped1":{"payload":{"$ref":"#/components/schemas/payload"}}},"channels":{"UserSignedUp1":{"address":"user/signedup","messages":{"myMessage":{"$ref":"#/components/messages/UserSignedUp"}}}}}}`

export const outputYAML_mATCTrue_mDTCFalse_schemaFalse = `asyncapi: 3.0.0
info:
  title: Untidy AsyncAPI file
  version: 1.0.0
  description: >-
    This file contains duplicate and unused messages across the file and is used
    to test the optimizer.
channels:
  withDuplicatedMessage1:
    $ref: '#/components/channels/withDuplicatedMessage1FromXOrigin'
  withDuplicatedMessage2:
    $ref: '#/components/channels/withDuplicatedMessage2'
  withFullFormMessage:
    $ref: '#/components/channels/withFullFormMessage'
  UserSignedUp1:
    $ref: '#/components/channels/UserSignedUp1'
  UserSignedUp2:
    $ref: '#/components/channels/UserSignedUp2'
  deleteAccount:
    $ref: '#/components/channels/deleteAccount'
operations:
  user/deleteAccount.subscribe:
    action: send
    channel:
      $ref: '#/channels/deleteAccount'
    messages:
      - $ref: '#/channels/deleteAccount/messages/deleteUser'
  user/deleteAccount:
    subscribe:
      $ref: '#/components/operations/subscribe'
components:
  schemas:
    canBeReused:
      type: object
      description: I can be reused.
    payload:
      type: object
      description: I am duplicated
  messages:
    DeleteUser:
      payload:
        type: string
        description: userId of the user that is going to be deleted
    UserSignedUp:
      payload:
        type: object
        properties:
          displayName:
            type: string
            description: Name of the user
          email:
            type: string
            format: email
            description: Email of the user
    canBeReused:
      payload:
        $ref: '#/components/schemas/canBeReused'
    duped1:
      payload:
        $ref: '#/components/schemas/payload'
    duped2:
      payload:
        $ref: '#/components/schemas/payload'
  operations: {}
  channels:
    withDuplicatedMessage1FromXOrigin:
      x-origin: ./messages.yaml#/withDuplicatedMessage1FromXOrigin
      address: user/signedup
      messages:
        duped1:
          $ref: '#/components/messages/duped1'
    withDuplicatedMessage2:
      address: user/signedup
      messages:
        duped2:
          $ref: '#/components/messages/duped2'
    withFullFormMessage:
      address: user/signedup
      messages:
        canBeReused:
          $ref: '#/components/messages/canBeReused'
    UserSignedUp1:
      address: user/signedup
      messages:
        myMessage:
          $ref: '#/components/messages/UserSignedUp'
          payload:
            properties:
              displayName:
                $ref: '#/components/schemas/displayName'
              email:
                $ref: '#/components/schemas/email'
    UserSignedUp2:
      address: user/signedup
      messages:
        myMessage:
          $ref: '#/components/messages/UserSignedUp'
    deleteAccount:
      address: user/deleteAccount
      messages:
        deleteUser:
          $ref: '#/components/messages/DeleteUser'`
          
// eslint-disable-next-line quotes
export const outputJSON_mATCTrue_mDTCFalse_schemaFalse = `{"asyncapi":"3.0.0","info":{"title":"Untidy AsyncAPI file","version":"1.0.0","description":"This file contains duplicate and unused messages across the file and is used to test the optimizer."},"channels":{"withDuplicatedMessage1":{"$ref":"#/components/channels/withDuplicatedMessage1FromXOrigin"},"withDuplicatedMessage2":{"$ref":"#/components/channels/withDuplicatedMessage2"},"withFullFormMessage":{"$ref":"#/components/channels/withFullFormMessage"},"UserSignedUp1":{"$ref":"#/components/channels/UserSignedUp1"},"UserSignedUp2":{"$ref":"#/components/channels/UserSignedUp2"},"deleteAccount":{"$ref":"#/components/channels/deleteAccount"}},"operations":{"user/deleteAccount.subscribe":{"action":"send","channel":{"$ref":"#/channels/deleteAccount"},"messages":[{"$ref":"#/channels/deleteAccount/messages/deleteUser"}]},"user/deleteAccount":{"subscribe":{"$ref":"#/components/operations/subscribe"}}},"components":{"schemas":{"canBeReused":{"type":"object","description":"I can be reused."},"payload":{"type":"object","description":"I am duplicated"}},"messages":{"DeleteUser":{"payload":{"type":"string","description":"userId of the user that is going to be deleted"}},"UserSignedUp":{"payload":{"type":"object","properties":{"displayName":{"type":"string","description":"Name of the user"},"email":{"type":"string","format":"email","description":"Email of the user"}}}},"canBeReused":{"payload":{"$ref":"#/components/schemas/canBeReused"}},"duped1":{"payload":{"$ref":"#/components/schemas/payload"}},"duped2":{"payload":{"$ref":"#/components/schemas/payload"}}},"operations":{},"channels":{"withDuplicatedMessage1FromXOrigin":{"x-origin":"./messages.yaml#/withDuplicatedMessage1FromXOrigin","address":"user/signedup","messages":{"duped1":{"$ref":"#/components/messages/duped1"}}},"withDuplicatedMessage2":{"address":"user/signedup","messages":{"duped2":{"$ref":"#/components/messages/duped2"}}},"withFullFormMessage":{"address":"user/signedup","messages":{"canBeReused":{"$ref":"#/components/messages/canBeReused"}}},"UserSignedUp1":{"address":"user/signedup","messages":{"myMessage":{"$ref":"#/components/messages/UserSignedUp","payload":{"properties":{"displayName":{"$ref":"#/components/schemas/displayName"},"email":{"$ref":"#/components/schemas/email"}}}}}},"UserSignedUp2":{"address":"user/signedup","messages":{"myMessage":{"$ref":"#/components/messages/UserSignedUp"}}},"deleteAccount":{"address":"user/deleteAccount","messages":{"deleteUser":{"$ref":"#/components/messages/DeleteUser"}}}}}}`

export const outputYAML_mATCFalse_mDTCTrue_schemaTrue = `asyncapi: 3.0.0
info:
  title: Untidy AsyncAPI file
  version: 1.0.0
  description: >-
    This file contains duplicate and unused messages across the file and is used
    to test the optimizer.
channels:
  withDuplicatedMessage1:
    x-origin: ./messages.yaml#/withDuplicatedMessage1FromXOrigin
    address: user/signedup
    messages:
      duped1:
        $ref: '#/components/messages/duped1'
  withDuplicatedMessage2:
    address: user/signedup
    messages:
      duped2:
        $ref: '#/components/messages/duped1'
  withFullFormMessage:
    address: user/signedup
    messages:
      canBeReused:
        payload:
          type: object
          description: I can be reused.
  UserSignedUp1:
    $ref: '#/components/channels/UserSignedUp1'
  UserSignedUp2:
    $ref: '#/components/channels/UserSignedUp1'
  deleteAccount:
    address: user/deleteAccount
    messages:
      deleteUser:
        $ref: '#/components/messages/DeleteUser'
operations:
  user/deleteAccount.subscribe:
    action: send
    channel:
      $ref: '#/channels/deleteAccount'
    messages:
      - $ref: '#/channels/deleteAccount/messages/deleteUser'
components:
  schemas:
    canBeReused:
      type: object
      description: I can be reused.
  messages:
    DeleteUser:
      payload:
        type: string
        description: userId of the user that is going to be deleted
    UserSignedUp:
      payload:
        type: object
        properties:
          displayName:
            type: string
            description: Name of the user
          email:
            type: string
            format: email
            description: Email of the user
    duped1:
      payload:
        type: object
        description: I am duplicated
  channels:
    UserSignedUp1:
      address: user/signedup
      messages:
        myMessage:
          $ref: '#/components/messages/UserSignedUp'`
          
// eslint-disable-next-line quotes
export const outputJSON_mATCFalse_mDTCTrue_schemaTrue = `{"asyncapi":"3.0.0","info":{"title":"Untidy AsyncAPI file","version":"1.0.0","description":"This file contains duplicate and unused messages across the file and is used to test the optimizer."},"channels":{"withDuplicatedMessage1":{"x-origin":"./messages.yaml#/withDuplicatedMessage1FromXOrigin","address":"user/signedup","messages":{"duped1":{"$ref":"#/components/messages/duped1"}}},"withDuplicatedMessage2":{"address":"user/signedup","messages":{"duped2":{"$ref":"#/components/messages/duped1"}}},"withFullFormMessage":{"address":"user/signedup","messages":{"canBeReused":{"payload":{"type":"object","description":"I can be reused."}}}},"UserSignedUp1":{"$ref":"#/components/channels/UserSignedUp1"},"UserSignedUp2":{"$ref":"#/components/channels/UserSignedUp1"},"deleteAccount":{"address":"user/deleteAccount","messages":{"deleteUser":{"$ref":"#/components/messages/DeleteUser"}}}},"operations":{"user/deleteAccount.subscribe":{"action":"send","channel":{"$ref":"#/channels/deleteAccount"},"messages":[{"$ref":"#/channels/deleteAccount/messages/deleteUser"}]}},"components":{"schemas":{"canBeReused":{"type":"object","description":"I can be reused."}},"messages":{"DeleteUser":{"payload":{"type":"string","description":"userId of the user that is going to be deleted"}},"UserSignedUp":{"payload":{"type":"object","properties":{"displayName":{"type":"string","description":"Name of the user"},"email":{"type":"string","format":"email","description":"Email of the user"}}}},"duped1":{"payload":{"type":"object","description":"I am duplicated"}}},"channels":{"UserSignedUp1":{"address":"user/signedup","messages":{"myMessage":{"$ref":"#/components/messages/UserSignedUp"}}}}}}`

export const outputYAML_mATCTrue_mDTCFalse_schemaTrue = `asyncapi: 3.0.0
info:
  title: Untidy AsyncAPI file
  version: 1.0.0
  description: >-
    This file contains duplicate and unused messages across the file and is used
    to test the optimizer.
channels:
  withDuplicatedMessage1:
    $ref: '#/components/channels/withDuplicatedMessage1FromXOrigin'
  withDuplicatedMessage2:
    $ref: '#/components/channels/withDuplicatedMessage2'
  withFullFormMessage:
    $ref: '#/components/channels/withFullFormMessage'
  UserSignedUp1:
    $ref: '#/components/channels/UserSignedUp1'
  UserSignedUp2:
    $ref: '#/components/channels/UserSignedUp2'
  deleteAccount:
    $ref: '#/components/channels/deleteAccount'
operations:
  user/deleteAccount.subscribe:
    action: send
    channel:
      $ref: '#/channels/deleteAccount'
    messages:
      - $ref: '#/channels/deleteAccount/messages/deleteUser'
  user/deleteAccount:
    subscribe:
      $ref: '#/components/operations/subscribe'
components:
  schemas:
    canBeReused:
      type: object
      description: I can be reused.
  messages:
    DeleteUser:
      payload:
        type: string
        description: userId of the user that is going to be deleted
    UserSignedUp:
      payload:
        type: object
        properties:
          displayName:
            type: string
            description: Name of the user
          email:
            type: string
            format: email
            description: Email of the user
    canBeReused:
      payload:
        type: object
        description: I can be reused.
    duped1:
      payload:
        type: object
        description: I am duplicated
    duped2:
      payload:
        type: object
        description: I am duplicated
  operations: {}
  channels:
    withDuplicatedMessage1FromXOrigin:
      x-origin: ./messages.yaml#/withDuplicatedMessage1FromXOrigin
      address: user/signedup
      messages:
        duped1:
          $ref: '#/components/messages/duped1'
    withDuplicatedMessage2:
      address: user/signedup
      messages:
        duped2:
          $ref: '#/components/messages/duped2'
    withFullFormMessage:
      address: user/signedup
      messages:
        canBeReused:
          $ref: '#/components/messages/canBeReused'
    UserSignedUp1:
      address: user/signedup
      messages:
        myMessage:
          $ref: '#/components/messages/UserSignedUp'
    UserSignedUp2:
      address: user/signedup
      messages:
        myMessage:
          $ref: '#/components/messages/UserSignedUp'
    deleteAccount:
      address: user/deleteAccount
      messages:
        deleteUser:
          $ref: '#/components/messages/DeleteUser'`
          
// eslint-disable-next-line quotes
export const outputJSON_mATCTrue_mDTCFalse_schemaTrue = `{"asyncapi":"3.0.0","info":{"title":"Untidy AsyncAPI file","version":"1.0.0","description":"This file contains duplicate and unused messages across the file and is used to test the optimizer."},"channels":{"withDuplicatedMessage1":{"$ref":"#/components/channels/withDuplicatedMessage1FromXOrigin"},"withDuplicatedMessage2":{"$ref":"#/components/channels/withDuplicatedMessage2"},"withFullFormMessage":{"$ref":"#/components/channels/withFullFormMessage"},"UserSignedUp1":{"$ref":"#/components/channels/UserSignedUp1"},"UserSignedUp2":{"$ref":"#/components/channels/UserSignedUp2"},"deleteAccount":{"$ref":"#/components/channels/deleteAccount"}},"operations":{"user/deleteAccount.subscribe":{"action":"send","channel":{"$ref":"#/channels/deleteAccount"},"messages":[{"$ref":"#/channels/deleteAccount/messages/deleteUser"}]},"user/deleteAccount":{"subscribe":{"$ref":"#/components/operations/subscribe"}}},"components":{"schemas":{"canBeReused":{"type":"object","description":"I can be reused."}},"messages":{"DeleteUser":{"payload":{"type":"string","description":"userId of the user that is going to be deleted"}},"UserSignedUp":{"payload":{"type":"object","properties":{"displayName":{"type":"string","description":"Name of the user"},"email":{"type":"string","format":"email","description":"Email of the user"}}}},"canBeReused":{"payload":{"type":"object","description":"I can be reused."}},"duped1":{"payload":{"type":"object","description":"I am duplicated"}},"duped2":{"payload":{"type":"object","description":"I am duplicated"}}},"operations":{},"channels":{"withDuplicatedMessage1FromXOrigin":{"x-origin":"./messages.yaml#/withDuplicatedMessage1FromXOrigin","address":"user/signedup","messages":{"duped1":{"$ref":"#/components/messages/duped1"}}},"withDuplicatedMessage2":{"address":"user/signedup","messages":{"duped2":{"$ref":"#/components/messages/duped2"}}},"withFullFormMessage":{"address":"user/signedup","messages":{"canBeReused":{"$ref":"#/components/messages/canBeReused"}}},"UserSignedUp1":{"address":"user/signedup","messages":{"myMessage":{"$ref":"#/components/messages/UserSignedUp"}}},"UserSignedUp2":{"address":"user/signedup","messages":{"myMessage":{"$ref":"#/components/messages/UserSignedUp"}}},"deleteAccount":{"address":"user/deleteAccount","messages":{"deleteUser":{"$ref":"#/components/messages/DeleteUser"}}}}}}`
