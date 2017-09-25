import { join } from 'path';
import { typeToSchema } from '../';

describe('typeToSchema', () => {
  it('produces an arbitrary JSON Schema', async () => {
    const { errors, schemas: [schema] } = await typeToSchema({
      fromFiles: [join(__dirname, './fixtures/types.ts')],
      types: { Test: 'ITest' },
    });

    expect(errors).toBeFalsy();
    expect(schema).toMatchSnapshot('ITestSnapshot');

    console.dir({
      errors,
      schema,
    }, { depth: 10, colors: true });
  });
});
