/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { createAjvInstance } from '../../../src/utils/ajv';

describe('createAjvInstance()', () => {
  it('should create an AJV instance', () => {
    const ajv = createAjvInstance();
    expect(ajv).to.not.be.undefined;
    expect(ajv.compile).to.be.a('function');
  });

  it('should support formats', () => {
    const ajv = createAjvInstance();
    const schema = {
      type: 'string',
      format: 'email'
    };
    
    const validate = ajv.compile(schema);
    expect(validate('test@example.com')).to.be.true;
    expect(validate('invalid-email')).to.be.false;
  });

  it('should return validation errors when validation fails', () => {
    const ajv = createAjvInstance();
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' }
      },
      required: ['name', 'age']
    };
    
    const validate = ajv.compile(schema);
    const result = validate({ name: 'John' }); // missing age
    
    expect(result).to.be.false;
    expect(validate.errors).to.not.be.null;
    expect(validate.errors).to.have.length.greaterThan(0);
  });
});
