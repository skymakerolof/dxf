# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.7.0](https://github.com/skymakerolof/dxf/compare/v4.6.3...v4.7.0) (2022-09-22)


### Features

* add hatch entity to parser ([#107](https://github.com/skymakerolof/dxf/issues/107)) ([362e23a](https://github.com/skymakerolof/dxf/commit/362e23a2cc9e34ecfd1345d576a2138c375fcecb))
* add layout & paper space to parser ([#106](https://github.com/skymakerolof/dxf/issues/106)) ([d0a6d19](https://github.com/skymakerolof/dxf/commit/d0a6d19e34645aad208642105d381a76f97c5902))
* attrib & attdef parsing ([#109](https://github.com/skymakerolof/dxf/issues/109)) ([7a10e4b](https://github.com/skymakerolof/dxf/commit/7a10e4bd7a752a6adbd72f3a0b0e5e5ec7110f3d))
* viewport & vport parsing ([#108](https://github.com/skymakerolof/dxf/issues/108)) ([f26642e](https://github.com/skymakerolof/dxf/commit/f26642e8e338c4e85cbc1ab135e0c7f0f68029f6))


### Bug Fixes

* handle color value 256 ([#104](https://github.com/skymakerolof/dxf/issues/104)) ([80e9fa1](https://github.com/skymakerolof/dxf/commit/80e9fa119afaf5b3e5f4dcd73583c4a63b0876a8))

## 4.6.3

- Remove dependency on pretty-data (#85)

## 4.6.2

- Remove import of unused parts of lodash

## 4.4.4

- Fix typo in README

## 4.3.0

- #51 Fix bug when transforming empty bounding box

## 4.2.4

- #50 Fix knot piecewise beziers

## 4.2.3

- More accurate bounding boxes for arcs and ellipses (#48)

## 4.2.2

- Bump eslint-utils from 1.3.1 to 1.4.2
- Add HATCH to unsupported SVG entities in README

## 4.2.1

- Use main lodash package due to security issue(s)

## 4.2.0

- README updates

## 4.1.1

- #issue42 support entities that have extrusionZ === -1 defined on the entity itself (as opposed to the transform).

## 4.1.0

- CIRCLE DXF entities now produce native <circle /> SVG elements.
- ELLIPSE DXF entities now produce native <path d="A..."/> or <ellipse /> SVG elements.
- ARC DXF entities now produce native <path d="A..."/> or <ellipse /> SVG elements.

## 4.0.1

- Browser example uses Helper

## 4.0.0

- Use ES6 string interpolation in SVG generation.
- Use native SVG <circle /> elements for CIRCLE entities.
- Use SVG <g/> elements with a transform attribute for native and interpolated entities.
- Add a Helper object to simplify the workflow.
- The SVG output uses a root transform to flip the Y coordinates.

## 3.6.0

- NPM audit fixes.
- Remove support for Node v6 in Travis.
- Node engine is now >= 8.9.0.
