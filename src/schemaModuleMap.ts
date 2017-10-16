import { disclaimer } from './lib/schemaRenderers';

export interface ISchemaModuleMap {
  [k: string]: string;
}

export interface ISchemasInput {
  [k: string]: { id: string; };
}

/**
 * Create a [schema.id]: <modulePath> map file
 */
export function createSchemaModuleMap ({ schemas, moduleBase }: {
  /** JSON Schemas, with id's */
  schemas: ISchemasInput;

  /** The base for generated module paths, eg. "@mydomain/my-module/my-schema-folder" */
  moduleBase: string;
}): ISchemaModuleMap {
  const schemaModuleMap = Object.keys(schemas).reduce((obj: any, key) => {
    const id = schemas[key].id;

    if (id) {
      obj[id] = `${moduleBase}/${key}`;
    }

    return obj;
  }, {});

  return schemaModuleMap;
}

export function renderSchemaModuleMapToTs (map: ISchemaModuleMap) {
  return [
    disclaimer,
    '',
    `export default ${JSON.stringify(map, null, 2)};`,
    '',
  ].join('\n');
}
