import { mkdir, remove } from 'fs-extra';
import { join } from 'path';
import { ITjsSchema, saveExports, saveSchemas, typesToSchemas } from '..';
import { TypeSchemaBuilder } from '../TypeSchemaBuilder';

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
        types: [
          { name: 'Test', type: 'ITest' },
        ],
      });

      expect(errors).toBeFalsy();
      expect(schema).toMatchSnapshot('singleSchema');
    });

    it('produces multiple schemas from one file', async () => {
      const { errors, schemas } = await typesToSchemas({
        fromFiles: [join(__dirname, './fixtures/types.ts')],
        types: [
          { name: 'Test', type: 'ITest' },
          { name: 'Test2', type: 'ITest2' },
        ],
      });

      expect(errors).toBeFalsy();
      expect(schemas).toMatchSnapshot('multipleSchemas');
    });

    it('produces a schema with an overridden $ref', async () => {
      const ref = 'ref-me#';

      const { errors, schemas } = await typesToSchemas({
        refOverrides: { IRefMe: ref },
        fromFiles: [join(__dirname, './fixtures/types.ts')],
        types: [{ name: 'Test2', type: 'ITest2' }],
      });

      expect(errors).toBeFalsy();
      expect(schemas).toMatchSnapshot('reffedSchema');

      expect(schemas[0].schema.definitions.IRefMe.$ref).toBe(ref);
    });

    it('produces a schema with an annotated $ref', async () => {
      const { errors, schemas } = await typesToSchemas({
        fromFiles: [join(__dirname, './fixtures/types.ts')],
        types: [{ type: 'IRefTest' }],
      });

      expect(errors).toBeFalsy();
      expect(schemas).toMatchSnapshot('annotatedReffedSchema');

      expect(schemas[0].schema.properties.a.$ref).toBe('test-ref#');
    });
  });

  describe('saveSchemas()', () => {
    let singleSchema: ITjsSchema;
    let manySchemas: ITjsSchema[];

    beforeAll(async () => {
      const { schemas: [schema] } = await typesToSchemas({
        fromFiles: [typeFixturesFilePath],
        types: [{ name: 'Test', type: 'ITest' }],
      });

      singleSchema = schema;

      const { schemas } = await typesToSchemas({
        fromFiles: [typeFixturesFilePath],
        types: [
          { name: 'Test', type: 'ITest' },
          { name: 'Test2', type: 'ITest2' },
        ],
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

  describe('TypeSchemaBuilder', () => {
    it('compiles and saves multiple seperate schemas', async () => {
      const fileOne = 'builderOne';
      const fileTwo = 'builderTwo';

      // Verbose chaining method
      const builder = new TypeSchemaBuilder({
        compile: {
          fromFiles: [typeFixturesFilePath],
        },
        save: {
          asDefaultExport: true,
          directory: tempDirectory,
          format: 'ts',
        },
      })
        .add({
          compile: {
            types: [{ type: 'ITest' }],
          },
          save: { name: fileOne },
        })
        .add({
          compile: {
            types: [{ type: 'ITest2' }],
          },
          save: { name: fileTwo },
        });

      await builder.compile();
      await builder.save();

      expect(
        require(join(tempDirectory, fileOne)),
      ).toMatchSnapshot('builderSeperateOne');

      expect(
        require(join(tempDirectory, fileTwo)),
      ).toMatchSnapshot('builderSeperateTwo');
    });

    it('compiles and saves multiple combined schemas', async () => {
      const fileOne = 'builderTogetherOne';
      const fileTwo = 'builderTogetherTwo';

      const types = [
        { name: fileOne, type: 'ITest' },
        { name: fileTwo, type: 'ITest2' },
      ];

      // Simplified chaining
      await new TypeSchemaBuilder({
        compile: {
          fromFiles: [typeFixturesFilePath],
        },
        save: {
          asDefaultExport: false, // this causes multiple to be included in one file
          directory: tempDirectory,
          format: 'ts',
        },
      })
        .add({
          compile: { types },
          save: { name: fileOne },
        })
        .add({
          compile: { types },
          save: { name: fileTwo },
        })
        .compileAndSave();

      const exportsOne = require(join(tempDirectory, fileOne));

      expect(exportsOne).toMatchObject({
        [fileOne]: {},
        [fileTwo]: {},
      });

      expect(exportsOne).toMatchSnapshot(fileOne);

      expect(
        require(join(tempDirectory, fileTwo)),
      ).toMatchSnapshot(fileTwo);

    });
  });
});
