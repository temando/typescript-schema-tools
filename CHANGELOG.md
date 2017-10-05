# Changelog

The format: [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)

## [Unreleased]

- Remove console logs

## [2.6.0][] - 2017-10-05

- `$ref` can now be globally and automatically replaced when using `TypeSchemaBuilder`

## [2.5.0][] - 2017-10-05

- Change the `compile` interface, rename `refs` to `overrideRefs`
- Add `replaceRefs` option, to use `id` when defining types to blanket-replace with a `$ref` in generated schemas

## [2.4.0][] - 2017-10-05

- Fix publish

## [2.3.0][] - 2017-10-05

- Now supports `refs` inside a `compile` block
  - This allows one to override any `type` to resolve to `{ $ref: id }`

## [2.3.0][] - 2017-10-03

- Update `.addType` to support `id`

## [2.2.0][] - 2017-10-02

- Added `#addType` to `TypeSchemaBuilder`
- `TypeSchemaBuilder` now re-uses the ts `Program` for performance

## [2.1.2][] - 2017-09-28

- Tweaks

## [2.1.1][] - 2017-09-28

- Fix interfaces

## [2.1.0][] - 2017-09-28

- Fixes to interfaces conserning compile `types` input
- Readme updates

## [2.0.0][] - 2017-09-28

- Modified typeToSchema interface
- Added TypeSchemaBuilder

## [1.1.0][] - 2017-09-26

- Misc changes

## [1.0.0][] - 2017-09-26

### Changed

- Rename `typeToSchema` to `typesToSchema`
- Fix dependency for typescript-json-schema being a --dev


[Unreleased]: https://src.temando.io/sam.johnson/schema-tools/compare/v2.6.0...HEAD
[2.6.0]: https://src.temando.io/sam.johnson/schema-tools/compare/v2.5.0...v2.6.0
[2.5.0]: https://src.temando.io/sam.johnson/schema-tools/compare/v2.4.0...v2.5.0
[2.4.0]: https://src.temando.io/sam.johnson/schema-tools/compare/v2.3.0...v2.4.0
[2.3.0]: https://src.temando.io/sam.johnson/schema-tools/compare/v2.3.0...v2.3.0
[2.3.0]: https://src.temando.io/sam.johnson/schema-tools/compare/v2.2.0...v2.3.0
[2.2.0]: https://src.temando.io/sam.johnson/schema-tools/compare/v2.1.2...v2.2.0
[2.1.2]: https://src.temando.io/sam.johnson/schema-tools/compare/v2.1.2...v2.1.2
[2.1.2]: https://src.temando.io/sam.johnson/schema-tools/compare/v2.1.1...v2.1.2
[2.1.1]: https://src.temando.io/sam.johnson/schema-tools/compare/v2.1.0...v2.1.1
[2.1.0]: https://src.temando.io/sam.johnson/schema-tools/compare/v2.0.0...v2.1.0
[2.0.0]: https://src.temando.io/sam.johnson/schema-tools/compare/v1.1.0...v2.0.0
[1.1.0]: https://src.temando.io/sam.johnson/schema-tools/compare/v1.0.0...v1.1.0
[1.0.0]: https://src.temando.io/sam.johnson/schema-tools/tree/v1.0.0
