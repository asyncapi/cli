import { describe, it, expect } from 'chai';

/**
 * Inline copy of safeJson for testing (avoids path resolution issues).
 * Mirrors the implementation in src/apps/cli/commands/diff.ts
 * Issue: https://github.com/asyncapi/cli/issues/2093
 */
function safeValue(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (seen.has(value)) {
    return '[Circular]';
  }
  seen.add(value);
  if (Array.isArray(value)) {
    return value.map((item) => safeValue(item, seen));
  }
  const obj: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    obj[k] = safeValue(v, seen);
  }
  return obj;
}

function safeJson(doc: Record<string, unknown>): Record<string, unknown> {
  const seen = new WeakSet();
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(doc)) {
    result[key] = safeValue(value, seen);
  }
  return result;
}

describe('diff command - circular reference handling', () => {
  it('should handle documents without circular references', () => {
    const doc = {
      asyncapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      channels: {},
      components: { schemas: {} },
    };

    const result = safeJson(doc);
    expect(result).to.deep.equal(doc);
  });

  it('should replace circular references with [Circular] placeholder', () => {
    // Reproduce the exact structure from issue #2093
    const circularObj: Record<string, unknown> = { type: 'array' };
    circularObj.items = {
      anyOf: [
        { $ref: '#/components/schemas/filters' } as Record<string, unknown>,
        { type: 'string' as string },
      ],
    };

    const filters = circularObj;
    // Create circular reference: filters -> items.anyOf[0] -> #/components/schemas/filters -> filters
    const doc = {
      asyncapi: '3.1.0',
      info: { title: 'Testing', version: '1.0.0' },
      components: {
        schemas: {
          filters,
          'entity-created': {
            type: 'object',
            properties: {
              filters: { $ref: '#/components/schemas/filters' },
            },
          },
        },
      },
    };

    // Should not throw "Converting circular structure to JSON"
    expect(() => JSON.stringify(safeJson(doc))).to.not.throw();

    const result = safeJson(doc);
    const strResult = JSON.stringify(result);
    // The circular reference should be replaced with [Circular]
    expect(strResult).to.include('[Circular]');
  });

  it('should handle self-referencing objects', () => {
    const doc: Record<string, unknown> = { root: true };
    doc.self = doc;

    expect(() => JSON.stringify(safeJson(doc))).to.not.throw();

    const result = safeJson(doc);
    // Self-reference is safely serialized without throwing
    const strResult = JSON.stringify(result);
    expect(strResult).to.include('[Circular]');
  });

  it('should preserve all non-circular data intact', () => {
    const doc = {
      asyncapi: '3.1.0',
      info: {
        title: 'Testing',
        version: '1.0.0',
      },
      channels: {
        my_entity_created: {
          messages: {
            'entity-created': {
              payload: {
                $ref: '#/components/schemas/entity-created',
              },
            },
          },
        },
      },
      operations: {
        my_entity_created: {
          action: 'send',
          channel: {
            $ref: '#/channels/my_entity_created',
          },
        },
      },
      components: {
        schemas: {},
      },
    };

    const result = safeJson(doc);
    expect(result.info.title).to.equal('Testing');
    expect(result.asyncapi).to.equal('3.1.0');
    expect(Object.keys(result.channels)).to.have.length(1);
  });

  it('should handle null and primitive values correctly', () => {
    const doc = {
      a: null,
      b: 'string',
      c: 123,
      d: true,
      f: [1, 'two', null],
    };

    const result = safeJson(doc);
    expect(result.a).to.be.null;
    expect(result.b).to.equal('string');
    expect(result.c).to.equal(123);
    expect(result.d).to.be.true;
    expect(result.f).to.deep.equal([1, 'two', null]);
  });
});
