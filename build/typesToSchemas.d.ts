import { Args } from 'typescript-json-schema';
import { Program } from 'typescript-json-schema/node_modules/typescript';
import { IGetImportPath } from './lib/schemaRenderers';
export interface ITjsSchema {
    name?: string;
    type: string;
    schema: any;
}
export declare const defaultOptions: Partial<Args>;
export interface ITypesToSchemasConfig {
    /** The TS files to fetch types from, or an existing ts.Program */
    fromFiles: string[] | Program;
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
    options?: Partial<Args>;
    dereference?: boolean;
}
export declare function getTsProgram(fromFiles: string[] | Program): Program;
/**
 * Reads TypeScript files using `typescript-json-schema` and returns both
 * errors and the resulting schemas.
 */
export declare function typesToSchemas({fromFiles, types, options, dereference: doDereference}: ITypesToSchemasConfig): Promise<{
    errors?: Error[];
    schemas: ITjsSchema[];
}>;
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
