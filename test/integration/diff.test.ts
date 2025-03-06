/* eslint-disable sonarjs/no-duplicate-string */
import { runCommand } from '@oclif/test';
import { expect } from 'chai';
import { fileCleanup } from '../helpers';

const asyncapiv3 = './test/fixtures/specification-v3.yml';
const asyncapiv3Diff = './test/fixtures/specification-v3-diff.yml';
const asyncapiv2 = './test/fixtures/specification.yml';
const noChangesJson = '"{\\n  \\"changes\\": []\\n}\\n"';
const breakingChangesJson =
  '"[\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/servers/mosquitto/protocol\\",\\n    \\"before\\": \\"mqtt\\",\\n    \\"after\\": \\"http\\",\\n    \\"type\\": \\"breaking\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/servers/mosquitto/url\\",\\n    \\"before\\": \\"mqtt://test.mosquitto.org\\",\\n    \\"after\\": \\"http://test.mosquitto.org\\",\\n    \\"type\\": \\"breaking\\"\\n  }\\n]\\n"';
const nonBreakingChangesJson =
  '"[\\n  {\\n    \\"action\\": \\"add\\",\\n    \\"path\\": \\"/channels/user~1signedup\\",\\n    \\"after\\": {\\n      \\"subscribe\\": {\\n        \\"message\\": {\\n          \\"payload\\": {\\n            \\"type\\": \\"object\\",\\n            \\"properties\\": {\\n              \\"displayName\\": {\\n                \\"type\\": \\"string\\",\\n                \\"description\\": \\"Name of the user\\",\\n                \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n              },\\n              \\"email\\": {\\n                \\"type\\": \\"string\\",\\n                \\"format\\": \\"email\\",\\n                \\"description\\": \\"Email of the user\\",\\n                \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n              }\\n            },\\n            \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n          },\\n          \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n        }\\n      }\\n    },\\n    \\"type\\": \\"non-breaking\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/info/title\\",\\n    \\"before\\": \\"Streetlights API\\",\\n    \\"after\\": \\"Streetlights API V2\\",\\n    \\"type\\": \\"non-breaking\\"\\n  },\\n  {\\n    \\"action\\": \\"add\\",\\n    \\"path\\": \\"/components\\",\\n    \\"after\\": {\\n      \\"messages\\": {\\n        \\"UserSignedUp\\": {\\n          \\"payload\\": {\\n            \\"type\\": \\"object\\",\\n            \\"properties\\": {\\n              \\"displayName\\": {\\n                \\"type\\": \\"string\\",\\n                \\"description\\": \\"Name of the user\\",\\n                \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n              },\\n              \\"email\\": {\\n                \\"type\\": \\"string\\",\\n                \\"format\\": \\"email\\",\\n                \\"description\\": \\"Email of the user\\",\\n                \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n              }\\n            },\\n            \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n          },\\n          \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n        }\\n      }\\n    },\\n    \\"type\\": \\"non-breaking\\"\\n  }\\n]\\n"';
const unclassifiedChangesJson =
  '"[\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/payload/x-parser-schema-id\\",\\n    \\"before\\": \\"<anonymous-schema-1>\\",\\n    \\"after\\": \\"<anonymous-schema-4>\\",\\n    \\"type\\": \\"unclassified\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/sentAt/x-parser-schema-id\\",\\n    \\"before\\": \\"<anonymous-schema-4>\\",\\n    \\"after\\": \\"<anonymous-schema-7>\\",\\n    \\"type\\": \\"unclassified\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/lumens/x-parser-schema-id\\",\\n    \\"before\\": \\"<anonymous-schema-3>\\",\\n    \\"after\\": \\"<anonymous-schema-6>\\",\\n    \\"type\\": \\"unclassified\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/x-parser-schema-id\\",\\n    \\"before\\": \\"<anonymous-schema-2>\\",\\n    \\"after\\": \\"<anonymous-schema-5>\\",\\n    \\"type\\": \\"unclassified\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n    \\"before\\": 0,\\n    \\"after\\": 1,\\n    \\"type\\": \\"unclassified\\"\\n  }\\n]\\n"';
const commonJsonOutput =
  '{\\n  \\"changes\\": [\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-1>\\",\\n      \\"after\\": \\"<anonymous-schema-4>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/sentAt/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-4>\\",\\n      \\"after\\": \\"<anonymous-schema-7>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/lumens/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-3>\\",\\n      \\"after\\": \\"<anonymous-schema-6>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-2>\\",\\n      \\"after\\": \\"<anonymous-schema-5>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"add\\",\\n      \\"path\\": \\"/channels/user~1signedup\\",\\n      \\"after\\": {\\n        \\"subscribe\\": {\\n          \\"message\\": {\\n            \\"payload\\": {\\n              \\"type\\": \\"object\\",\\n              \\"properties\\": {\\n                \\"displayName\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"description\\": \\"Name of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n                },\\n                \\"email\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"format\\": \\"email\\",\\n                  \\"description\\": \\"Email of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n                }\\n              },\\n              \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n            },\\n            \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n          }\\n        }\\n      },\\n      \\"type\\": \\"non-breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/protocol\\",\\n      \\"before\\": \\"mqtt\\",\\n      \\"after\\": \\"http\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/url\\",\\n      \\"before\\": \\"mqtt://test.mosquitto.org\\",\\n      \\"after\\": \\"http://test.mosquitto.org\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/info/title\\",\\n      \\"before\\": \\"Streetlights API\\",\\n      \\"after\\": \\"Streetlights API V2\\",\\n      \\"type\\": \\"non-breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"add\\",\\n      \\"path\\": \\"/components\\",\\n      \\"after\\": {\\n        \\"messages\\": {\\n          \\"UserSignedUp\\": {\\n            \\"payload\\": {\\n              \\"type\\": \\"object\\",\\n              \\"properties\\": {\\n                \\"displayName\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"description\\": \\"Name of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n                },\\n                \\"email\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"format\\": \\"email\\",\\n                  \\"description\\": \\"Email of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n                }\\n              },\\n              \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n            },\\n            \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n          }\\n        }\\n      },\\n      \\"type\\": \\"non-breaking\\"\\n    }\\n  ]\\n}\\n';
const customJsonOutput =
  '"{\\n  \\"changes\\": [\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-1>\\",\\n      \\"after\\": \\"<anonymous-schema-4>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/sentAt/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-4>\\",\\n      \\"after\\": \\"<anonymous-schema-7>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/lumens/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-3>\\",\\n      \\"after\\": \\"<anonymous-schema-6>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-2>\\",\\n      \\"after\\": \\"<anonymous-schema-5>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"add\\",\\n      \\"path\\": \\"/channels/user~1signedup\\",\\n      \\"after\\": {\\n        \\"subscribe\\": {\\n          \\"message\\": {\\n            \\"payload\\": {\\n              \\"type\\": \\"object\\",\\n              \\"properties\\": {\\n                \\"displayName\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"description\\": \\"Name of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n                },\\n                \\"email\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"format\\": \\"email\\",\\n                  \\"description\\": \\"Email of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n                }\\n              },\\n              \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n            },\\n            \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n          }\\n        }\\n      },\\n      \\"type\\": \\"non-breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/protocol\\",\\n      \\"before\\": \\"mqtt\\",\\n      \\"after\\": \\"http\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/url\\",\\n      \\"before\\": \\"mqtt://test.mosquitto.org\\",\\n      \\"after\\": \\"http://test.mosquitto.org\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/info/title\\",\\n      \\"before\\": \\"Streetlights API\\",\\n      \\"after\\": \\"Streetlights API V2\\",\\n      \\"type\\": \\"non-breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"add\\",\\n      \\"path\\": \\"/components\\",\\n      \\"after\\": {\\n        \\"messages\\": {\\n          \\"UserSignedUp\\": {\\n            \\"payload\\": {\\n              \\"type\\": \\"object\\",\\n              \\"properties\\": {\\n                \\"displayName\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"description\\": \\"Name of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n                },\\n                \\"email\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"format\\": \\"email\\",\\n                  \\"description\\": \\"Email of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n                }\\n              },\\n              \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n            },\\n            \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n          }\\n        }\\n      },\\n      \\"type\\": \\"non-breaking\\"\\n    }\\n  ]\\n}\\n"';
const commonJsonOutputV3 =
  '"{\\n  \\"changes\\": [\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/operations/smartylighting~1streetlights~11~10~1action~1{streetlightId}~1turn~1on.subscribe/channel/servers/1/pathname\\",\\n      \\"before\\": \\"/some/path\\",\\n      \\"after\\": \\"/some/path-name\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/operations/smartylighting~1streetlights~11~10~1action~1{streetlightId}~1turn~1on.subscribe/channel/servers/0/variables/port/default\\",\\n      \\"before\\": \\"1883\\",\\n      \\"after\\": \\"8883\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/operations/receiveTurnOn/channel/servers/1/pathname\\",\\n      \\"before\\": \\"/some/path\\",\\n      \\"after\\": \\"/some/path-name\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/operations/receiveTurnOn/channel/servers/0/variables/port/default\\",\\n      \\"before\\": \\"1883\\",\\n      \\"after\\": \\"8883\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/operations/receiveLightMeasured/channel/servers/0/pathname\\",\\n      \\"before\\": \\"/some/path\\",\\n      \\"after\\": \\"/some/path-name\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/turnOn/servers/1/pathname\\",\\n      \\"before\\": \\"/some/path\\",\\n      \\"after\\": \\"/some/path-name\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/turnOn/servers/0/variables/port/default\\",\\n      \\"before\\": \\"1883\\",\\n      \\"after\\": \\"8883\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/lightingMeasured/servers/0/pathname\\",\\n      \\"before\\": \\"/some/path\\",\\n      \\"after\\": \\"/some/path-name\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/production/pathname\\",\\n      \\"before\\": \\"/some/path\\",\\n      \\"after\\": \\"/some/path-name\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/default/variables/port/default\\",\\n      \\"before\\": \\"1883\\",\\n      \\"after\\": \\"8883\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/info/title\\",\\n      \\"before\\": \\"AsyncAPI Sample App\\",\\n      \\"after\\": \\"AsyncAPI App\\",\\n      \\"type\\": \\"non-breaking\\"\\n    }\\n  ]\\n}\\n"';

const noChangesYaml = '"changes: []\\n\\n"';
const commonYamlOutput =
  '"changes:\\n  - action: edit\\n    path: /channels/light~1measured/publish/message/payload/x-parser-schema-id\\n    before: <anonymous-schema-1>\\n    after: <anonymous-schema-4>\\n    type: unclassified\\n  - action: edit\\n    path: >-\\n      /channels/light~1measured/publish/message/payload/properties/sentAt/x-parser-schema-id\\n    before: <anonymous-schema-4>\\n    after: <anonymous-schema-7>\\n    type: unclassified\\n  - action: edit\\n    path: >-\\n      /channels/light~1measured/publish/message/payload/properties/lumens/x-parser-schema-id\\n    before: <anonymous-schema-3>\\n    after: <anonymous-schema-6>\\n    type: unclassified\\n  - action: edit\\n    path: >-\\n      /channels/light~1measured/publish/message/payload/properties/id/x-parser-schema-id\\n    before: <anonymous-schema-2>\\n    after: <anonymous-schema-5>\\n    type: unclassified\\n  - action: edit\\n    path: /channels/light~1measured/publish/message/payload/properties/id/minimum\\n    before: 0\\n    after: 1\\n    type: unclassified\\n  - action: add\\n    path: /channels/user~1signedup\\n    after:\\n      subscribe:\\n        message:\\n          payload:\\n            type: object\\n            properties:\\n              displayName:\\n                type: string\\n                description: Name of the user\\n                x-parser-schema-id: <anonymous-schema-2>\\n              email:\\n                type: string\\n                format: email\\n                description: Email of the user\\n                x-parser-schema-id: <anonymous-schema-3>\\n            x-parser-schema-id: <anonymous-schema-1>\\n          x-parser-message-name: UserSignedUp\\n    type: non-breaking\\n  - action: edit\\n    path: /servers/mosquitto/protocol\\n    before: mqtt\\n    after: http\\n    type: breaking\\n  - action: edit\\n    path: /servers/mosquitto/url\\n    before: mqtt://test.mosquitto.org\\n    after: http://test.mosquitto.org\\n    type: breaking\\n  - action: edit\\n    path: /info/title\\n    before: Streetlights API\\n    after: Streetlights API V2\\n    type: non-breaking\\n  - action: add\\n    path: /components\\n    after:\\n      messages:\\n        UserSignedUp:\\n          payload:\\n            type: object\\n            properties:\\n              displayName:\\n                type: string\\n                description: Name of the user\\n                x-parser-schema-id: <anonymous-schema-2>\\n              email:\\n                type: string\\n                format: email\\n                description: Email of the user\\n                x-parser-schema-id: <anonymous-schema-3>\\n            x-parser-schema-id: <anonymous-schema-1>\\n          x-parser-message-name: UserSignedUp\\n    type: non-breaking\\n\\n"';

// eslint-disable-next-line quotes
const markdownJsonOutput =
  '"## Unclassified\\n\\n\\n - **Path**: `/channels/light~1measured/publish/message/payload/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-1>\\n     - **After**: <anonymous-schema-4>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/sentAt/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-4>\\n     - **After**: <anonymous-schema-7>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/lumens/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-3>\\n     - **After**: <anonymous-schema-6>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/id/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-2>\\n     - **After**: <anonymous-schema-5>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/id/minimum`\\n     - **Action**: edit\\n     - **Before**: 0\\n     - **After**: 1\\n    \\n\\n## Non-breaking\\n\\n\\n - **Path**: `/channels/user~1signedup`\\n     - **Action**: add\\n     - <details>\\n            <summary> After </summary>\\n            \\n        ```json\\n        {\\n          \\"subscribe\\": {\\n            \\"message\\": {\\n              \\"payload\\": {\\n                \\"type\\": \\"object\\",\\n                \\"properties\\": {\\n                  \\"displayName\\": {\\n                    \\"type\\": \\"string\\",\\n                    \\"description\\": \\"Name of the user\\",\\n                    \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n                  },\\n                  \\"email\\": {\\n                    \\"type\\": \\"string\\",\\n                    \\"format\\": \\"email\\",\\n                    \\"description\\": \\"Email of the user\\",\\n                    \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n                  }\\n                },\\n                \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n              },\\n              \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n            }\\n          }\\n        }\\n        ```            \\n        </details>  \\n        \\n    \\n - **Path**: `/info/title`\\n     - **Action**: edit\\n     - **Before**: Streetlights API\\n     - **After**: Streetlights API V2\\n    \\n - **Path**: `/components`\\n     - **Action**: add\\n     - <details>\\n            <summary> After </summary>\\n            \\n        ```json\\n        {\\n          \\"messages\\": {\\n            \\"UserSignedUp\\": {\\n              \\"payload\\": {\\n                \\"type\\": \\"object\\",\\n                \\"properties\\": {\\n                  \\"displayName\\": {\\n                    \\"type\\": \\"string\\",\\n                    \\"description\\": \\"Name of the user\\",\\n                    \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n                  },\\n                  \\"email\\": {\\n                    \\"type\\": \\"string\\",\\n                    \\"format\\": \\"email\\",\\n                    \\"description\\": \\"Email of the user\\",\\n                    \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n                  }\\n                },\\n                \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n              },\\n              \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n            }\\n          }\\n        }\\n        ```            \\n        </details>  \\n        \\n    \\n\\n## Breaking\\n\\n\\n - **Path**: `/servers/mosquitto/protocol`\\n     - **Action**: edit\\n     - **Before**: mqtt\\n     - **After**: http\\n    \\n - **Path**: `/servers/mosquitto/url`\\n     - **Action**: edit\\n     - **Before**: mqtt://test.mosquitto.org\\n     - **After**: http://test.mosquitto.org\\n    \\n\\n"';
const markdownYamlOutput =
  '"## Unclassified\\n\\n\\n - **Path**: `/channels/light~1measured/publish/message/payload/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-1>\\n     - **After**: <anonymous-schema-4>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/sentAt/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-4>\\n     - **After**: <anonymous-schema-7>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/lumens/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-3>\\n     - **After**: <anonymous-schema-6>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/id/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-2>\\n     - **After**: <anonymous-schema-5>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/id/minimum`\\n     - **Action**: edit\\n     - **Before**: 0\\n     - **After**: 1\\n    \\n\\n## Non-breaking\\n\\n\\n - **Path**: `/channels/user~1signedup`\\n     - **Action**: add\\n     - <details>\\n            <summary> After </summary>\\n            \\n        ```yaml\\n        subscribe:\\n          message:\\n            payload:\\n              type: object\\n              properties:\\n                displayName:\\n                  type: string\\n                  description: Name of the user\\n                  x-parser-schema-id: <anonymous-schema-2>\\n                email:\\n                  type: string\\n                  format: email\\n                  description: Email of the user\\n                  x-parser-schema-id: <anonymous-schema-3>\\n              x-parser-schema-id: <anonymous-schema-1>\\n            x-parser-message-name: UserSignedUp\\n        \\n        ```            \\n        </details>  \\n        \\n    \\n - **Path**: `/info/title`\\n     - **Action**: edit\\n     - **Before**: Streetlights API\\n     - **After**: Streetlights API V2\\n    \\n - **Path**: `/components`\\n     - **Action**: add\\n     - <details>\\n            <summary> After </summary>\\n            \\n        ```yaml\\n        messages:\\n          UserSignedUp:\\n            payload:\\n              type: object\\n              properties:\\n                displayName:\\n                  type: string\\n                  description: Name of the user\\n                  x-parser-schema-id: <anonymous-schema-2>\\n                email:\\n                  type: string\\n                  format: email\\n                  description: Email of the user\\n                  x-parser-schema-id: <anonymous-schema-3>\\n              x-parser-schema-id: <anonymous-schema-1>\\n            x-parser-message-name: UserSignedUp\\n        \\n        ```            \\n        </details>  \\n        \\n    \\n\\n## Breaking\\n\\n\\n - **Path**: `/servers/mosquitto/protocol`\\n     - **Action**: edit\\n     - **Before**: mqtt\\n     - **After**: http\\n    \\n - **Path**: `/servers/mosquitto/url`\\n     - **Action**: edit\\n     - **Before**: mqtt://test.mosquitto.org\\n     - **After**: http://test.mosquitto.org\\n    \\n\\n"';

describe('diff', () => {
  describe('comparing AsyncAPI v2 and v3 documents', () => {
    it('give error when same AsyncAPI version', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        asyncapiv3,
        asyncapiv3,
      ]);
      expect(stderr).to.equal(
        'TypeError: diff between same AsyncAPI version is not allowed\n',
      );
      expect(stdout).to.equal('');
    });
  });

  describe('comparing AsyncAPI v1 and v2 documents', () => {
    it('give error when different AsyncAPI version', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
      ]);
      expect(stderr).to.equal(
        'DiffBreakingChangeError: Breaking changes detected\n',
      );
      expect(stdout).to.equal('');
    });
  });

  describe('comparing AsyncAPI v1 and v2 documents with custom output', () => {
    it('give error when different AsyncAPI version', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--format=json',
      ]);
      expect(stderr).to.equal(
        'DiffBreakingChangeError: Breaking changes detected\n',
      );
      expect(stdout).to.equal('');
    });
  });

  describe('comparing AsyncAPI v1 and v2 documents with custom output', () => {
    it('give error when different AsyncAPI version', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--format=json',
        '--no-error',
      ]);
      expect(stdout).to.equal(customJsonOutput);
      expect(stderr).to.equal('');
    });
  });

  describe('should handle AsyncAPI v3 document correctly', () => {
    it('give error when different AsyncAPI version', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        asyncapiv3,
        asyncapiv3Diff,
        '--no-error',
        '--format=json',
      ]);
      expect(JSON.stringify(stdout)).to.equal(commonJsonOutputV3);
      expect(stderr).to.equal('');
    });
  });

  describe('with file paths, and there are no difference between the files', () => {
    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        './test/fixtures/specification.yml',
        './test/fixtures/specification.yml',
        '--format=json',
      ]);
      expect(JSON.stringify(stdout)).to.equal(noChangesJson);
      expect(stderr).to.equal('');
    });
  });

  describe('yaml output: with file paths, and there are no difference between the files', () => {
    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        './test/fixtures/specification.yml',
        './test/fixtures/specification.yml',
      ]);
      expect(JSON.stringify(stdout)).to.equal(noChangesYaml);
      expect(stderr).to.equal('');
    });
  });

  describe('with file paths, and getting all changes', () => {
    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--type=all',
        '--format=json',
        '--no-error',
      ]);
      expect(JSON.stringify(stdout)).to.equal(`"${commonJsonOutput}"`);
      expect(stderr).to.equal('');
    });
  });

  describe('with file paths, and getting breaking changes', () => {
    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--type=breaking',
        '--format=json',
        '--no-error',
      ]);
      expect(JSON.stringify(stdout)).to.equal(breakingChangesJson);
      expect(stderr).to.equal('');
    });
  });

  describe('with file paths, and getting non-breaking changes', () => {
    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--type=non-breaking',
        '--format=json',
        '--no-error',
      ]);
      expect(JSON.stringify(stdout)).to.equal(nonBreakingChangesJson);
      expect(stderr).to.equal('');
    });
  });

  describe('with file paths, and getting unclassified changes', () => {
    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--type=unclassified',
        '--format=json',
        '--no-error',
      ]);
      expect(JSON.stringify(stdout)).to.equal(unclassifiedChangesJson);
      expect(stderr).to.equal('');
    });
  });

  describe('with file paths, and getting all changes, passing flag', () => {
    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--format=json',
        '--no-error',
      ]);
      expect(JSON.stringify(stdout)).to.equal(`"${commonJsonOutput}"`);
      expect(stderr).to.equal('');
    });
  });

  describe('YAML output, getting all changes', () => {
    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--type=all',
        '--no-error',
      ]);
      expect(JSON.stringify(stdout)).to.equal(commonYamlOutput);
      expect(stderr).to.equal('');
    });
  });

  describe('should show error on breaking changes', () => {
    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
      ]);
      expect(JSON.stringify(stdout)).to.equal(commonYamlOutput);
      expect(stderr).to.equal(
        'DiffBreakingChangeError: Breaking changes detected\n',
      );
    });
  });

  describe('Markdown output with subtype as json, getting all changes', () => {
    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--format=md',
        '--markdownSubtype=json',
        '--type=all',
        '--no-error',
      ]);
      expect(JSON.stringify(stdout)).to.equal(markdownJsonOutput);
      expect(stderr).to.equal('');
    });
  });

  describe('Markdown output with subtype as yaml, getting all changes', () => {
    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--format=md',
        '--markdownSubtype=yaml',
        '--type=all',
        '--no-error',
      ]);
      expect(JSON.stringify(stdout)).to.equal(markdownYamlOutput);
      expect(stderr).to.equal('');
    });
  });

  describe('Other output with markdownSubtype flag provided, check for warning', () => {
    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--format=json',
        '--markdownSubtype=yaml',
      ]);
      expect(JSON.stringify(stdout)).to.equal(
        `"Warning: The given markdownSubtype flag will not work with the given format.\\nProvided flag markdownSubtype: yaml\\n${commonJsonOutput}"`,
      );
      expect(stderr).to.equal(
        'DiffBreakingChangeError: Breaking changes detected\n',
      );
    });
  });

  describe('with logging diagnostics', () => {
    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        './test/fixtures/specification.yml',
        './test/fixtures/specification.yml',
        '--format=json',
        '--log-diagnostics',
      ]);
      expect(stdout).to.match(
        /File .\/test\/fixtures\/specification.yml is valid but has \(itself and\/or referenced documents\) governance issues./,
      );
      expect(stderr).to.equal('');
    });
  });

  // passing override files actually overrides standard for other tests that come below this test case
  // thus, this test case should always be at last

  describe('with custom standard file', () => {
    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--standard=./test/fixtures/standard.yml',
        '--format=json',
        '--no-error',
      ]);
      expect(JSON.stringify(stdout)).to.equal(customJsonOutput);
      expect(stderr).to.equal('');
    });
  });

  describe('should throw error for invalid standard path', () => {
    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--standard=./standard-wrong.yml',
        '--format=json',
      ]);
      expect(stdout).to.equal('');
      expect(stderr).to.equal(
        'DiffStandardFileError: Standard file not found\n',
      );
    });
  });

  describe('should throw error for invalid standard json', () => {
    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--standard=./test/fixtures/invalid-standard.json',
        '--format=json',
      ]);
      expect(stdout).to.equal('');
      expect(stderr).to.equal(
        'DiffStandardJSONError: Provided standard file is not a valid JSON file\n',
      );
    });
  });

  describe('should throw error for invalid override json', () => {
    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--overrides=./test/fixtures/invalid-overrides.json',
        '--format=json',
      ]);
      expect(stdout).to.equal('');
      expect(stderr).to.equal(
        'DiffOverrideJSONError: Provided override file is not a valid JSON file\n',
      );
    });
  });
});
