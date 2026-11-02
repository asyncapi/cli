import convertToYAML from '../../../src/helpers/output/convertToYAML';

describe('YAML output', () => {
  test('should return YAML with mock object', () => {
    expect(convertToYAML({ hello: 'world' })).toEqual('hello: world\n');
  });

  test('should return YAML with mock array', () => {
    expect(convertToYAML(['hello', 'world'])).toEqual('- hello\n- world\n');
  });

  test('should return YAML with mock array', () => {
    expect(convertToYAML(['hello', { hello: 'world' }])).toEqual(
      '- hello\n- hello: world\n'
    );
  });
});
