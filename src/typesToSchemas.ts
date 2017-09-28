import { dereference } from '@jdw/jst';
import { mkdirs, writeFile } from 'fs-extra';
import { join } from 'path';
import * as TJS from 'typescript-json-schema';
import { IGetImportPath, renderExportsToTs, renderSchemasToJson, renderSchemasToTs } from './lib/schemaRenderers';

export interface ITjsSchema {
  name?: string;
  type: string;
  schema: any;
}

export const defaultOptions: Partial<TJS.Args> = {
  required: true,
  noExtraProps: true,
  ignoreErrors: true, // Remove when we upgrade
};

export interface ITypesToSchemasConfig {
  /** The TS files to fetch types from */
  fromFiles: string[];

  /** A hash of { [exportName]: typeName } */
  types: Array<{
    /** Required when `asDefaultExport` is `false` */
    name?: string;

    /** The typescript type to generate from */
    type: string;

    /** Can be used to set `schema.id` if it is not set */
    id?: string;
  }>;

  /** TJS options to override */
  options?: Partial<TJS.Args>;

  dereference?: boolean;
}

/**
 * Reads TypeScript files using `typescript-json-schema` and returns both
 * errors and the resulting schemas.
 */
export async function typesToSchemas ({
  fromFiles, types,
  options = {},
  dereference: doDereference = true,
}: ITypesToSchemasConfig): Promise<{
  errors?: Error[];
  schemas: ITjsSchema[];
}> {
  const program = TJS.getProgramFromFiles(fromFiles);

  const schemas: ITjsSchema[] = [];
  const errors: Error[] = [];

  types.forEach(({ name, type, id }) => {
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

      if (doDereference) { schema = dereference(schema, undefined as any); }

      schemas.push({ name, type, schema });
    }
  });

  return {
    errors: errors.length ? errors : undefined,
    schemas,
  };
}

export interface ISaveSchemasConfig {
  /** The file format to save as  */
  format: 'ts' | 'json';

  /**
   * Whether to export as a default when `ts` format selected and `schemas` has a length of 1
   *
   * @default false
   */
  asDefaultExport: boolean;

  /**
   * The name of the saved file, without extension.
   */
  name: string;

  /** The absolute path to the save directory */
  directory: string;

  schemas: ITjsSchema[];
}

/**
 * Saves schemas as multiple format, to a `.ts` or `.json` file, based on provided options.
 */
export async function saveSchemas ({ schemas, directory, name, format, asDefaultExport = false }: ISaveSchemasConfig) {
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
 * Creates an index file wiring up imports and exports
 */
export async function saveExports ({ exports, directory, name, getImportPath, getImportPattern }: {
  /** Names of export names */
  exports: string[],

  /** Should return a valid relative import path for the destination directory */
  getImportPath: IGetImportPath

  /** (Optional) Defaults to returning `* as ${name}` in an import statement. Must resolve to a single `name` */
  getImportPattern?: IGetImportPath

  /** Save directory */
  directory: string;

  name: string;
}) {
  await mkdirs(directory);

  const file = renderExportsToTs(exports, { getImportPath, getImportPattern });
  const filePath = join(directory, `${name}.ts`);

  await writeFile(filePath, file);
}
