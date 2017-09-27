import { map } from 'bluebird';
import { clone, merge } from 'lutils';
import {
  IBuilderSchemaConfig, ISaveSchemasConfig, ITjsSchema,
  ITypesToSchemasConfig, saveSchemas, typesToSchemas,
} from './typesToSchemas';

export class TypeSchemaBuilder {
  private saveConfig?: ISaveSchemasConfig;
  private compileConfig?: ITypesToSchemasConfig;

  private builderConfigs: IBuilderSchemaConfig[] = [];
  private compileResults: Array<{
    schemas: ITjsSchema[],
    config: IBuilderSchemaConfig,
    errors?: Error[],
  }> = [];

  constructor ({ save, compile }: {
    save?: ISaveSchemasConfig,
    compile?: ITypesToSchemasConfig,
  }) {
    this.saveConfig = save;
    this.compileConfig = compile;
  }

  add (schemaConfig: IBuilderSchemaConfig) {
    this.builderConfigs.push(schemaConfig);

    return this;
  }

  async compile () {
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
  }

  async save () {
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
          const { name, schema } = schemaConfig;

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
  }
}
