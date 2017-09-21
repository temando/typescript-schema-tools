
export const disclaimer = [
  '/** WARNING: Generated by @temando/schema-tools */',
  '/* tslint:disable */',
].join('\n');

export const renderSchemasToTs = (schemas, { asDefaultExport = false } = {}) => {
  if (asDefaultExport) { schemas = [schemas[0]]; }

  return [
    disclaimer,
    ...schemas.map(({ key, type, schema }) =>
      [
        ``,
        `/** @type ${type} */`,
        `export ${asDefaultExport ? 'default' : `const ${key} =`} ${JSON.stringify(schema, null, 2)};`,
      ].join('\n'),
    ),
    '',
  ].join('\n');
};

export type IGetImportPath = (name: string) => string;

export const renderExportsToTs = (names: string[], getImportPath: IGetImportPath) => {
  const imports = names.map((name) => `import * as ${name} from '${getImportPath(name)}';`);

  return [
    disclaimer,
    ...imports,
    '',
    `export {`,
    ...names.map((str) => `  ${str},`),
    `}`,
    '',
  ].join('\n');
};

export const renderSchemasToJson = (schemas) => {
  return JSON.stringify(schemas);
};
