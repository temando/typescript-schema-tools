import { map } from 'bluebird';
import { clone, isArray, merge } from 'lutils';
import {
  getTsProgram, ISaveSchemasConfig,
  ITjsSchema, ITypeMap, ITypesToSchemasConfig,
  saveSchemas, typesToSchemas,
} from './typesToSchemas';

export interface IBuilderSchemaConfig {
  save?: Partial<ISaveSchemasConfig>;
  compile?: Partial<ITypesToSchemasConfig>;
}

export class TypeSchemaBuilder {
  public compiled: Array<{
    schemas: ITjsSchema[],
    config: IBuilderSchemaConfig,
    errors?: Error[],
  }> = [];

  private saveConfig?: Partial<ISaveSchemasConfig>;
  private compileConfig?: Partial<ITypesToSchemasConfig>;
  private builderConfigs: IBuilderSchemaConfig[] = [];

  constructor ({ save, compile = {}, reuseProgram = true }: {
    save?: Partial<ISaveSchemasConfig>,
    compile?: Partial<ITypesToSchemasConfig>,
    reuseProgram?: boolean;
  }) {
    this.saveConfig = save;
    this.compileConfig = compile;

    const { fromFiles } = this.compileConfig;

    if (reuseProgram && fromFiles) {
      this.compileConfig.fromFiles = getTsProgram(fromFiles);
    }
  }

  /** Add a IBuilderSchemaConfig to compile. Overrides any default values */
  public add (configs: IBuilderSchemaConfig|IBuilderSchemaConfig[]) {
    if (!isArray(configs)) { configs = [configs]; }

    this.builderConfigs.push(...configs);

    return this;
  }

  /** A simplified method, like #add(), to map a type to a name */
  public addType (configs: ITypeMap|ITypeMap[]) {
    if (!isArray(configs)) { configs = [configs]; }

    this.add(
      configs.map(({ type, name = type, id }) => {
        return {
          compile: { types: [{ type, name, id }] },
          save: { name },
        };
      }),
    );

    return this;
  }

  public async compile () {
    await map(this.builderConfigs, async (config) => {
      const mergedConfig = <ITypesToSchemasConfig> merge(
        clone(this.compileConfig || {}),
        config.compile || {},
      );

      const { errors, schemas } = await typesToSchemas(mergedConfig);

      this.compiled.push({
        schemas,
        errors,
        config,
      });
    });

    return this.compiled;
  }

  public async save (compiled = this.compiled) {
    await map(compiled, async ({ config, schemas: schemaConfigs, errors }) => {
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
  }

  public async compileAndSave () {
    await this.compile();
    await this.save();

    return this;
  }
}
