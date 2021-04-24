import React from 'react';
import { render } from 'ink-testing-library';
import { commandsRouter } from "./CommandsRouter";

function renderAux(cli: any) {
  return render(commandsRouter(cli));
}

describe('CommandsRouter should', () => {
  test('route to help component', () => {
    const { lastFrame } = renderAux({});
    expect(lastFrame).toBe(null);
  });
});
