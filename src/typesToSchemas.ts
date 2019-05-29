import { dereference } from '@jdw/jst';
import { mkdirs, writeFile } from 'fs-extra';
import { isArray } from 'lutils';
import { join } from 'path';
import { Args, buildGenerator, getProgramFromFiles, JsonSchemaGenerator } from 'typescript-json-schema';

import { IGetImportPath, renderExportsToTs, renderSchemasToJson, renderSchemasToTs } from './lib/schemaRenderers';

export interface ITjsSchema {
  name?: string;
  type: string;
  schema: any;
}

export interface IProgram { [key: string]: any; }

export const defaultOptions: Partial<Args> = {
  required: true,
  noExtraProps: true,
  ignoreErrors: true, // Remove when we upgrade
  aliasRef: true,
};

export interface ITypeMap {
  /** Required when `asDefaultExport` is `false` */
  name?: string;

  /** The typescript type to generate from */
  type: string;

  /** Can be used to set `schema.id` if it is not set */
  id?: string;

  /** Whether to error on non-existance */
  optional?: boolean;
}

export interface ITypesToSchemasConfig {
  /** The TS files to fetch types from, or an existing ts.Program */
  fromFiles: string[] | IProgram;

  /** A hash of `{ [exportName]: typeName }` */
  types: ITypeMap[];

  /** TJS options to override */
  options?: Partial<Args>;

  dereference?: boolean;

  /** A hash of `[type]: id` for generating `{ $ref: id }` in place of inline schemas */
  refOverrides?: { [key: string]: string };

  /** Replace all types with $ref to their ids instead of inlining them */
  replaceWithRefs?: boolean;

  generator?: JsonSchemaGenerator;

}

export function getTsProgram (fromFiles: string[] | IProgram): IProgram {
  const program = isArray(fromFiles)
    ? getProgramFromFiles(fromFiles as any)
    : fromFiles;

  return program;
}

/**
 * Reads TypeScript files using `typescript-json-schema` and returns both
 * errors and the resulting schemas.
 */
export async function typesToSchemas (config: ITypesToSchemasConfig): Promise<{
  errors?: Error[];
  schemas: ITjsSchema[];
}> {
  const {
    types,
    dereference: doDereference = false,
    generator: inputGenerator,
  } = config;

  const schemas: ITjsSchema[] = [];
  const errors: Error[] = [];

  const generator = inputGenerator || createTypeToSchemaGenerator(config);

  if (!generator) {
    throw new Error('Failure to create a generator for in `typesToSchemas`');
  }

  for (const { name, type, id, optional } of types) {
    let schema: any;

    try {
      schema = generator.getSchemaForSymbol(type);
    } catch (error) {
      if (optional) { continue; }

      errors.push(error);
    }

    if (schema) {
      if (id && !schema.$id) { schema.$id = id; }

      schema = removeUnusedJsonSchemaDefinitions(schema);

      if (doDereference) { schema = dereference(schema, undefined as any); }

      schemas.push({ name, type, schema });
    }
  }

  return {
    errors: errors.length ? errors : undefined,
    schemas,
  };
}

export function extractRefsFromConfig ({ refOverrides, replaceWithRefs, types }: ITypesToSchemasConfig) {
  const refsToReplace: Array<{ type: string, $ref: string }> = [];

  // Add in all refOverrides to replace them with $refs
  if (refOverrides) {
    for (const type of Object.keys(refOverrides)) {
      refsToReplace.push({ type, $ref: refOverrides[type] });
    }
  }

  // When a `type` def has an associated id, we can use that as a $ref
  if (replaceWithRefs && types) {
    for (const { type, id: $ref } of types) {
      if (!$ref) { continue; }

      refsToReplace.push({ type, $ref });
    }
  }

  return refsToReplace;
}

function findRefsInSchema (schema: any, refs: string[]): string[] {
  const matches: string[] = [];

  if (!(schema instanceof Object)) { return matches; }

  for (const key of Object.keys(schema)) {
    if (key === '$ref' && refs.includes(schema[key])) {
      matches.push(schema[key]);
      continue;
    }

    matches.push(...findRefsInSchema(schema[key], refs));
  }

  return matches;
}

export function removeUnusedJsonSchemaDefinitions (schema: any) {
  if (!schema.definitions) { return schema; }

  const newSchema = {
    ...schema,
    definitions: {
      ...schema.definitions,
    },
  };

  const definitionKeys: string[] = Object.keys(schema.definitions).map((key) => `#/definitions/${key}`);

  const definitionsInUse = findRefsInSchema(schema, definitionKeys);

  Object.keys(newSchema.definitions).forEach((key) => {
    if (!definitionsInUse.includes(`#/definitions/${key}`)) {
      delete newSchema.definitions[key];
    }
  });

  return newSchema;
}

export function createTypeToSchemaGenerator (config: ITypesToSchemasConfig) {
  const { fromFiles, options } = config;

  const program = getTsProgram(fromFiles);

  const generator = <JsonSchemaGenerator> buildGenerator(program as any, {
    ...defaultOptions,
    ...options,
  });

  const refsToReplace = extractRefsFromConfig(config);

  // Set the overrides for $refs in the generator
  for (const { type, $ref } of refsToReplace) {
    generator.setSchemaOverride(type, { $ref });
  }

  return generator;

}

export interface ISaveSchemasConfig {
  /** The file format to save as  */
  format: 'ts' | 'json';

  /**
   * Whether to export as a default when `ts` format selected and `schemas` has a length of 1
   *
   * Default: false
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
