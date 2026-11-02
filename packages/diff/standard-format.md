# Understanding the format of standard

This library depends on a "standard" which classifies a certain change as `breaking`, `non-breaking` or `unclassified`.

This object has the following structure:

```
{
	[jsonPointerPath]: {
		add: 'breaking' | 'non-breaking' | 'unclassified',
		remove: 'breaking' | 'non-breaking' | 'unclassified',
		edit: 'breaking' | 'non-breaking' | 'unclassified',
	}
}
```

`jsonPointerPath` is a path that points to a certain property from the AsyncAPI specification.

Example:

```yml
info:
  license:
    name: Apache 2.0
```

The jsonPointer to the `name` will be `/info/license/name`.

And each `jsonPointerPath` will have 3 properties. `add`, `remove` and `edit`, these points to three operations that can occur when modifying a AsyncAPI document.

1. `add` - A new property has been added.
2. `remove` - An existing property has been deleted.
3. `edit` - An existing property has been modified.

and each property can be `breaking`, `non-breaking` or `unclassified`.

1. `breaking` to consider a change as breaking change.
2. `non-breaking` to consider a change as non-breaking change.
3. `unclassified` to consider a change as an unclassified change.

Here's an example from the `standard.ts` file:

```js
{
	'/info/license/name': {
		add: 'breaking',
		remove: 'breaking',
		edit: 'breaking'
	}
}
```

## Working with patterned fields

Since the AsyncAPI specifications allow the use of patterned fields, and these patterned fields differ from spec to spec.

Therefore, to overcome this issue, we came up `*` wildcard. The `*` will match any pattern it will get.

For example,

```yml
servers:
  google:
    protocol: https
```

The AsyncAPI spec says that the server name(in this case `google`) is a patterned field. It can be `google`, `bing` or whatever the user wants.

To match this patterned fields, the `jsonPointerPath` for this is `/servers/*/protocol`. This path can match `/servers/google/protocol` as well as `/servers/bing/protocol`.

## Working with array indexes

Since a change can also occur inside an array, the diff generates a path having the `index` of the array where the change has been occured.

For example,

```yml
servers:
  google:
    ports: [3000, 8000] # This is an example. Such property doesn't exist in the spec at this time
```

Removing `8000` from `ports` will result in change path as `/servers/google/ports/2`.

This array index can vary, so for array indexes we again use the `*`.

In the standard, we can map this path as `/servers/*/ports/*`. This can match `/servers/google/ports/100` as well as `/servers/bing/ports/99`.

This concludes our understanding of the format in which the standard is written. This format is also used in overriding the standard.
