export interface ISchemaShape {
  $id?: string;
  id?: string;
  definitions?: { [k: string]: ISchemaShape };
  $schema?: string;
  type?: string;
  $ref?: string;
  properties?: { [k: string]: ISchemaShape };
  [k: string]: any;
}

const isRootSchema = (schema: ISchemaShape) => Boolean(schema.id || schema.$id);

const simplifySchema = (schema: ISchemaShape) => {
  const cleaned: ISchemaShape = { ...schema };
  delete cleaned.$schema;
  delete cleaned.id;
  delete cleaned.$id;
  delete cleaned.definitions;

  return cleaned;
};

const isSchemaADupe = (target: ISchemaShape, subject: ISchemaShape): boolean => {
  if (target === subject) { return false; }

  if (isRootSchema(target) || !isRootSchema(subject)) { return false; }

  const simpleSubject = simplifySchema(subject);

  const targetStr = JSON.stringify(target);
  const subjectStr = JSON.stringify(simpleSubject);

  const anyIsEmptyObject = targetStr === '{}';

  return !anyIsEmptyObject && targetStr === subjectStr;
};

const findDupeSchema = (target: ISchemaShape, schemas: ISchemaShape[]): ISchemaShape|undefined => {
  for (const schema of schemas) {
    if (isSchemaADupe(target, schema)) {
      return schema;
    }
  }
};

export function resolveDupes (schemas: ISchemaShape[]) {
  let rootSchemas = schemas.filter(isRootSchema);

  const recursivelyReplaceDupes = (obj: ISchemaShape): ISchemaShape => {
    if (obj && obj instanceof Object) {
      const schemaRoot = findDupeSchema(obj, schemas);

      if (schemaRoot) {
        return { $ref: schemaRoot.$id || schemaRoot.id };
      } else {
        obj = obj instanceof Array ? [...obj] : { ...obj };

        Object.keys(obj).forEach((key) => {
          obj[key] = recursivelyReplaceDupes(obj[key]);
        });
      }
    }

    return obj;
  };

  rootSchemas = rootSchemas.map(recursivelyReplaceDupes);
  const newSchemas = schemas.map(recursivelyReplaceDupes);

  return newSchemas;
}
