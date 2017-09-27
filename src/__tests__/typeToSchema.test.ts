import { mkdir, remove } from 'fs-extra';
import { join } from 'path';
import { ITjsSchema, saveExports, saveSchemas, typesToSchemas } from '..';

/** Whether to delete created files, for testing */
const DELETE_TEMP = true;

describe('typeToSchema', () => {
  const typeFixturesFilePath = join(__dirname, './fixtures/types.ts');
  const tempDirectory = join(__dirname, './__temp__');

  async function ensureTemp () { try { await mkdir(tempDirectory); } catch { /**/ } }
  async function removeTemp () { if (DELETE_TEMP) { await remove(tempDirectory); } }

  beforeAll(ensureTemp);
  afterAll(removeTemp);

  describe('typesToSchemas()', () => {
    it('produces a single schema from one file', async () => {
      const { errors, schemas: [schema] } = await typesToSchemas({
        fromFiles: [typeFixturesFilePath],
        types: { Test: 'ITest' },
      });

      expect(errors).toBeFalsy();
      expect(schema).toMatchSnapshot('singleSchema');
    });

    it('produces multiple schemas from one file', async () => {
      const { errors, schemas } = await typesToSchemas({
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

  describe('saveSchemas()', () => {
    let singleSchema: ITjsSchema;
    let manySchemas: ITjsSchema[];

    beforeAll(async () => {
      const { schemas: [schema] } = await typesToSchemas({
        fromFiles: [typeFixturesFilePath],
        types: { Test: 'ITest' },
      });

      singleSchema = schema;

      const { schemas } = await typesToSchemas({
        fromFiles: [typeFixturesFilePath],
        types: { Test: 'ITest', Test2: 'ITest2' },
      });

      manySchemas = schemas;

    });

    it('saves a single schema as default export to a .ts file', async () => {
      const fileName = `singleSchema`;
      const fullFilePath = join(tempDirectory, `${fileName}.ts`);

      await saveSchemas({
        asDefaultExport: true,
        directory: tempDirectory,
        name: fileName,
        format: 'ts',
        schemas: [singleSchema],
      });

      const exported = require(fullFilePath);

      expect(exported).toMatchSnapshot('singleSchemaDefaultExport');
    });

    it('saves a single schema to a .json file', async () => {
      const fileName = `singleSchemaJson`;
      const fullFilePath = join(tempDirectory, `${fileName}.json`);

      await saveSchemas({
        asDefaultExport: true,
        directory: tempDirectory,
        name: fileName,
        format: 'json',
        schemas: [singleSchema],
      });

      const exported = require(fullFilePath);

      expect(exported).toMatchSnapshot('singleSchemaJson');
    });

    it('correctly fails to save multiple schema as a default export', async () => {
      let error: Error | undefined;

      await saveSchemas({
        asDefaultExport: true,
        directory: tempDirectory,
        name: 'thisShouldNotBeSaved',
        format: 'ts',
        schemas: manySchemas,
      }).catch((err) => error = err);

      expect(error).toBeInstanceOf(Error);
    });

    it('saves multiple schema to a .ts file', async () => {
      const fileName = `manySchemas`;
      const fullFilePath = join(tempDirectory, `${fileName}.ts`);

      await saveSchemas({
        asDefaultExport: false,
        directory: tempDirectory,
        name: fileName,
        format: 'ts',
        schemas: manySchemas,
      });

      const exported = require(fullFilePath);

      expect(exported).toMatchSnapshot('manySchemas');
    });
  });

  describe('saveExports()', () => {
    it('creates a file with imports and exports', async () => {
      const fileName = `exports`;
      const fullFilePath = join(tempDirectory, fileName);

      /** This is saving to ./__temp__/exports.ts */
      await saveExports({
        name: fileName,
        directory: tempDirectory,
        getImportPath: (name) => `../fixtures/imports/${name}`,
        exports: ['a', 'b'],
      });

      const exports = require(fullFilePath);

      expect(exports).toMatchSnapshot('saveExports');
    });
  });

});
