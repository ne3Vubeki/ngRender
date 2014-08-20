ngRender
=======

Angular ngRender directive


### Installing

Install via `bower`

```sh
bower install angular-render --save
```

Add a `<script>` to your html

```html
<script src="bower_components/angular-render/angular-render.js"></script>
```

### Usage

```js
// add 'ngRender' as dependency to your module
var yourModule = angular.module("yourModule", ['ngRender']);
```

You can add the `ng-render` directive in tags
```html
<div ng-render></div>
<div ng-render="someFunction()">...</div>
````