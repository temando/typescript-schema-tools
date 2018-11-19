// @public
export function createSchemaModuleMap({schemas, moduleBase}: {
    schemas: ISchemasInput;
    moduleBase: string;
}): ISchemaModuleMap;

// @public (undocumented)
export function createTypeToSchemaGenerator(config: ITypesToSchemasConfig): JsonSchemaGenerator;

// @public (undocumented)
export function extractRefsFromConfig({refOverrides, replaceWithRefs, types}: ITypesToSchemasConfig): {
    type: string;
    $ref: string;
}[];

// @public (undocumented)
export function getTsProgram(fromFiles: string[] | IProgram): IProgram;

// @public (undocumented)
interface IBuilderSchemaConfig {
  // (undocumented)
  compile?: Partial<ITypesToSchemasConfig>;
  // (undocumented)
  save?: Partial<ISaveSchemasConfig>;
}

// @public (undocumented)
interface IProgram {
  // (undocumented)
  [key: string]: any;
}

// @public (undocumented)
interface ISaveSchemasConfig {
  asDefaultExport: boolean;
  directory: string;
  format: 'ts' | 'json';
  name: string;
  // (undocumented)
  schemas: ITjsSchema[];
}

// @public (undocumented)
interface ISchemaModuleMap {
  // (undocumented)
  [k: string]: string;
}

// @public (undocumented)
interface ISchemaModuleMapParams {
  // (undocumented)
  fileName: string;
  // (undocumented)
  moduleBase: string;
  // (undocumented)
  schemas: ISchemasInput;
}

// @public (undocumented)
interface ISchemasInput {
  // (undocumented)
  __index: {
    id: string;
  }
}

// @public (undocumented)
interface ITjsSchema {
  // (undocumented)
  name?: string;
  // (undocumented)
  schema: any;
  // (undocumented)
  type: string;
}

// @public (undocumented)
interface ITypeMap {
  id?: string;
  name?: string;
  optional?: boolean;
  type: string;
}

// @public (undocumented)
interface ITypesToSchemasConfig {
  // (undocumented)
  dereference?: boolean;
  fromFiles: string[] | IProgram;
  // (undocumented)
  generator?: JsonSchemaGenerator;
  options?: Partial<Args>;
  refOverrides?: {
    [key: string]: string;
  }
  replaceWithRefs?: boolean;
  types: ITypeMap[];
}

// @public (undocumented)
export function removeUnusedJsonSchemaDefinitions(schema: any): any;

// @public (undocumented)
export function renderSchemaModuleMapToTs(map: ISchemaModuleMap): string;

// @public
export function saveExports({exports, directory, name, getImportPath, getImportPattern}: {
    exports: string[];
    getImportPath: IGetImportPath;
    getImportPattern?: IGetImportPath;
    directory: string;
    name: string;
}): Promise<void>;

// @public
export function saveSchemas({schemas, directory, name, format, asDefaultExport}: ISaveSchemasConfig): Promise<void>;

// @public
class TypeSchemaBuilder {
  constructor({save, compile, reuseProgram, replaceWithRefs, emitErrors, deDupe}: {
          save?: Partial<ISaveSchemasConfig>;
          compile?: Partial<ITypesToSchemasConfig>;
          reuseProgram?: boolean;
          replaceWithRefs?: boolean;
          emitErrors?: boolean;
          deDupe?: boolean;
      });
  add(configs: IBuilderSchemaConfig | IBuilderSchemaConfig[]): this;
  addType(configs: ITypeMapBuilderConfig | ITypeMapBuilderConfig[]): this;
  // (undocumented)
  compile(): Promise<{
          schemas: ITjsSchema[];
          config: IBuilderSchemaConfig;
          errors?: Error[] | undefined;
      }[]>;
  // (undocumented)
  compileAndSave(): Promise<this>;
  // (undocumented)
  compiled: Array<{
          schemas: ITjsSchema[];
          config: IBuilderSchemaConfig;
          errors?: Error[];
      }>;
  // (undocumented)
  save(compiled?: {
          schemas: ITjsSchema[];
          config: IBuilderSchemaConfig;
          errors?: Error[] | undefined;
      }[]): Promise<void>;
  // (undocumented)
  saveSchemaModuleMap({schemas, moduleBase, fileName}: ISchemaModuleMapParams): Promise<void>;
}

// @public
export function typesToSchemas(config: ITypesToSchemasConfig): Promise<{
    errors?: Error[];
    schemas: ITjsSchema[];
}>;

// WARNING: Unsupported export: defaultOptions
// WARNING: Unsupported export: ITypeMapBuilderConfig
// (No @packagedocumentation comment for this package)
