import React from 'react';
import { render } from 'ink-testing-library';
import Help from './Help';


function renderHelpWith(message: string) {
  return render(<Help message={message}/>);
}

describe('Help should', () => {
  test('the help message passed', () => {
    const { lastFrame } = renderHelpWith('Help Message');
    expect(lastFrame()).toBe('Help Message');
  });
});
