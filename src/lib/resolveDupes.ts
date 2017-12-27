import { ITjsSchema } from '../';

// TODO: this may not be feasable
export function resolveDupes (schemas: ITjsSchema[]) {
  const isDupeSchema = (target, root) => {
    const hasId = target.id || target.$id;
    const hasSchema = target.$schema;
    const isRootSchema = hasId || hasSchema;

    if (isRootSchema) { return false; }

    const minRoot = { ...root };

    delete minRoot.$schema;
    delete minRoot.id;
    delete minRoot.$id;
    delete minRoot.definitions;

    return JSON.stringify(target) === JSON.stringify(minRoot);
  };

  const recurse = (obj) => {
    if (obj) {}
  };

  return schemas.map((schema) => {
    for (const nextSchema of schemas) {

    }
  });
}
