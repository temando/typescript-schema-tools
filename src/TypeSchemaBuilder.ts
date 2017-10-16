import { map } from 'bluebird';
import { writeFile } from 'fs-extra';
import { clone, isArray, merge } from 'lutils';
import { extractRefsFromConfig } from './';
import { createSchemaModuleMap, ISchemasInput, renderSchemaModuleMapToTs } from './schemaModuleMap';
import {
  getTsProgram, ISaveSchemasConfig,
  ITjsSchema, ITypeMap, ITypesToSchemasConfig,
  saveSchemas, typesToSchemas,
} from './typesToSchemas';

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
export class TypeSchemaBuilder {
  compiled: Array<{
    schemas: ITjsSchema[],
    config: IBuilderSchemaConfig,
    errors?: Error[],
  }> = [];

  /** Merely an array of promises we wait for when .compileAndSave() is called */
  private queued: Array<Promise<any>> = [];
  private replaceWithRefs: boolean;
  private saveConfig: Partial<ISaveSchemasConfig>;
  private compileConfig: Partial<ITypesToSchemasConfig>;
  private builderConfigs: IBuilderSchemaConfig[] = [];

  constructor ({ save = {}, compile = {}, reuseProgram = true, replaceWithRefs = true }: {
    save?: Partial<ISaveSchemasConfig>,
    compile?: Partial<ITypesToSchemasConfig>,
    reuseProgram?: boolean;

    /** Whether to resolve all schemas to $ref's when possible */
    replaceWithRefs?: boolean;
  }) {
    this.saveConfig = save;
    this.compileConfig = compile;
    this.replaceWithRefs = replaceWithRefs;

    const { fromFiles } = this.compileConfig;

    if (reuseProgram && fromFiles) {
      this.compileConfig.fromFiles = getTsProgram(fromFiles);
    }
  }

  //
  // Fluid interfaces
  //

  /** Add a IBuilderSchemaConfig to compile. Overrides any default values */
  add (configs: IBuilderSchemaConfig|IBuilderSchemaConfig[]) {
    if (!isArray(configs)) { configs = [configs]; }

    this.builderConfigs.push(...configs);

    return this;
  }

  /** A simplified method, like #add(), to map a type to a name */
  addType (configs: ITypeMap|ITypeMap[]) {
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

  /** Queue this up so we only have to run .compileAndSave() */
  addSchemaModuleMap (config: ISchemaModuleMapParams) {
    this.queued.push(this.saveSchemaModuleMap(config));

    return this;
  }

  //
  // Async interfaces
  //

  async compileAndSave () {
    await this.compile();
    await this.save();

    if (this.queued.length) { await Promise.all(this.queued); }
  }

  async compile () {
    const refOverrides: { [key: string]: string } = {};

    if (this.replaceWithRefs) {
      const configs = [this, ...this.builderConfigs];

      for (const { compile = {} } of configs) {
        const config = <ITypesToSchemasConfig> merge(clone(this.compileConfig || {}), { replaceWithRefs: true }, compile);

        extractRefsFromConfig(config).forEach(({ type, $ref }) => {
          refOverrides[type] = $ref;
        });
      }
    }

    // TODO: if we read the symbols without compiling schema, we may be able to extract
    // the id annotation, then compile
    // TODO: option two: add a recursive lookup for $ref as per the extract function
    // and manually replace each occurance AFTER compilation

    await map(this.builderConfigs, async (config) => {
      const mergedConfig = <ITypesToSchemasConfig> merge(
        clone(this.compileConfig || {}),
        { refOverrides },
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

  async save (compiled = this.compiled) {
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

  async saveSchemaModuleMap ({ schemas, moduleBase, fileName = '_map' }: ISchemaModuleMapParams) {
    const moduleMap = createSchemaModuleMap({ schemas, moduleBase });

    const { directory } = this.saveConfig;

    if (!directory) {
      throw new Error('Cannot save the schemaModuleMap as no `save.directory` was specified');
    }

    const filePath = `${directory}/${fileName}.ts`;

    await writeFile(filePath, renderSchemaModuleMapToTs(moduleMap));
  }
}
