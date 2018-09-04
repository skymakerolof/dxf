[![Build Status](https://travis-ci.org/bjnortier/dxf.svg?branch=master)](https://travis-ci.org/bjnortier/dxf)

# dxf

DXF parser for node/browser.

Uses several ES6 features in the source code (import, classes, let, const, arrows) but is packaged using babel so you can use it legacy JS environments.

Version 2.0 is a complete rewrite from the first attempt to write it in a SAX style, which wasn't really appropriate for a document with nested references (e.g inserts referencing blocks, nested inserts).

Version 3.0 converted the codebase to use [standard JS](https://standardjs.com), ES6 imports, stop using Gulp, and updated & removed some dependencies.

At this point in time, the important geometric entities are supported, but notably:

 * MTEXT
 * DIMENSION
 * STYLE

and some others are **parsed**, but are **not supported for SVG rendering** (see section below on SVG rendering)

## Getting started

There is an ES5 and ES6 example in the ```examples/``` directory that show how to use the library, but there are 3 basic steps:

1. Parse the DXF contents using ```dxf.parseString(<contents>)```. This will return an object representation of the DXF contents.
1. Denormalise the entities into an array using ```dxf.denormalize(<parsed>)```. After Step 1, the entities are still in the block hierarchy of the DXF file, denormalizing will create the *resulting* entities with the block transforms applied.
1. (Optional) Create an SVG using ```dxf.toSVG(<parsed>, <options>)```. Please refer to the SVG section below regarding limitations. Options supported are ```interpolationsPerSplineSegment```, with default = 25, e.g. ```dxf.toSVG(<parsed>, {interpolationsPerSplineSegment: 10})```

## Running the Examples

Node ES5:
`$ node examples/example.es5.js`

Node ES6:
`$ babel-node examples/example.es6.js`

Browser:
`$ open examples/dxf.html`

## SVG

The initial aim of this library was to support rendering of the main geometric components, not dimensions, text, hatches and styles. There is a mechanism for converting the parsed entities to SVG, but they are **all converted to polylines**, and if you look at the resulting SVG files when running the functional tests, you will see that all entities are rendered as paths.

Here's an example you will find in the functional test output:

![svg example image](https://cloud.githubusercontent.com/assets/57994/17583566/e00f5d78-5fb1-11e6-9030-55686f980e6f.png)

## Command line

There is a command-line utility (courtesy of [@Joge97](https://github.com/Joge97)) for converting DXF files to SVG:

```
$ npm i -g dxf
$ dxf-to-svg

  Usage: dxf-to-svg [options] <dxfFile> [svgFile]

  Converts a dxf file to a svg file.

  Options:

    -V, --version  output the version number
    -v --verbose   Verbose output
    -h, --help     output usage information
```

## Tests

Running

```$ npm test```

will execute the unit tests and functional tests, which generate SVGs for reference DXF files. You can view these SVGs (located in test/functional/output) in a browser or other SVG viewer to see what is supported.

### Contributors

- Liam Mitchell https://github.com/LiamKarlMitchell
- Artur Zochniak https://github.com/arjamizo
- Andy Werner https://github.com/Gallore
- Ivan Baktsheev https://github.com/apla
- Jeff Chen https://github.com/jeffontheground
- Markko Paas https://github.com/markkopaas
- Kim Lokøy https://github.com/klokoy
- Erik Söhnel https://github.com/hoeck
- Teja https://github.com/hungerpirat
- Jakob Pallhuber https://github.com/Joge97
