import { join } from 'path';
import { typeToSchema } from '../';

describe('typeToSchema', () => {
  it('produces a single schema from one file', async () => {
    const { errors, schemas: [schema] } = await typeToSchema({
      fromFiles: [join(__dirname, './fixtures/types.ts')],
      types: { Test: 'ITest' },
    });

    expect(errors).toBeFalsy();
    expect(schema).toMatchSnapshot('singleSchema');
  });

  it('produces multiple schemas from one file', async () => {
    const { errors, schemas } = await typeToSchema({
      fromFiles: [join(__dirname, './fixtures/types.ts')],
      types: {
        Test: 'ITest',
        Test2: 'ITest2',
      },
    });

    expect(errors).toBeFalsy();
    expect(schemas).toMatchSnapshot('multipleSchemas');
  });
});
