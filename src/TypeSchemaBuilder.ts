import { map } from 'bluebird';
import { clone, merge } from 'lutils';
import { getProgramFromFiles } from 'typescript-json-schema';
import { Program } from 'typescript-json-schema/node_modules/typescript';
import {
  ISaveSchemasConfig, ITjsSchema,
  ITypesToSchemasConfig, saveSchemas, typesToSchemas,
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

  private program?: Program;

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

    if (reuseProgram && compile.fromFiles) {
      this.program = getProgramFromFiles(compile.fromFiles);
    }
  }

  public add (schemaConfig: IBuilderSchemaConfig) {
    this.builderConfigs.push(schemaConfig);

    return this;
  }

  public async compile () {
    await map(this.builderConfigs, async (config) => {
      const mergedConfig = <ITypesToSchemasConfig> merge(
        { program: this.program },
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
