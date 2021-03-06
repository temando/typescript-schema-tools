import { ISchemasInput } from './schemaModuleMap';
import { ISaveSchemasConfig, ITjsSchema, ITypeMap, ITypesToSchemasConfig } from './typesToSchemas';
export interface IBuilderSchemaConfig {
    save?: Partial<ISaveSchemasConfig>;
    compile?: Partial<ITypesToSchemasConfig>;
}
export declare type ITypeMapBuilderConfig = ITypeMap & IBuilderSchemaConfig;
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
    private replaceWithRefs;
    private deDupe;
    private emitErrors;
    private saveConfig;
    private compileConfig;
    private builderConfigs;
    constructor({ save, compile, reuseProgram, replaceWithRefs, emitErrors, deDupe, }: {
        save?: Partial<ISaveSchemasConfig>;
        compile?: Partial<ITypesToSchemasConfig>;
        reuseProgram?: boolean;
        /** Whether to resolve all schemas to $ref's when possible */
        replaceWithRefs?: boolean;
        /** Whether to emit errors to the console on compilation */
        emitErrors?: boolean;
        /** Whether to de-dupe references in a schema due to a bug in the underlying library */
        deDupe?: boolean;
    });
    /** Add a IBuilderSchemaConfig to compile. Overrides any default values */
    add(configs: IBuilderSchemaConfig | IBuilderSchemaConfig[]): this;
    /** A simplified method, like #add(), to map a type to a name */
    addType(configs: ITypeMapBuilderConfig | ITypeMapBuilderConfig[]): this;
    compileAndSave(): Promise<this>;
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
    saveSchemaModuleMap({ schemas, moduleBase, fileName }: ISchemaModuleMapParams): Promise<void>;
}
