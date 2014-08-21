/**
 * angular-render 1.0.0
 * https://github.com/ne3Vubeki/ngRender
 * @author Vitaly Maltsev
 * @license MIT License http://opensource.org/licenses/MIT
 */

'use strict';

(function(angular) {

    var _itemsLength = 0;

    angular.module('ngRender', [])

    .directive('ngRender', [
        '$compile',
        '$route',
        '$templateCache',
        function($compile, $route, $templateCache) {
        return {
            restrict: 'A',
            scope: {
                rendering: '&?ngRender',
                binding: '=?ngBind',
                include: '=?ngInclude'
            },
            require: '^?ngInclude',
            controller: angular.noop,
            compile: function() {
                return {
                    pre: function(scope, element, attrs, ctrl) {

                        function setMarkerStr(str) {
                            var node = document.createElement('div'),
                                nodes_include,
                                forEach = function() {
                                    for(var i = 0, nodeLength = node.children.length; i < nodeLength; i++) {
                                        if(node.children[i].childElementCount) {
                                            foreach(node.children[i]);
                                        } else {
                                            if (!node.children[i].hasAttribute('ng-render')) {
                                                node.children[i].setAttribute('ng-render', '');
                                            }
                                        }
                                    }
                                };
                            node.innerHTML = str;
                            nodes_include = node.getElementsByTagName('NG-INCLUDE') || node.getAttributeNode('ng-include') || node.getElementsByClassName('ng-include');
                            if(nodes_include.length) {
                                for(var i in nodes_include) {
                                    if(nodes_include[i].hasOwnProperty(i)) {
                                        if (!nodes_include[i].hasAttribute('ng-render')) {
                                            nodes_include[i].setAttribute('ng-render', '');
                                        }
                                    }
                                }
                            } else {
                                forEach()
                            }
                            return node.innerHTML;
                        }

                        // if there is a ngView
                        if(typeof attrs.ngView !== 'undefined') {
                            $route.current.locals.$template = setMarkerStr($route.current.locals.$template);
                        }

                        if(scope.include) {
                            if(typeof ctrl.template !== 'undefined') {
                                ctrl.template = setMarkerStr(ctrl.template);

/*
                                dom = angular.element(ctrl.template);
                                dom = angular.forEach(dom, function(elem) {
                                    if (elem.outerHTML) {
                                        if( elem.hasAttribute('ng-include') ||
                                            elem.nodeName ==='NG-INCLUDE' ||
                                            elem.className.search('ng-include') > 0) {

                                            if (!elem.hasAttribute('ng-render')) {
                                                elem.setAttribute('ng-render', '');
                                            }

                                        }
                                    }
                                });
                                ctrl.template = dom.parent()[0].innerHTML;
*/

                            }
                        }

                        // if there is a ng-render-inside attribute check subtree item
                        if(typeof attrs.ngRenderInside !== 'undefined') {
                            var img = element.find('img', 'iframe', 'frame', 'frameset', 'script', 'link', 'style');
                            if(img.length) {
                                angular.forEach(img, function(data) {
                                    var elem = angular.element(data);
                                    if(!elem.attr('ng-render')) {
                                        $compile(elem.attr('ng-render', ''))(scope);
                                    }
                                });
                            }
                        }

                    },
                    post: function(scope, element, attrs) {

                        /**
                         * installer markers
                         * @param element
                         */
                        function setMarker(element) {

                            var img = '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" nr="false">',
                                tag = element[0].tagName;
                            switch (tag) {
                                // elements with event onload
                                case 'IMG':
                                case 'LINK':
                                case 'SCRIPT':
                                case 'STYLE':
                                case 'FRAME':
                                case 'FRAMESET':
                                case 'IFRAME':
                                    $compile(element.attr('nr', element.attr('ng-render')).removeAttr('ng-render'))(scope);
                                    break;

                                // consisting of a single element
                                case 'AREA':
                                case 'BASE':
                                case 'COL':
                                case 'COMMAND':
                                case 'PARAM':
                                case 'SOURCE':
                                case 'TRACK':
                                case 'META':
                                case 'WBR':
                                case 'HR':
                                case 'BR':
                                case 'INPUT':
                                case 'TEXTAREA':
                                    element.after($compile(img)(scope));
                                    break;

                                // other elements
                                default:
                                    element.append($compile(img)(scope));
                                    break;
                            }

                        }

                        // for binding variables set listener ng-bind
                        if('binding' in scope) {
                            scope.$watch('binding', function() {
                                setMarker(element);
                            });
                        } else {
                            setMarker(element);
                        }

                    }
                }
            }
        }
    }])

    .directive('nr', [
        '$timeout',
        function($timeout) {
        return {
            require:'^?ngRender',
            restrict: 'A',
            link: function(scope, element, attrs) {
                _itemsLength += 1;
                element.on('load', function() {
                    if(attrs.nr === 'false') {
                        this.parentNode.removeChild(this);
                    } else {
                        this.removeAttribute('nr');
                    }
                    $timeout( function() {
                        _itemsLength -= 1;
                        if('rendering' in scope) {
                            scope.rendering();
                        }
                        if(!_itemsLength) {
                            scope.$emit('$nodesDOMRendered');
                        }
                    }, 100);
                });
            }
        }
    }]);

})(angular);