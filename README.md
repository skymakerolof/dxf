[![Build Status](https://travis-ci.org/bjnortier/dxf.svg?branch=master)](https://travis-ci.org/bjnortier/dxf)

# dxf

DXF parser for node/browser.

Uses some ES6 features (classes, let, const, arrows). If you need to use this library in a browser without support for these features, you can use Webpack + Babel to package it.

V2.0 is a complete rewrite from the first attempt to write it in a SAX style, which wasn't really appropriate for a document with nested references (e.g inserts referencing blocks, nested inserts).

At this point in time, the important geometric entities are supported, but notably:

 * MTEXT
 * DIMENSION
 * STYLE

and some others are **parsed**, but are **not supported for SVG rendering** (see section below on SVG rendering)

## SVG

The initial aim of this library was to support rendering of the main geometric components, not dimensions, text, hatches and styles. There is a mechanism for converting the parsed entities to SVG, but they are **all converted to polylines**, and if you look at the resulting SVG files when running the functional tests, you will see that all entities are rendered as paths.

## tests

```$ gulp test```

will execute the unit tests and functional tests, which generate SVGs for reference DXF files. You can view these SVGs (located in test/functional/output) in a browser or other SVG viewer to see what is supported.

## Usage

Please refer to the functional tests in ```test/functional/``` to understand how this library can be used.
