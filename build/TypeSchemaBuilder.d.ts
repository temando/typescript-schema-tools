import { ISaveSchemasConfig, ITjsSchema, ITypesToSchemasConfig } from './typesToSchemas';
export interface IBuilderSchemaConfig {
    save?: Partial<ISaveSchemasConfig>;
    compile?: Partial<ITypesToSchemasConfig>;
}
export declare class TypeSchemaBuilder {
    compiled: Array<{
        schemas: ITjsSchema[];
        config: IBuilderSchemaConfig;
        errors?: Error[];
    }>;
    private saveConfig?;
    private compileConfig?;
    private builderConfigs;
    constructor({save, compile, reuseProgram}: {
        save?: Partial<ISaveSchemasConfig>;
        compile?: Partial<ITypesToSchemasConfig>;
        reuseProgram?: boolean;
    });
    add(schemaConfig: IBuilderSchemaConfig): this;
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
