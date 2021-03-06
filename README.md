# @ffz/joi-to-schema

[![NPM Version](https://img.shields.io/npm/v/@ffz/joi-to-schema.svg?style=flat)](https://npmjs.org/package/@ffz/joi-to-schema)
![Node Version](https://img.shields.io/node/v/@ffz/joi-to-schema.svg?style=flat)
[![Dependency Status](https://img.shields.io/circleci/project/github/FrankerFaceZ/joi-to-schema.svg?style=flat)](https://circleci.com/gh/frankerfacez/joi-to-schema)
[![Build Status](https://img.shields.io/david/frankerfacez/joi-to-schema.svg?style=flat)](https://david-dm.org/frankerfacez/joi-to-schema)
[![Test Coverage](https://coveralls.io/repos/github/FrankerFaceZ/joi-to-schema/badge.svg?branch=master)](https://coveralls.io/github/FrankerFaceZ/joi-to-schema?branch=master)

Convert Joi Schema into JSON Schema. This was written after examining a few
other libraries that do this and being dissatisfied with how they're written or how
they behave. This library:

-   Throws errors when it doesn't support something. Validation should never
    do anything silently.
-   Uses `Joi.describe()` rather than digging into Joi's internals to discover
    the layout of the Joi schema.
-   Supports `Joi.alternatives().try()`
-   Supports ordered items and alternative items for `Joi.array()`
-   In general, supports everything that's reasonable *to* support.

This library does not support:

-   `Joi.alternatives().when()`
    It's theoretically possible to support `when()` but the code complexity and
    my lack of any use-cases for it made me shy away for now.

* * *

## Install

```bash
$ npm install @ffz/joi-to-schema --save
```

## Documentation

* [API Documentation](https://frankerfacez.github.io/joi-to-schema/)

## Basic Usage

```javascript
import Converter from '@ffz/joi-to-schema';
import Joi from 'joi';

const converter = new Converter();

converter.convert(Joi.object({
    id: Joi.number().integer().positive().required(),
    name: Joi.string(),
    email: Joi.string().email().required(),
    avatar: Joi.string().allow(null),
    verified: Joi.boolean().default(false)
}))
```

## Schema Extraction

This library supports extracting sub-trees from converted schematics and storing
them in a central location. To enable this behavior, you need to pass an option
to the `Converter` to allow extraction.

```javascript
const converter = new Converter({
    extract: true
});
```

Then, you attach `extract` metadata to the part of your schema that you would like
to extract. This will result in that sub-tree of the output being extracted and stored in `converter.schemas` while a reference will be saved into the generated schema.

```javascript
const converter = new Converter({
    extract: true,
    extractPath: '/components/schemas/'
})

converter.convert(Joi.object({
    height: Joi.number().integer().positive().required(),
    width: Joi.number().integer().positive().required(),
    urls: Joi.object({
        '1x': Joi.string().uri().required(),
        '2x': Joi.string().uri(),
        '4x': Joi.string().uri()
    }).required()
}).meta({
    extract: 'HighDPIImage'
}));

// {
//     '$ref': '#/components/schemas/HighDPIImage
// }


converter.schemas

// {
//     components: {
//         schemas: {
//             HighDPIImage: {
//                 ...
//             }
//         }
//     }
// }
```

## Tests

Run tests using `npm test`.

## Contributions and Support

Please submit all issues and pull requests to the [FrankerFaceZ/joi-to-schema](https://github.com/frankerfacez/joi-to-schema) repository.
