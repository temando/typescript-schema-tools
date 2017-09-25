import { dereference } from '@jdw/jst';
import { mkdirs, writeFile } from 'fs-extra';
import { join } from 'path';
import * as TJS from 'typescript-json-schema';
import { IGetImportPath, renderExportsToTs, renderSchemasToJson, renderSchemasToTs } from './lib/schemaRenderers';

export interface ITjsSchema {
  key: string;
  type: string;
  schema: any;
}

export const defaultOptions: Partial<TJS.Args> = {
  required: true,
  noExtraProps: true,
  ignoreErrors: true, // Remove when we upgrade
};

export async function typeToSchema ({ fromFiles, types, id, options = {} }: {
  /** The TS files to fetch types from */
  fromFiles: string[];

  /** A hash of { [exportName]: typeName } */
  types: { [key: string]: string };

  /** Optionally, set a default schema id */
  id?: string;

  /** TJS options to override */
  options?: Partial<TJS.Args>,
}): Promise<{
  errors?: Error[];
  schemas: ITjsSchema[];
}> {
  const program = TJS.getProgramFromFiles(fromFiles);

  const schemas: ITjsSchema[] = [];
  const errors: Error[] = [];

  Object.keys(types).forEach((key) => {
    const type = types[key];

    let schema: any;

    try {
      schema = TJS.generateSchema(program, type, {
        ...defaultOptions,
        ...options,
      });
    } catch (error) {
      errors.push(error);
    }

    if (schema) {
      schema.id = schema.id || id;
      schemas.push({ key, type, schema: dereference(schema, undefined as any) });
    }
  });

  return { errors: errors.length ? errors : undefined, schemas };
}

export async function saveSchema ({ schemas, directory, name, format, asDefaultExport = false }: {
  /** The file format to save as  */
  format: 'ts' | 'json';

  /**
   * Whether to export as a default when `ts` format selected and `schemas` has a length of 1
   *
   * @default false
   */
  asDefaultExport: boolean;

  /** The name of the saved file, without extension */
  name: string;

  /** The absolute path to the save directory */
  directory: string;

  schemas: any[];
}) {
  if (!schemas.length) { return; }
  if (asDefaultExport && schemas.length > 1) {
    throw new Error(`You are trying to default export more than one schema`);
  }

  await mkdirs(directory);

  const filePath = join(directory, `${name}.${format}`);

  let file;

  if (format === 'ts') { file = renderSchemasToTs(schemas, { asDefaultExport }); }
  if (format === 'json') { file = renderSchemasToJson(schemas); }

  if (!file) { throw new Error(`Invalid render format: ${format}`); }

  await writeFile(filePath, file);
}

/**
 * Creates an index file wiring up imports
 */
export async function saveExports ({ exports, directory, name, getImportPath }: {
  /** Names of export names */
  exports: string[],

  /** Should return a valid relative import path for the destination directory */
  getImportPath: IGetImportPath

  /** Save directory */
  directory: string;

  name: string;
}) {
  await mkdirs(directory);

  const file = renderExportsToTs(exports, getImportPath);
  const filePath = join(directory, `${name}.ts`);

  await writeFile(filePath, file);
}
