4.3.0
- #51 Fix bug when transforming empty bounding box

4.2.4
- #50 Fix knot piecewise beziers

4.2.3
- More accurate bounding boxes for arcs and ellipses (#48)

4.2.2
- Bump eslint-utils from 1.3.1 to 1.4.2
- Add HATCH to unsupported SVG entities in README

4.2.1
- Use main lodash package due to security issue(s)

4.2.0
- README updates

4.1.1
- #issue42 support entities that have extrusionZ === -1 defined on the entity itself (as opposed to the transform).

4.1.0
- CIRCLE DXF entities now produce native <circle /> SVG elements.
- ELLIPSE DXF entities now produce native <path d="A..."/> or <ellipse /> SVG elements.
- ARC DXF entities now produce native <path d="A..."/> or <ellipse /> SVG elements.

4.0.1
- Browser example uses Helper

4.0.0
- Use ES6 string interpolation in SVG generation.
- Use native SVG <circle /> elements for CIRCLE entities.
- Use SVG <g/> elements with a transform attribute for native and interpolated entities.
- Add a Helper object to simplify the workflow.
- The SVG output uses a root transform to flip the Y coordinates.

3.6.0
- NPM audit fixes.
- Remove support for Node v6 in Travis.
- Node engine is now >= 8.9.0.
