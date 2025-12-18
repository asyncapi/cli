 
import { expect, test } from '@oclif/test';

const asyncapiv3 = './test/fixtures/specification-v3.yml';
const asyncapiv3Diff = './test/fixtures/specification-v3-diff.yml';
const asyncapiv2 = './test/fixtures/specification.yml';
const noChangesJson = '"{\\n  \\"changes\\": []\\n}\\n"';
const breakingChangesJson = '"[\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/servers/mosquitto/protocol\\",\\n    \\"before\\": \\"mqtt\\",\\n    \\"after\\": \\"http\\",\\n    \\"type\\": \\"breaking\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/servers/mosquitto/url\\",\\n    \\"before\\": \\"mqtt://test.mosquitto.org\\",\\n    \\"after\\": \\"http://test.mosquitto.org\\",\\n    \\"type\\": \\"breaking\\"\\n  }\\n]\\n"';
const nonBreakingChangesJson = '"[\\n  {\\n    \\"action\\": \\"add\\",\\n    \\"path\\": \\"/channels/user~1signedup\\",\\n    \\"after\\": {\\n      \\"subscribe\\": {\\n        \\"message\\": {\\n          \\"payload\\": {\\n            \\"type\\": \\"object\\",\\n            \\"properties\\": {\\n              \\"displayName\\": {\\n                \\"type\\": \\"string\\",\\n                \\"description\\": \\"Name of the user\\",\\n                \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n              },\\n              \\"email\\": {\\n                \\"type\\": \\"string\\",\\n                \\"format\\": \\"email\\",\\n                \\"description\\": \\"Email of the user\\",\\n                \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n              }\\n            },\\n            \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n          },\\n          \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n        }\\n      }\\n    },\\n    \\"type\\": \\"non-breaking\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/info/title\\",\\n    \\"before\\": \\"Streetlights API\\",\\n    \\"after\\": \\"Streetlights API V2\\",\\n    \\"type\\": \\"non-breaking\\"\\n  },\\n  {\\n    \\"action\\": \\"add\\",\\n    \\"path\\": \\"/components\\",\\n    \\"after\\": {\\n      \\"messages\\": {\\n        \\"UserSignedUp\\": {\\n          \\"payload\\": {\\n            \\"type\\": \\"object\\",\\n            \\"properties\\": {\\n              \\"displayName\\": {\\n                \\"type\\": \\"string\\",\\n                \\"description\\": \\"Name of the user\\",\\n                \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n              },\\n              \\"email\\": {\\n                \\"type\\": \\"string\\",\\n                \\"format\\": \\"email\\",\\n                \\"description\\": \\"Email of the user\\",\\n                \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n              }\\n            },\\n            \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n          },\\n          \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n        }\\n      }\\n    },\\n    \\"type\\": \\"non-breaking\\"\\n  }\\n]\\n"';
const unclassifiedChangesJson = '"[\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/payload/x-parser-schema-id\\",\\n    \\"before\\": \\"<anonymous-schema-1>\\",\\n    \\"after\\": \\"<anonymous-schema-4>\\",\\n    \\"type\\": \\"unclassified\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/sentAt/x-parser-schema-id\\",\\n    \\"before\\": \\"<anonymous-schema-4>\\",\\n    \\"after\\": \\"<anonymous-schema-7>\\",\\n    \\"type\\": \\"unclassified\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/lumens/x-parser-schema-id\\",\\n    \\"before\\": \\"<anonymous-schema-3>\\",\\n    \\"after\\": \\"<anonymous-schema-6>\\",\\n    \\"type\\": \\"unclassified\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/x-parser-schema-id\\",\\n    \\"before\\": \\"<anonymous-schema-2>\\",\\n    \\"after\\": \\"<anonymous-schema-5>\\",\\n    \\"type\\": \\"unclassified\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n    \\"before\\": 0,\\n    \\"after\\": 1,\\n    \\"type\\": \\"unclassified\\"\\n  }\\n]\\n"';
const commonJsonOutput = '{\\n  \\"changes\\": [\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-1>\\",\\n      \\"after\\": \\"<anonymous-schema-4>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/sentAt/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-4>\\",\\n      \\"after\\": \\"<anonymous-schema-7>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/lumens/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-3>\\",\\n      \\"after\\": \\"<anonymous-schema-6>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-2>\\",\\n      \\"after\\": \\"<anonymous-schema-5>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"add\\",\\n      \\"path\\": \\"/channels/user~1signedup\\",\\n      \\"after\\": {\\n        \\"subscribe\\": {\\n          \\"message\\": {\\n            \\"payload\\": {\\n              \\"type\\": \\"object\\",\\n              \\"properties\\": {\\n                \\"displayName\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"description\\": \\"Name of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n                },\\n                \\"email\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"format\\": \\"email\\",\\n                  \\"description\\": \\"Email of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n                }\\n              },\\n              \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n            },\\n            \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n          }\\n        }\\n      },\\n      \\"type\\": \\"non-breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/protocol\\",\\n      \\"before\\": \\"mqtt\\",\\n      \\"after\\": \\"http\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/url\\",\\n      \\"before\\": \\"mqtt://test.mosquitto.org\\",\\n      \\"after\\": \\"http://test.mosquitto.org\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/info/title\\",\\n      \\"before\\": \\"Streetlights API\\",\\n      \\"after\\": \\"Streetlights API V2\\",\\n      \\"type\\": \\"non-breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"add\\",\\n      \\"path\\": \\"/components\\",\\n      \\"after\\": {\\n        \\"messages\\": {\\n          \\"UserSignedUp\\": {\\n            \\"payload\\": {\\n              \\"type\\": \\"object\\",\\n              \\"properties\\": {\\n                \\"displayName\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"description\\": \\"Name of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n                },\\n                \\"email\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"format\\": \\"email\\",\\n                  \\"description\\": \\"Email of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n                }\\n              },\\n              \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n            },\\n            \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n          }\\n        }\\n      },\\n      \\"type\\": \\"non-breaking\\"\\n    }\\n  ]\\n}\\n';
const customJsonOutput = '"{\\n  \\"changes\\": [\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-1>\\",\\n      \\"after\\": \\"<anonymous-schema-4>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/sentAt/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-4>\\",\\n      \\"after\\": \\"<anonymous-schema-7>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/lumens/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-3>\\",\\n      \\"after\\": \\"<anonymous-schema-6>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-2>\\",\\n      \\"after\\": \\"<anonymous-schema-5>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"add\\",\\n      \\"path\\": \\"/channels/user~1signedup\\",\\n      \\"after\\": {\\n        \\"subscribe\\": {\\n          \\"message\\": {\\n            \\"payload\\": {\\n              \\"type\\": \\"object\\",\\n              \\"properties\\": {\\n                \\"displayName\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"description\\": \\"Name of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n                },\\n                \\"email\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"format\\": \\"email\\",\\n                  \\"description\\": \\"Email of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n                }\\n              },\\n              \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n            },\\n            \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n          }\\n        }\\n      },\\n      \\"type\\": \\"non-breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/protocol\\",\\n      \\"before\\": \\"mqtt\\",\\n      \\"after\\": \\"http\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/url\\",\\n      \\"before\\": \\"mqtt://test.mosquitto.org\\",\\n      \\"after\\": \\"http://test.mosquitto.org\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/info/title\\",\\n      \\"before\\": \\"Streetlights API\\",\\n      \\"after\\": \\"Streetlights API V2\\",\\n      \\"type\\": \\"non-breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"add\\",\\n      \\"path\\": \\"/components\\",\\n      \\"after\\": {\\n        \\"messages\\": {\\n          \\"UserSignedUp\\": {\\n            \\"payload\\": {\\n              \\"type\\": \\"object\\",\\n              \\"properties\\": {\\n                \\"displayName\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"description\\": \\"Name of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n                },\\n                \\"email\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"format\\": \\"email\\",\\n                  \\"description\\": \\"Email of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n                }\\n              },\\n              \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n            },\\n            \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n          }\\n        }\\n      },\\n      \\"type\\": \\"non-breaking\\"\\n    }\\n  ]\\n}\\n"';
const commonJsonOutputV3 = '"{\\n  \\"changes\\": [\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/operations/smartylighting~1streetlights~11~10~1action~1{streetlightId}~1turn~1on.subscribe/channel/servers/1/pathname\\",\\n      \\"before\\": \\"/some/path\\",\\n      \\"after\\": \\"/some/path-name\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/operations/smartylighting~1streetlights~11~10~1action~1{streetlightId}~1turn~1on.subscribe/channel/servers/0/variables/port/default\\",\\n      \\"before\\": \\"1883\\",\\n      \\"after\\": \\"8883\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/operations/receiveTurnOn/channel/servers/1/pathname\\",\\n      \\"before\\": \\"/some/path\\",\\n      \\"after\\": \\"/some/path-name\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/operations/receiveTurnOn/channel/servers/0/variables/port/default\\",\\n      \\"before\\": \\"1883\\",\\n      \\"after\\": \\"8883\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/operations/receiveLightMeasured/channel/servers/0/pathname\\",\\n      \\"before\\": \\"/some/path\\",\\n      \\"after\\": \\"/some/path-name\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/turnOn/servers/1/pathname\\",\\n      \\"before\\": \\"/some/path\\",\\n      \\"after\\": \\"/some/path-name\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/turnOn/servers/0/variables/port/default\\",\\n      \\"before\\": \\"1883\\",\\n      \\"after\\": \\"8883\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/lightingMeasured/servers/0/pathname\\",\\n      \\"before\\": \\"/some/path\\",\\n      \\"after\\": \\"/some/path-name\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/production/pathname\\",\\n      \\"before\\": \\"/some/path\\",\\n      \\"after\\": \\"/some/path-name\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/default/variables/port/default\\",\\n      \\"before\\": \\"1883\\",\\n      \\"after\\": \\"8883\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/info/title\\",\\n      \\"before\\": \\"AsyncAPI Sample App\\",\\n      \\"after\\": \\"AsyncAPI App\\",\\n      \\"type\\": \\"non-breaking\\"\\n    }\\n  ]\\n}\\n"';

const noChangesYaml = '"changes: []\\n\\n"';
const commonYamlOutput = '"changes:\\n  - action: edit\\n    path: /channels/light~1measured/publish/message/payload/x-parser-schema-id\\n    before: <anonymous-schema-1>\\n    after: <anonymous-schema-4>\\n    type: unclassified\\n  - action: edit\\n    path: >-\\n      /channels/light~1measured/publish/message/payload/properties/sentAt/x-parser-schema-id\\n    before: <anonymous-schema-4>\\n    after: <anonymous-schema-7>\\n    type: unclassified\\n  - action: edit\\n    path: >-\\n      /channels/light~1measured/publish/message/payload/properties/lumens/x-parser-schema-id\\n    before: <anonymous-schema-3>\\n    after: <anonymous-schema-6>\\n    type: unclassified\\n  - action: edit\\n    path: >-\\n      /channels/light~1measured/publish/message/payload/properties/id/x-parser-schema-id\\n    before: <anonymous-schema-2>\\n    after: <anonymous-schema-5>\\n    type: unclassified\\n  - action: edit\\n    path: /channels/light~1measured/publish/message/payload/properties/id/minimum\\n    before: 0\\n    after: 1\\n    type: unclassified\\n  - action: add\\n    path: /channels/user~1signedup\\n    after:\\n      subscribe:\\n        message:\\n          payload:\\n            type: object\\n            properties:\\n              displayName:\\n                type: string\\n                description: Name of the user\\n                x-parser-schema-id: <anonymous-schema-2>\\n              email:\\n                type: string\\n                format: email\\n                description: Email of the user\\n                x-parser-schema-id: <anonymous-schema-3>\\n            x-parser-schema-id: <anonymous-schema-1>\\n          x-parser-message-name: UserSignedUp\\n    type: non-breaking\\n  - action: edit\\n    path: /servers/mosquitto/protocol\\n    before: mqtt\\n    after: http\\n    type: breaking\\n  - action: edit\\n    path: /servers/mosquitto/url\\n    before: mqtt://test.mosquitto.org\\n    after: http://test.mosquitto.org\\n    type: breaking\\n  - action: edit\\n    path: /info/title\\n    before: Streetlights API\\n    after: Streetlights API V2\\n    type: non-breaking\\n  - action: add\\n    path: /components\\n    after:\\n      messages:\\n        UserSignedUp:\\n          payload:\\n            type: object\\n            properties:\\n              displayName:\\n                type: string\\n                description: Name of the user\\n                x-parser-schema-id: <anonymous-schema-2>\\n              email:\\n                type: string\\n                format: email\\n                description: Email of the user\\n                x-parser-schema-id: <anonymous-schema-3>\\n            x-parser-schema-id: <anonymous-schema-1>\\n          x-parser-message-name: UserSignedUp\\n    type: non-breaking\\n\\n"';

// eslint-disable-next-line quotes
const markdownJsonOutput = "\"## Unclassified\\n\\n\\n - **Path**: `/channels/light~1measured/publish/message/payload/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-1>\\n     - **After**: <anonymous-schema-4>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/sentAt/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-4>\\n     - **After**: <anonymous-schema-7>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/lumens/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-3>\\n     - **After**: <anonymous-schema-6>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/id/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-2>\\n     - **After**: <anonymous-schema-5>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/id/minimum`\\n     - **Action**: edit\\n     - **Before**: 0\\n     - **After**: 1\\n    \\n\\n## Non-breaking\\n\\n\\n - **Path**: `/channels/user~1signedup`\\n     - **Action**: add\\n     - <details>\\n            <summary> After </summary>\\n            \\n        ```json\\n        {\\n          \\\"subscribe\\\": {\\n            \\\"message\\\": {\\n              \\\"payload\\\": {\\n                \\\"type\\\": \\\"object\\\",\\n                \\\"properties\\\": {\\n                  \\\"displayName\\\": {\\n                    \\\"type\\\": \\\"string\\\",\\n                    \\\"description\\\": \\\"Name of the user\\\",\\n                    \\\"x-parser-schema-id\\\": \\\"<anonymous-schema-2>\\\"\\n                  },\\n                  \\\"email\\\": {\\n                    \\\"type\\\": \\\"string\\\",\\n                    \\\"format\\\": \\\"email\\\",\\n                    \\\"description\\\": \\\"Email of the user\\\",\\n                    \\\"x-parser-schema-id\\\": \\\"<anonymous-schema-3>\\\"\\n                  }\\n                },\\n                \\\"x-parser-schema-id\\\": \\\"<anonymous-schema-1>\\\"\\n              },\\n              \\\"x-parser-message-name\\\": \\\"UserSignedUp\\\"\\n            }\\n          }\\n        }\\n        ```            \\n        </details>  \\n        \\n    \\n - **Path**: `/info/title`\\n     - **Action**: edit\\n     - **Before**: Streetlights API\\n     - **After**: Streetlights API V2\\n    \\n - **Path**: `/components`\\n     - **Action**: add\\n     - <details>\\n            <summary> After </summary>\\n            \\n        ```json\\n        {\\n          \\\"messages\\\": {\\n            \\\"UserSignedUp\\\": {\\n              \\\"payload\\\": {\\n                \\\"type\\\": \\\"object\\\",\\n                \\\"properties\\\": {\\n                  \\\"displayName\\\": {\\n                    \\\"type\\\": \\\"string\\\",\\n                    \\\"description\\\": \\\"Name of the user\\\",\\n                    \\\"x-parser-schema-id\\\": \\\"<anonymous-schema-2>\\\"\\n                  },\\n                  \\\"email\\\": {\\n                    \\\"type\\\": \\\"string\\\",\\n                    \\\"format\\\": \\\"email\\\",\\n                    \\\"description\\\": \\\"Email of the user\\\",\\n                    \\\"x-parser-schema-id\\\": \\\"<anonymous-schema-3>\\\"\\n                  }\\n                },\\n                \\\"x-parser-schema-id\\\": \\\"<anonymous-schema-1>\\\"\\n              },\\n              \\\"x-parser-message-name\\\": \\\"UserSignedUp\\\"\\n            }\\n          }\\n        }\\n        ```            \\n        </details>  \\n        \\n    \\n\\n## Breaking\\n\\n\\n - **Path**: `/servers/mosquitto/protocol`\\n     - **Action**: edit\\n     - **Before**: mqtt\\n     - **After**: http\\n    \\n - **Path**: `/servers/mosquitto/url`\\n     - **Action**: edit\\n     - **Before**: mqtt://test.mosquitto.org\\n     - **After**: http://test.mosquitto.org\\n    \\n\\n\"";
const markdownYamlOutput = '"## Unclassified\\n\\n\\n - **Path**: `/channels/light~1measured/publish/message/payload/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-1>\\n     - **After**: <anonymous-schema-4>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/sentAt/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-4>\\n     - **After**: <anonymous-schema-7>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/lumens/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-3>\\n     - **After**: <anonymous-schema-6>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/id/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-2>\\n     - **After**: <anonymous-schema-5>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/id/minimum`\\n     - **Action**: edit\\n     - **Before**: 0\\n     - **After**: 1\\n    \\n\\n## Non-breaking\\n\\n\\n - **Path**: `/channels/user~1signedup`\\n     - **Action**: add\\n     - <details>\\n            <summary> After </summary>\\n            \\n        ```yaml\\n        subscribe:\\n          message:\\n            payload:\\n              type: object\\n              properties:\\n                displayName:\\n                  type: string\\n                  description: Name of the user\\n                  x-parser-schema-id: <anonymous-schema-2>\\n                email:\\n                  type: string\\n                  format: email\\n                  description: Email of the user\\n                  x-parser-schema-id: <anonymous-schema-3>\\n              x-parser-schema-id: <anonymous-schema-1>\\n            x-parser-message-name: UserSignedUp\\n        \\n        ```            \\n        </details>  \\n        \\n    \\n - **Path**: `/info/title`\\n     - **Action**: edit\\n     - **Before**: Streetlights API\\n     - **After**: Streetlights API V2\\n    \\n - **Path**: `/components`\\n     - **Action**: add\\n     - <details>\\n            <summary> After </summary>\\n            \\n        ```yaml\\n        messages:\\n          UserSignedUp:\\n            payload:\\n              type: object\\n              properties:\\n                displayName:\\n                  type: string\\n                  description: Name of the user\\n                  x-parser-schema-id: <anonymous-schema-2>\\n                email:\\n                  type: string\\n                  format: email\\n                  description: Email of the user\\n                  x-parser-schema-id: <anonymous-schema-3>\\n              x-parser-schema-id: <anonymous-schema-1>\\n            x-parser-message-name: UserSignedUp\\n        \\n        ```            \\n        </details>  \\n        \\n    \\n\\n## Breaking\\n\\n\\n - **Path**: `/servers/mosquitto/protocol`\\n     - **Action**: edit\\n     - **Before**: mqtt\\n     - **After**: http\\n    \\n - **Path**: `/servers/mosquitto/url`\\n     - **Action**: edit\\n     - **Before**: mqtt://test.mosquitto.org\\n     - **After**: http://test.mosquitto.org\\n    \\n\\n"';

describe('diff', () => {
  describe('comparing AsyncAPI v2 and v3 documents', () => {
    test
      .stderr()
      .stdout()
      .command(['diff', asyncapiv3, asyncapiv2])
      .it('give error when different AsyncAPI version', (ctx, done) => {
        expect(ctx.stderr).to.contain('TypeError: diff between different AsyncAPI version is not allowed\n');
        expect(ctx.stdout).to.equal('');
        done();
      });
  });
  describe('should handle AsyncAPI v3 document correctly', () => {
    test
      .stderr()
      .stdout()
      .command(['diff', asyncapiv3, asyncapiv3Diff, '--no-error', '--format=json'])
      .it('give error when different AsyncAPI version', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(commonJsonOutputV3);
        expect(ctx.stderr).to.equal('');
        done();
      });
  });
  describe('with file paths, and there are no difference between the files', () => {
    test
      .stderr()
      .stdout()
      .command(['diff', './test/fixtures/specification.yml', './test/fixtures/specification.yml', '--format=json'])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(noChangesJson);
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('yaml output: with file paths, and there are no difference between the files', () => {
    test
      .stderr()
      .stdout()
      .command(['diff', './test/fixtures/specification.yml', './test/fixtures/specification.yml'])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(noChangesYaml);
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('with file paths, and getting all changes', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--type=all',
        '--format=json',
        '--no-error',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(`"${commonJsonOutput}"`);
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('with file paths, and getting breaking changes', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--type=breaking',
        '--format=json',
        '--no-error',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(breakingChangesJson);
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('with file paths, and getting non-breaking changes', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--type=non-breaking',
        '--format=json',
        '--no-error',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(nonBreakingChangesJson);
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('with file paths, and getting unclassified changes', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--type=unclassified',
        '--format=json',
        '--no-error',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(unclassifiedChangesJson);
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('with file paths, and getting all changes, passing flag', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--format=json',
        '--no-error',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(`"${commonJsonOutput}"`);
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('YAML output, getting all changes', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--type=all',
        '--no-error',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(commonYamlOutput);
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('should show error on breaking changes', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(commonYamlOutput);
        expect(ctx.stderr).to.equal('DiffBreakingChangeError: Breaking changes detected\n');
        done();
      });
  });

  describe('Markdown output with subtype as json, getting all changes', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--format=md',
        '--markdownSubtype=json',
        '--type=all',
        '--no-error',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(markdownJsonOutput);
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('Markdown output with subtype as yaml, getting all changes', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--format=md',
        '--markdownSubtype=yaml',
        '--type=all',
        '--no-error',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(markdownYamlOutput);
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('Other output with markdownSubtype flag provided, check for warning', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--format=json',
        '--markdownSubtype=yaml',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(
          `"Warning: The given markdownSubtype flag will not work with the given format.\\nProvided flag markdownSubtype: yaml\\n${commonJsonOutput}"`
        );
        expect(ctx.stderr).to.equal('DiffBreakingChangeError: Breaking changes detected\n');
        done();
      });
  });

  describe('with logging diagnostics', () => {
    test
      .stderr()
      .stdout()
      .command(['diff', './test/fixtures/specification.yml', './test/fixtures/specification.yml', '--format=json', '--log-diagnostics'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).to.match(/File .\/test\/fixtures\/specification.yml is valid but has \(itself and\/or referenced documents\) governance issues./);
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  // passing override files actually overrides standard for other tests that come below this test case
  // thus, this test case should always be at last
  describe('with custom standard file', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--overrides=./test/fixtures/overrides.json',
        '--format=json',
        '--no-error',
      ])
      .it((ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(customJsonOutput);
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('should throw error for invalid override path', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--overrides=./overrides-wrong.json',
        '--format=json',
      ])
      .it((ctx, done) => {
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.equal(
          'DiffOverrideFileError: Override file not found\n'
        );
        done();
      });
  });

  describe('should throw error for invalid override json', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--overrides=./test/fixtures/invalid-overrides.json',
      ])
      .it((ctx, done) => {
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.equal(
          'DiffOverrideJSONError: Provided override file is not a valid JSON file\n'
        );
        done();
      });
  });

  describe('save-output flag tests', () => {
    describe('JSON format with save-output flag', () => {
      test
        .stderr()
        .stdout()
        .command([
          'diff',
          './test/fixtures/specification.yml',
          './test/fixtures/specification.yml',
          '--format=json',
          '--type=all',
          '--save-output=./test/fixtures/output-test.json',
          '--no-error',
        ])
        .finally(async () => {
          const fs = await import('fs');
          try {
            await fs.promises.unlink('./test/fixtures/output-test.json');
          } catch (err) {
            // Ignore error if file doesn't exist
          }
        })
        .it('should write JSON output to file when no changes', async (ctx) => {
          const fs = await import('fs');
          expect(ctx.stdout).to.contain('Output successfully written to: ./test/fixtures/output-test.json');
          
          const fileContent = await fs.promises.readFile('./test/fixtures/output-test.json', 'utf8');
          const actualContent = JSON.parse(fileContent);
          expect(actualContent).to.deep.equal({ changes: [] });
        });

      test
        .stderr()
        .stdout()
        .command([
          'diff',
          './test/fixtures/asyncapi_v1.yml',
          './test/fixtures/asyncapi_v2.yml',
          '--format=json',
          '--type=all',
          '--save-output=./test/fixtures/output-test-all.json',
          '--no-error',
        ])
        .finally(async () => {
          const fs = await import('fs');
          try {
            await fs.promises.unlink('./test/fixtures/output-test-all.json');
          } catch (err) {
            // Ignore error if file doesn't exist
          }
        })
        .it('should write all changes to JSON file', async (ctx) => {
          const fs = await import('fs');
          expect(ctx.stdout).to.contain('Output successfully written to: ./test/fixtures/output-test-all.json');
          
          // Read and verify file content
          const fileContent = await fs.promises.readFile('./test/fixtures/output-test-all.json', 'utf8');
          const actualContent = JSON.parse(fileContent);
          expect(actualContent).to.have.property('changes');
          expect(actualContent.changes).to.be.an('array');
          expect(actualContent.changes.length).to.be.greaterThan(0);
          const types = actualContent.changes.map((c: any) => c.type);
          expect(types).to.include('breaking');
          expect(types).to.include('non-breaking');
          expect(types).to.include('unclassified');
        });

      test
        .stderr()
        .stdout()
        .command([
          'diff',
          './test/fixtures/asyncapi_v1.yml',
          './test/fixtures/asyncapi_v2.yml',
          '--format=json',
          '--type=breaking',
          '--save-output=./test/fixtures/output-test-breaking.json',
          '--no-error',
        ])
        .finally(async () => {
          const fs = await import('fs');
          try {
            await fs.promises.unlink('./test/fixtures/output-test-breaking.json');
          } catch (err) {
            // Ignore error if file doesn't exist
          }
        })
        .it('should write breaking changes to JSON file', async (ctx) => {
          const fs = await import('fs');
          expect(ctx.stdout).to.contain('Output successfully written to: ./test/fixtures/output-test-breaking.json');
          const fileContent = await fs.promises.readFile('./test/fixtures/output-test-breaking.json', 'utf8');
          const actualContent = JSON.parse(fileContent);
          expect(actualContent).to.be.an('array');
          expect(actualContent.length).to.be.greaterThan(0);
          for (const change of actualContent) {
            expect(change.type).to.equal('breaking');
          }
        });

      test
        .stderr()
        .stdout()
        .command([
          'diff',
          './test/fixtures/asyncapi_v1.yml',
          './test/fixtures/asyncapi_v2.yml',
          '--format=json',
          '--type=non-breaking',
          '--save-output=./test/fixtures/output-test-non-breaking.json',
          '--no-error',
        ])
        .finally(async () => {
          const fs = await import('fs');
          try {
            await fs.promises.unlink('./test/fixtures/output-test-non-breaking.json');
          } catch (err) {
            // Ignore error if file doesn't exist
          }
        })
        .it('should write non-breaking changes to JSON file', async (ctx) => {
          const fs = await import('fs');
          expect(ctx.stdout).to.contain('Output successfully written to: ./test/fixtures/output-test-non-breaking.json');
          const fileContent = await fs.promises.readFile('./test/fixtures/output-test-non-breaking.json', 'utf8');
          const actualContent = JSON.parse(fileContent);
          expect(actualContent).to.be.an('array');
          expect(actualContent.length).to.be.greaterThan(0);
          for (const change of actualContent) {
            expect(change.type).to.equal('non-breaking');
          }
        });

      test
        .stderr()
        .stdout()
        .command([
          'diff',
          './test/fixtures/asyncapi_v1.yml',
          './test/fixtures/asyncapi_v2.yml',
          '--format=json',
          '--type=unclassified',
          '--save-output=./test/fixtures/output-test-unclassified.json',
          '--no-error',
        ])
        .finally(async () => {
          const fs = await import('fs');
          try {
            await fs.promises.unlink('./test/fixtures/output-test-unclassified.json');
          } catch (err) {
            // Ignore error if file doesn't exist
          }
        })
        .it('should write unclassified changes to JSON file', async (ctx) => {
          const fs = await import('fs');
          expect(ctx.stdout).to.contain('Output successfully written to: ./test/fixtures/output-test-unclassified.json');
          const fileContent = await fs.promises.readFile('./test/fixtures/output-test-unclassified.json', 'utf8');
          const actualContent = JSON.parse(fileContent);
          expect(actualContent).to.be.an('array');
          expect(actualContent.length).to.be.greaterThan(0);
          for (const change of actualContent) {
            expect(change.type).to.equal('unclassified');
          }
        });
    });

    describe('YAML format with save-output flag', () => {
      test
        .stderr()
        .stdout()
        .command([
          'diff',
          './test/fixtures/specification.yml',
          './test/fixtures/specification.yml',
          '--format=yaml',
          '--type=all',
          '--save-output=./test/fixtures/output-test.yaml',
          '--no-error',
        ])
        .finally(async () => {
          const fs = await import('fs');
          try {
            await fs.promises.unlink('./test/fixtures/output-test.yaml');
          } catch (err) {
            // Ignore error if file doesn't exist
          }
        })
        .it('should write YAML output to file when no changes', async (ctx) => {
          const fs = await import('fs');
          expect(ctx.stdout).to.contain('Output successfully written to: ./test/fixtures/output-test.yaml');
          const fileContent = await fs.promises.readFile('./test/fixtures/output-test.yaml', 'utf8');
          expect(fileContent).to.equal('changes: []\n');
        });

      test
        .stderr()
        .stdout()
        .command([
          'diff',
          './test/fixtures/asyncapi_v1.yml',
          './test/fixtures/asyncapi_v2.yml',
          '--format=yaml',
          '--type=all',
          '--save-output=./test/fixtures/output-test-all.yaml',
          '--no-error',
        ])
        .finally(async () => {
          const fs = await import('fs');
          try {
            await fs.promises.unlink('./test/fixtures/output-test-all.yaml');
          } catch (err) {
            // Ignore error if file doesn't exist
          }
        })
        .it('should write all changes to YAML file', async (ctx) => {
          const fs = await import('fs');
          expect(ctx.stdout).to.contain('Output successfully written to: ./test/fixtures/output-test-all.yaml');
          const fileContent = await fs.promises.readFile('./test/fixtures/output-test-all.yaml', 'utf8');
          expect(fileContent).to.include('changes:');
          expect(fileContent).to.include('type: breaking');
          expect(fileContent).to.include('type: non-breaking');
          expect(fileContent).to.include('type: unclassified');
        });

      test
        .stderr()
        .stdout()
        .command([
          'diff',
          './test/fixtures/asyncapi_v1.yml',
          './test/fixtures/asyncapi_v2.yml',
          '--format=yml',
          '--type=breaking',
          '--save-output=./test/fixtures/output-test-breaking.yml',
          '--no-error',
        ])
        .finally(async () => {
          const fs = await import('fs');
          try {
            await fs.promises.unlink('./test/fixtures/output-test-breaking.yml');
          } catch (err) {
            // Ignore error if file doesn't exist
          }
        })
        .it('should write breaking changes to YML file', async (ctx) => {
          const fs = await import('fs');
          expect(ctx.stdout).to.contain('Output successfully written to: ./test/fixtures/output-test-breaking.yml');
          const fileContent = await fs.promises.readFile('./test/fixtures/output-test-breaking.yml', 'utf8');
          expect(fileContent).to.include('action: edit');
          expect(fileContent).to.include('type: breaking');
        });
    });
  });
});
