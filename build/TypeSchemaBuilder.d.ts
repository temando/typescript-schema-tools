import { ISchemasInput } from './schemaModuleMap';
import { ISaveSchemasConfig, ITjsSchema, ITypeMap, ITypesToSchemasConfig } from './typesToSchemas';
export interface IBuilderSchemaConfig {
    save?: Partial<ISaveSchemasConfig>;
    compile?: Partial<ITypesToSchemasConfig>;
}
export interface ISchemaModuleMapParams {
    schemas: ISchemasInput;
    moduleBase: string;
    fileName: string;
}
/**
 * An friendlier API for building multiple schemas by sharing configurations
 */
export declare class TypeSchemaBuilder {
    compiled: Array<{
        schemas: ITjsSchema[];
        config: IBuilderSchemaConfig;
        errors?: Error[];
    }>;
    /** Merely an array of promises we wait for when .compileAndSave() is called */
    private queued;
    private replaceWithRefs;
    private saveConfig;
    private compileConfig;
    private builderConfigs;
    constructor({save, compile, reuseProgram, replaceWithRefs}: {
        save?: Partial<ISaveSchemasConfig>;
        compile?: Partial<ITypesToSchemasConfig>;
        reuseProgram?: boolean;
        /** Whether to resolve all schemas to $ref's when possible */
        replaceWithRefs?: boolean;
    });
    /** Add a IBuilderSchemaConfig to compile. Overrides any default values */
    add(configs: IBuilderSchemaConfig | IBuilderSchemaConfig[]): this;
    /** A simplified method, like #add(), to map a type to a name */
    addType(configs: ITypeMap | ITypeMap[]): this;
    /** Queue this up so we only have to run .compileAndSave() */
    addSchemaModuleMap(config: ISchemaModuleMapParams): this;
    compileAndSave(): Promise<void>;
    compile(): Promise<{
        schemas: ITjsSchema[];
        config: IBuilderSchemaConfig;
        errors?: Error[] | undefined;
    }[]>;
    save(compiled?: {
        schemas: ITjsSchema[];
        config: IBuilderSchemaConfig;
        errors?: Error[] | undefined;
    }[]): Promise<void>;
    saveSchemaModuleMap({schemas, moduleBase, fileName}: ISchemaModuleMapParams): Promise<void>;
}
