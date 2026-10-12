export const inputDiff = {
  changes: [
    {
      type: 'breaking',
      path: '/servers',
    },
    {
      type: 'non-breaking',
      path: '/channels',
    },
    {
      type: 'unclassified',
      path: '/info',
    },
  ],
};

export const breakingChanges = [
  {
    type: 'breaking',
    path: '/servers',
  },
];

export const nonbreakingChanges = [
  {
    type: 'non-breaking',
    path: '/channels',
  },
];

export const unclassifiedChanges = [
  {
    type: 'unclassified',
    path: '/info',
  },
];

export const YAMLOutputDiff = `changes:
  - type: breaking
    path: /servers
  - type: non-breaking
    path: /channels
  - type: unclassified
    path: /info
`;

export const YAMLBreakingChanges = `- type: breaking
  path: /servers
`;

export const YAMLNonbreakingChanges = `- type: non-breaking
  path: /channels
`;

export const YAMLUnclassifiedChanges = `- type: unclassified
  path: /info
`;

export const MarkdownOutputDiff = `## Breaking


 - **Path**: \`/servers\`
    

## Non-breaking


 - **Path**: \`/channels\`
    

## Unclassified


 - **Path**: \`/info\`
    
`;

export const MarkdownBreakingChanges = `## Breaking


 - **Path**: \`/servers\`
    
`;

export const MarkdownNonbreakingChanges = `## Non-breaking


 - **Path**: \`/channels\`
    
`;

export const MarkdownUnclassifiedChanges = `## Unclassified


 - **Path**: \`/info\`
    
`;

export const MarkdownJSONSubtypeChanges = `## Breaking


 - **Path**: \`/channels/mychannel\`
     - **Action**: remove
     - <details>
            <summary> Before </summary>
            
        \`\`\`json
        {
          "publish": {
            "message": {
              "headers": {
                "properties": {
                  "some-common-header": {
                    "type": "string",
                    "x-parser-schema-id": "<anonymous-schema-2>"
                  }
                },
                "type": "object",
                "x-parser-schema-id": "<anonymous-schema-1>"
              },
              "x-parser-message-name": "channelMessage",
              "traits": [
                {
                  "headers": {
                    "properties": {
                      "some-common-header": {
                        "type": "string",
                        "x-parser-schema-id": "<anonymous-schema-7>"
                      }
                    },
                    "type": "object",
                    "x-parser-schema-id": "<anonymous-schema-6>"
                  },
                  "x-some-extension": "some extension"
                }
              ],
              "x-some-extension": "some extension"
            }
          }
        }
        \`\`\`            
        </details>  
        
    
 - **Path**: \`/info/version\`
     - **Action**: edit
     - **After**: 1.1.0
     - **Before**: 1.0.0
    

## Non-breaking


 - **Path**: \`/channels/anotherChannel\`
     - **Action**: add
     - <details>
            <summary> After </summary>
            
        \`\`\`json
        {
          "publish": {
            "message": {
              "headers": {
                "properties": {
                  "some-common-header": {
                    "type": "string",
                    "x-parser-schema-id": "<anonymous-schema-2>"
                  }
                },
                "type": "object",
                "x-parser-schema-id": "<anonymous-schema-1>"
              },
              "x-parser-message-name": "channelMessage",
              "traits": [
                {
                  "headers": {
                    "properties": {
                      "some-common-header": {
                        "type": "string",
                        "x-parser-schema-id": "<anonymous-schema-7>"
                      }
                    },
                    "type": "object",
                    "x-parser-schema-id": "<anonymous-schema-6>"
                  },
                  "x-some-extension": "some extension"
                }
              ],
              "x-some-extension": "some extension"
            }
          }
        }
        \`\`\`            
        </details>  
        
    
`;

export const MarkdownYAMLSubtypeChanges = `## Breaking


 - **Path**: \`/channels/mychannel\`
     - **Action**: remove
     - <details>
            <summary> Before </summary>
            
        \`\`\`yaml
        publish:
          message:
            headers:
              properties:
                some-common-header:
                  type: string
                  x-parser-schema-id: <anonymous-schema-2>
              type: object
              x-parser-schema-id: <anonymous-schema-1>
            x-parser-message-name: channelMessage
            traits:
              - headers:
                  properties:
                    some-common-header:
                      type: string
                      x-parser-schema-id: <anonymous-schema-7>
                  type: object
                  x-parser-schema-id: <anonymous-schema-6>
                x-some-extension: some extension
            x-some-extension: some extension
        
        \`\`\`            
        </details>  
        
    
 - **Path**: \`/info/version\`
     - **Action**: edit
     - **After**: 1.1.0
     - **Before**: 1.0.0
    

## Non-breaking


 - **Path**: \`/channels/anotherChannel\`
     - **Action**: add
     - <details>
            <summary> After </summary>
            
        \`\`\`yaml
        publish:
          message:
            headers:
              properties:
                some-common-header:
                  type: string
                  x-parser-schema-id: <anonymous-schema-2>
              type: object
              x-parser-schema-id: <anonymous-schema-1>
            x-parser-message-name: channelMessage
            traits:
              - headers:
                  properties:
                    some-common-header:
                      type: string
                      x-parser-schema-id: <anonymous-schema-7>
                  type: object
                  x-parser-schema-id: <anonymous-schema-6>
                x-some-extension: some extension
            x-some-extension: some extension
        
        \`\`\`            
        </details>  
        
    
`;
