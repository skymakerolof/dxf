[![Build Status](https://travis-ci.org/bjnortier/dxf.svg?branch=master)](https://travis-ci.org/bjnortier/dxf)

# dxf

DXF parser for node/browser.

Uses several ES6 features in the source code (import, classes, let, const, arrows) but is packaged using babel so you can use it in legacy JS environments.

Version 2.0 is a complete rewrite from the first attempt to write it in a SAX style, which wasn't really appropriate for a document with nested references (e.g inserts referencing blocks, nested inserts).

Version 3.0 converted the codebase to use [standard JS](https://standardjs.com), ES6 imports, stopped using Gulp, and updated & removed some dependencies.

Version 4.x is in progress and the aim is to use native SVG elements where possible, e.g. `<circle />`, `<ellipse />` etc. 4.0 introduces the `<circle />` element.

At this point in time, the important geometric entities are supported, but notably:

- MTEXT
- DIMENSION
- STYLE
- HATCH

and some others are **parsed**, but are **not supported for SVG rendering** (see section below on SVG rendering)

## Getting started

There is an ES5 and ES6 example in the `examples/` directory that show how to use the library. There are exposed functions for advanced users, but for the majority of users you can use the `Helper` object to get the data you're interested in (or convert to SVG):

```
const helper = new Helper(<DXF String>)

// The 1-to-1 object representation of the DXF
console.log('parsed:', helper.parsed)

// Denormalised blocks inserted with transforms applied
console.log('denormalised:', helper.denormalised)

// Create an SVG
console.log('svg:', helper.toSVG())

// Create polylines (e.g. to render in WebGL)
console.log('polylines:', helper.toPolylines())
```

## Running the Examples

Node ES5. Will write an SVG to `examples/example.es5.svg`:

```
$ node examples/example.es5.js
```

Node ES6. Will write an SVG to `examples/example.es6.svg`:

```
$ npx babel-node examples/example.es6.js
```

Browser. Compile to a browser bundle and open the example webpage:

```
$ npm run compile
$ open examples/dxf.html
```

## SVG

Geometric elements are supported, but dimensions, text, hatches and styles (except for line colors) are **_not_**.

Native SVG elements are used as far as possible for curved entities (`<circle />`, `<ellipse/>` etc.), **_except for the SPLINE entity_**, which is interpolated.

Here's an example you will find in the functional test output:

![svg example image](https://cloud.githubusercontent.com/assets/57994/17583566/e00f5d78-5fb1-11e6-9030-55686f980e6f.png)

## Interpolation

The library supports outputting DXFs as interpolated polylines for custom rendering (e.g. WebGL) or other applications, by using:

```
> helper.toPolylines()
```

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

`$ npm test`

will execute the unit tests.

`$ npm run test:functional` will run the functional tests in a browser. Please open `toSVG.html` when the file listing loads in the browser (or open `http://localhost:8030/toSVG.html#/`).

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
- Eric Mansfield https://github.com/ericman314
- Kristofer https://github.com/kriffe
