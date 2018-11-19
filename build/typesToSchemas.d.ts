import { Args, JsonSchemaGenerator } from 'typescript-json-schema';
import { IGetImportPath } from './lib/schemaRenderers';
export interface ITjsSchema {
    name?: string;
    type: string;
    schema: any;
}
export interface IProgram {
    [key: string]: any;
}
export declare const defaultOptions: Partial<Args>;
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
    refOverrides?: {
        [key: string]: string;
    };
    /** Replace all types with $ref to their ids instead of inlining them */
    replaceWithRefs?: boolean;
    generator?: JsonSchemaGenerator;
}
export declare function getTsProgram(fromFiles: string[] | IProgram): IProgram;
/**
 * Reads TypeScript files using `typescript-json-schema` and returns both
 * errors and the resulting schemas.
 */
export declare function typesToSchemas(config: ITypesToSchemasConfig): Promise<{
    errors?: Error[];
    schemas: ITjsSchema[];
}>;
export declare function extractRefsFromConfig({refOverrides, replaceWithRefs, types}: ITypesToSchemasConfig): {
    type: string;
    $ref: string;
}[];
export declare function removeUnusedJsonSchemaDefinitions(schema: any): any;
export declare function createTypeToSchemaGenerator(config: ITypesToSchemasConfig): JsonSchemaGenerator;
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
export declare function saveSchemas({schemas, directory, name, format, asDefaultExport}: ISaveSchemasConfig): Promise<void>;
/**
 * Creates an index file wiring up imports and exports
 */
export declare function saveExports({exports, directory, name, getImportPath, getImportPattern}: {
    /** Names of export names */
    exports: string[];
    /** Should return a valid relative import path for the destination directory */
    getImportPath: IGetImportPath;
    /** (Optional) Defaults to returning `* as ${name}` in an import statement. Must resolve to a single `name` */
    getImportPattern?: IGetImportPath;
    /** Save directory */
    directory: string;
    name: string;
}): Promise<void>;
