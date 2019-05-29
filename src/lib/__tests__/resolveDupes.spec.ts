import { resolveDupes } from '../resolveDupes';

const dupedSchema = {
  type: 'object',
  properties: {
    a: {
      type: 'string',
      enum: ['a', 'b', 'c'],
    },
    b: { type: 'string' },
    c: {
      type: 'string',
      enum: ['a', 'b', 'c'],
    },
  },
  required: ['a'],
};

const rootSchemas = [
  {
    type: 'string',
    enum: ['a', 'b', 'c'],
    definitions: {},
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'wew',
  },
];

it('resolves dupes in a schema to a root', () => {
  const deDuped = resolveDupes([dupedSchema, ...rootSchemas]);

  expect(deDuped).toMatchSnapshot();
});
