import { map } from 'bluebird';
import { clone, merge } from 'lutils';
import {
  ISaveSchemasConfig, ITjsSchema,
  ITypesToSchemasConfig, saveSchemas, typesToSchemas,
} from './typesToSchemas';

export interface IBuilderSchemaConfig {
  save?: Partial<ISaveSchemasConfig>;
  compile?: Partial<ITypesToSchemasConfig>;
}

export class TypeSchemaBuilder {
  private saveConfig?: Partial<ISaveSchemasConfig>;
  private compileConfig?: Partial<ITypesToSchemasConfig>;

  private builderConfigs: IBuilderSchemaConfig[] = [];
  private compileResults: Array<{
    schemas: ITjsSchema[],
    config: IBuilderSchemaConfig,
    errors?: Error[],
  }> = [];

  constructor ({ save, compile }: {
    save?: TypeSchemaBuilder['saveConfig'],
    compile?: TypeSchemaBuilder['compileConfig'],
  }) {
    this.saveConfig = save;
    this.compileConfig = compile;
  }

  public add (schemaConfig: IBuilderSchemaConfig) {
    this.builderConfigs.push(schemaConfig);

    return this;
  }

  public async compile () {
    await map(this.builderConfigs, async (config) => {
      const mergedConfig = <ITypesToSchemasConfig> merge(
        clone(this.compileConfig || {}),
        config.compile || {},
      );

      const { errors, schemas } = await typesToSchemas(mergedConfig);

      this.compileResults.push({
        schemas,
        errors,
        config,
      });
    });

    return this;
  }

  public async save () {
    await map(this.compileResults, async ({ config, schemas: schemaConfigs, errors }) => {
      if (errors) { return; }

      const mergedConfig = <ISaveSchemasConfig> merge(
        clone(this.saveConfig || {}),
        config.save || {},
      );

      /** Whether to compile each seperately or together */
      const method = mergedConfig.asDefaultExport || mergedConfig.format === 'json'
        ? 'seperate'
        : 'together';

      if (method === 'seperate') {
        return map(schemaConfigs, (schemaConfig) => {
          return saveSchemas({
            ...mergedConfig,
            schemas: [schemaConfig],
          });
        });
      } else {
        return saveSchemas({
          ...mergedConfig,
          schemas: schemaConfigs,
        });
      }
    });

    return this;
  }

  public async compileAndSave () {
    await this.compile();
    await this.save();

    return this;
  }
}