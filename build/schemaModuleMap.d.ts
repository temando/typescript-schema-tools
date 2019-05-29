export interface ISchemaModuleMap {
    [k: string]: string;
}
export interface ISchemasInput {
    [k: string]: {
        id: string;
    };
}
/**
 * Create a [schema.id]: <modulePath> map file
 */
export declare function createSchemaModuleMap({ schemas, moduleBase }: {
    /** JSON Schemas, with id's */
    schemas: ISchemasInput;
    /** The base for generated module paths, eg. "@mydomain/my-module/my-schema-folder" */
    moduleBase: string;
}): ISchemaModuleMap;
export declare function renderSchemaModuleMapToTs(map: ISchemaModuleMap): string;
