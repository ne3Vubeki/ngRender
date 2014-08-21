ngRender
=======

Angular ngRender directive


## Installing

You can install the library via [Bower](http://bower.io/):

```sh
bower install angular-render --save
```

Add a `<script>` to your html:

```html
<script src="bower_components/angular-render/angular-render.js"></script>
```

## Usage

```js
// add 'ngRender' as dependency to your module
var yourModule = angular.module("yourModule", ['ngRender']);
```

You can add the `ng-render` directive in tags:
```html
<div ng-render></div>
<div ng-render="someFunction()">...</div>
````

Added attribute `ng-render-inside` for check elements inside subtree node:
```html
<div ng-render ng-render-inside>...</div>
````

## Event

### $nodesDOMRendered

Emitted every time the element(node) is rendered.

## Overview

This library defines the event closure rendering element. Inserted into the cell in the form of attribute `ng-render`. 
For `ng-view` library bypasses the whole subtree and sets the time attributes that are finished `ng-render` deleted. 
For `ng-include` library can set markers on all invested in this item `ng-include`. 
For `ng-repeat` library sets the markers on the whole subtree. 