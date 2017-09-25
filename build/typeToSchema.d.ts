import * as TJS from 'typescript-json-schema';
import { IGetImportPath } from './lib/schemaRenderers';
export interface ITjsSchema {
    key: string;
    type: string;
    schema: any;
}
export declare const defaultOptions: Partial<TJS.Args>;
export declare function typeToSchema({fromFiles, types, id, options}: {
    /** The TS files to fetch types from */
    fromFiles: string[];
    /** A hash of { [exportName]: typeName } */
    types: {
        [key: string]: string;
    };
    /** Optionally, set a default schema id */
    id?: string;
    /** TJS options to override */
    options?: Partial<TJS.Args>;
}): Promise<{
    errors?: Error[];
    schemas: ITjsSchema[];
}>;
export declare function saveSchema({schemas, directory, name, format, asDefaultExport}: {
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
    schemas: ITjsSchema[];
}): Promise<void>;
/**
 * Creates an index file wiring up imports
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
