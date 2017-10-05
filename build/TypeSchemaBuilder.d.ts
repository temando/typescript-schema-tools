import { ISaveSchemasConfig, ITjsSchema, ITypeMap, ITypesToSchemasConfig } from './typesToSchemas';
export interface IBuilderSchemaConfig {
    save?: Partial<ISaveSchemasConfig>;
    compile?: Partial<ITypesToSchemasConfig>;
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
    private replaceWithRefs;
    private saveConfig?;
    private compileConfig?;
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
    compileAndSave(): Promise<this>;
}
