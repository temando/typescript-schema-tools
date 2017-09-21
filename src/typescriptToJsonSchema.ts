#!/usr/bin/env ts-node

import { map } from 'bluebird';
import { exists } from 'fs-extra';
import { resolve } from 'path';
import { build } from './typescript/jsonSchema';

const entries = [
  {
    path: './src/automation/executeAction.ts',
    name: 'ExecuteActionRequest', type: 'IExecuteActionRequest',
    options: { noExtraProps: false },
  },
  {
    path: './src/automation/executeAction.ts',
    name: 'ExecuteActionSuccessResponse', type: 'IExecuteActionSuccessResponse',
    options: { noExtraProps: false },
  },
  {
    path: './src/automation/executeAction.ts',
    name: 'ExecuteActionFailureResponse', type: 'IExecuteActionFailureResponse',
    options: { noExtraProps: false },
  },
];

// tslint:disable:no-floating-promises
(async () => {
  const baseDir = resolve(__dirname, '../');

  await map(entries, async ({ type, path, name, options }) => {
    const file = resolve(baseDir, path);

    if (!await exists(file)) { return; }

    // tslint:disable-next-line:no-console
    console.log(file);

    await build({
      name, file,
      types: { [name]: type },
      to: resolve(baseDir, `./src/schemas/${name}.ts`),
      exportAsDefault: true,
      options,
    });
  });
})();
