## Classes

<dl>
<dt><a href="#Document">Document</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#bundle">bundle(files, [options])</a> ⇒ <code><a href="#Document">Document</a></code></dt>
<dd></dd>
</dl>

<a name="Document"></a>

## Document
**Kind**: global class  

* [Document](#Document)
    * [new Document(AsyncAPIObject)](#new_Document_new)
    * [.json()](#Document+json) ⇒ <code>Object</code>
    * [.yml()](#Document+yml) ⇒ <code>string</code>
    * [.string()](#Document+string) ⇒ <code>string</code>

<a name="new_Document_new"></a>

### new Document(AsyncAPIObject)

| Param | Type |
| --- | --- |
| AsyncAPIObject | <code>Object</code> | 

**Example**  
```js
const document = new Document(bundledDocument);

console.log(document.json()); // get JSON object
console.log(document.yml()); // get YAML string
console.log(document.string()); // get JSON string
```
<a name="Document+json"></a>

### document.json() ⇒ <code>Object</code>
**Kind**: instance method of [<code>Document</code>](#Document)  
<a name="Document+yml"></a>

### document.yml() ⇒ <code>string</code>
**Kind**: instance method of [<code>Document</code>](#Document)  
<a name="Document+string"></a>

### document.string() ⇒ <code>string</code>
**Kind**: instance method of [<code>Document</code>](#Document)  
<a name="bundle"></a>

## bundle(files, [options]) ⇒ [<code>Document</code>](#Document)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| files | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>One or more relative/absolute paths to AsyncAPI Documents that should be bundled.</p> |
| [options] | <code>Object</code> |  |
| [options.base] | <code>string</code> | <p>One relative/absolute path to base object whose properties will be retained.</p> |
| [options.baseDir] | <code>string</code> | <p>One relative/absolute path to directory relative to which paths to AsyncAPI Documents that should be bundled will be resolved.</p> |
| [options.xOrigin] | <code>boolean</code> | <p>Pass <code>true</code> to generate properties <code>x-origin</code> that will contain historical values of dereferenced <code>$ref</code>s.</p> |

**Example**  
**TypeScript**
```ts
import { writeFileSync } from 'fs';
import bundle from '@asyncapi/bundler';

async function main() {
 const document = await bundle(['social-media/comments-service/main.yaml'], {
   baseDir: 'example-data',
   xOrigin: true,
 });

 console.log(document.yml()); // the complete bundled AsyncAPI document
 writeFileSync('asyncapi.yaml', document.yml());  // the complete bundled AsyncAPI document
}

main().catch(e => console.error(e));
```

**JavaScript CJS module system**
```js
'use strict';

const { writeFileSync } = require('fs');
const bundle = require('@asyncapi/bundler');

async function main() {
 const document = await bundle(['social-media/comments-service/main.yaml'], {
   baseDir: 'example-data',
   xOrigin: true,
 });
 writeFileSync('asyncapi.yaml', document.yml());
}

main().catch(e => console.error(e));
```

**JavaScript ESM module system**
```js
'use strict';

import { writeFileSync } from 'fs';
import bundle from '@asyncapi/bundler';

async function main() {
 const document = await bundle(['social-media/comments-service/main.yaml'], {
   baseDir: 'example-data',
   xOrigin: true,
 });
 writeFileSync('asyncapi.yaml', document.yml());
}

main().catch(e => console.error(e));
```
