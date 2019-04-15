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
