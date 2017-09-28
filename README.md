# Schema Tools

Exports tools to make converting TypeScript interfaces into JSON-Schema trivial.

#### Reference:
- Typescript to JSON Schema Builder: [:blue_book: TypeSchemaBuilder.d.ts](build/typeToSchema.d.ts)
- Typescript to JSON Schema: [:blue_book: typeToSchema.d.ts](build/typeToSchema.d.ts)

## The builder

### Single seperate schemas

```ts
import { TypeSchemaBuilder } from '@temando/schema-tools';

(async () => {
  await new TypeSchemaBuilder({
    compile: {
      fromFiles: [join(__dirname, '../src/types.ts')],
      dereference: false // on by default
    },
    save: {
      asDefaultExport: true,
      directory: join(__dirname, '../src/schemas'),
      format: 'ts',
    },
  })
    .add({
      compile: {
        types: [{ type: 'ITest' }],
      },
      save: { name: 'MyFancySchema' },
    })
    .add({
      compile: {
        types: [{ type: 'ITest2' }],
      },
      save: { name: 'MyFancySchema2' },
    })
    .compileAndSave();
})();
```

The above will have produced these files:
- `./src/schemas/MyFancySchema.ts`
- `./src/schemas/MyFancySchema2.ts`

Because we specified `asDefaultExports` as `true`, these files will look like:

```ts
/** @type ITest */
export default {
  "$schema": "http://json-schema.org/draft-04/schema#"
  /** ... */
}
```

### Many combined schemas


```ts
import { TypeSchemaBuilder } from '@temando/schema-tools';

(async () => {
  await new TypeSchemaBuilder({
    compile: {
      fromFiles: [join(__dirname, '../src/types.ts')],
    },
    save: {
      asDefaultExport: false,
      directory: join(__dirname, '../src/schemas'),
      format: 'ts',
    },
  })
    .add({
      compile: {
        types: [
          { name: 'myTest1', type: 'ITest' },
          { name: 'myTest4', type: 'ITest4' },
        ],
      },
      save: { name: 'schemaFile1' },
    })
    .compileAndSave();
})();
```

The above will produce one file like so:

```ts
/** @type ITest */
export const myTest1 = {
  "$schema": "http://json-schema.org/draft-04/schema#"
  /** ... */
};

/** @type ITest4 */
export const myTest4 = {
  "$schema": "http://json-schema.org/draft-04/schema#"
  /** ... */
};
```

### Partial usage

```ts
(async () => {
  const builder = new TypeSchemaBuilder({
    compile: {
      fromFiles: [join(__dirname, '../src/types.ts')],
    },
    save: {
      asDefaultExport: true,
      directory: join(__dirname, '../src/schemas'),
      format: 'ts',
    },
  })
    .add({
      compile: {
        types: [{ type: 'ITest' }],
      },
      save: { name: 'MyFancySchema' },
    })
    .add({
      compile: {
        types: [{ type: 'ITest2' }],
      },
      save: { name: 'MyFancySchema2' },
    })

  const compiled = await builder.compile();

  console.log(builder.compiled)
  console.log(compiled) // the same as above

  // ...Now you can mutate on the compiled schemas...

  // Saves the builder.compiled
  await builder.save()
  await builder.save(compiled) // same as above
})()
```

Above we are seperating the steps, but you could simply choose not to ever run `.save()`
and instead use the generated schemas to cobble your own schemas together.
