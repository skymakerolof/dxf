# dxf

DXF parser for node/browser. Not complete at this point but lines, circles and lwpolylines are supported.

## Architecture

Parsing DXF is in fact very simple, since `dxf` files are expressed in plain text.
What this parser do is only it iterates in appropriate manner through whole dxf file and whenever it encounters interesting data (every entry in `dxf` format has its, let's say class - you can observe existance of `dxf`'s classes in _e.g._ `case 30`s sections in parsers implementations like `circle.js`)

## Running

Look at ```example.js``` in the ```examples/``` directory for an example:

    examples$ node example.js

## Developing your own types

In order to develop your own types you might follow this procedure:

* create simple `.dxf` file using LibreCad
* add some lines, points (or _whatever_) using **LibreCad**
* create new parser in similar manner like `circle.js` is
* look at some examples in `test/entities.js`, then create new entries in `bdd unit-testing syntax` (`describe` and `it`) **note that your parsers have to be declared in `lib/index.js` (just follow _like a monkey_ the pattern with `circles` and other types)**
* install appropriate tools with following commands:
    * Ubuntu: 
	```
	which nodejs npm || sudo apt-get install nodejs npm            # install nodejs npm is does not exist in the system
	sudo npm install -g mocha grunt                                # install *globally* mocha and grunt
	ls lib/handlers && npm install || echo cd to dxf project first # this installs packages required by this `dxf` parser listed in `package.json`
                                                                   # this line is only for easier copy&paste
	```
	**Tip:** on Linux, it is better to have `gruntfile.js` named `Gruntfile.js`: 
	```
	mv gruntfile.js Gruntfile.js
	```

     * Windows:

        download nodejs manually from [official website](http://nodejs.org/download/)  
and then run npm install twice (first with `mocha` and `grunt`, second time for downloading dependencies)

- run either: `mocha test/*` OR `grunt watch` (`grunt watch --gruntfile gruntflie.js`)
    - the advantage of `grunt watch` is that whenever you will modify any of project files **the project will be automatically executed**
    - but you can also execute `mocha` manually every time

## Tools

- `npm` is package manager which allows downloading more packages for `nodejs`
- `mocha` is testing framework (this tool allows you veryfing that every parser works as expected for various `.dxf`)
- `grunt` is tool allowing you, in between, making building process less effort-consuming (e.g. when file is changed, it automatically re-executes processes)
