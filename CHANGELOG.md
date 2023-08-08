# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [5.1.0](https://github.com/skymakerolof/dxf/compare/v5.0.1...v5.1.0) (2023-08-08)


### Features

* add support for polyfaceMesh outline rendering ([#138](https://github.com/skymakerolof/dxf/issues/138)) ([38fd3a6](https://github.com/skymakerolof/dxf/commit/38fd3a695644f1b142789d1d3e3828ee8a458d1f))


### Bug Fixes

* spline boundary path data ([#134](https://github.com/skymakerolof/dxf/issues/134)) ([4ea2312](https://github.com/skymakerolof/dxf/commit/4ea2312892ef73eed3690fc772ec0f2f8619beef))

### [5.0.1](https://github.com/skymakerolof/dxf/compare/v5.0.0...v5.0.1) (2023-06-08)


### Bug Fixes

* hatch with polyline points only returning y coordinate ([#132](https://github.com/skymakerolof/dxf/issues/132)) ([948dbbc](https://github.com/skymakerolof/dxf/commit/948dbbcd5e03ac064020b9c1d0b231dced895e7a)), closes [#130](https://github.com/skymakerolof/dxf/issues/130)

## [5.0.0](https://github.com/skymakerolof/dxf/compare/v4.7.0...v5.0.0) (2022-12-05)


### ⚠ BREAKING CHANGES

* **Hatch:** Renamed hatch split property points to controlPoints
* **Hatch:** Renamed polyline "has bulge flag" from bulge to hasBulge

### Features

* **Hatch:** rename hatch->spline points to controlPoints ([#117](https://github.com/skymakerolof/dxf/issues/117)) ([70e9a5d](https://github.com/skymakerolof/dxf/commit/70e9a5d46906f2f1984366df24adf80fd97c454b))
* LTYPE table parsing ([#121](https://github.com/skymakerolof/dxf/issues/121)) ([6178746](https://github.com/skymakerolof/dxf/commit/6178746ee887eb1fbacb060cfc952d07d5264173))


### Bug Fixes

* **Hatch:** bulge value for each point instead of only writing it in the loop level ([#122](https://github.com/skymakerolof/dxf/issues/122)) ([879808c](https://github.com/skymakerolof/dxf/commit/879808cde1d369b36c731b85ac4596f7ed032efe))
* **Hatch:** rename bulge to hasBulge ([#118](https://github.com/skymakerolof/dxf/issues/118)) ([3cf60c6](https://github.com/skymakerolof/dxf/commit/3cf60c6a1f5cc1711a315222a87a75fc5677041a))

## [4.7.0](https://github.com/skymakerolof/dxf/compare/v4.6.3...v4.7.0) (2022-09-22)

### Features

- add hatch entity to parser ([#107](https://github.com/skymakerolof/dxf/issues/107)) ([362e23a](https://github.com/skymakerolof/dxf/commit/362e23a2cc9e34ecfd1345d576a2138c375fcecb))
- add layout & paper space to parser ([#106](https://github.com/skymakerolof/dxf/issues/106)) ([d0a6d19](https://github.com/skymakerolof/dxf/commit/d0a6d19e34645aad208642105d381a76f97c5902))
- attrib & attdef parsing ([#109](https://github.com/skymakerolof/dxf/issues/109)) ([7a10e4b](https://github.com/skymakerolof/dxf/commit/7a10e4bd7a752a6adbd72f3a0b0e5e5ec7110f3d))
- viewport & vport parsing ([#108](https://github.com/skymakerolof/dxf/issues/108)) ([f26642e](https://github.com/skymakerolof/dxf/commit/f26642e8e338c4e85cbc1ab135e0c7f0f68029f6))

### Bug Fixes

- handle color value 256 ([#104](https://github.com/skymakerolof/dxf/issues/104)) ([80e9fa1](https://github.com/skymakerolof/dxf/commit/80e9fa119afaf5b3e5f4dcd73583c4a63b0876a8))

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
