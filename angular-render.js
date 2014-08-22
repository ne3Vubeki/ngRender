/**
 * angular-render 1.0.1
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
                ngBind: '=?ngBind',
                ngBindHtml: '=?ngBindHtml',
                ngBindTemplate: '@?ngBindTemplate'
            },
            require: '^?ngInclude',
            controller: angular.noop,
            compile: function() {
                return {
                    pre: function(scope, element, attrs, ctrl) {

                        /**
                         * installer markers for HTML string
                         * @param str
                         * @returns {string}
                         */
                        function setMarkerStr(str) {
                            var node = document.createElement('div'),
                                nodes_include,
                                forEach = function() {
                                    for(var i = 0, node_length = node.children.length; i < node_length; i++) {
                                        if(node.children[i].childElementCount) {
                                            foreach(node.children[i]);
                                        } else {
                                            if (!node.children[i].hasAttribute('ng-render')) {
                                                node.children[i].setAttribute('ng-render', 'false');
                                            }
                                        }
                                    }
                                };

                            node.innerHTML = str;
                            // check ng-inclide directive in tenplate
                            nodes_include = node.querySelectorAll('[ng-include]').length ? node.querySelectorAll('[ng-include]') :
                                (node.getElementsByTagName('NG-INCLUDE').length ? node.getElementsByTagName('NG-INCLUDE') :
                                 node.getElementsByClassName('ng-include'));
                            if(nodes_include.length) {
                                // with ng-include
                                for(var i = 0, nodes_include_length = nodes_include.length; i < nodes_include_length; i++) {
                                    if (!nodes_include[i].hasAttribute('ng-render')) {
                                        nodes_include[i].setAttribute('ng-render', 'false');
                                    }
                                }
                            } else {
                                // without ng-include
                                forEach()
                            }

                            return node.innerHTML;
                        }

                        // if there is a ngView
                        if(attrs.ngView) {
                            $route.current.locals.$template = setMarkerStr($route.current.locals.$template);
                        }

                        // if is a ngInclude
                        if(attrs.ngInclude) {
                            if(typeof ctrl.template !== 'undefined') {
                                ctrl.template = setMarkerStr(ctrl.template);
                            }
                        }

                        // if there is a ng-render-inside attribute check subtree item
                        if(typeof attrs.ngRenderInside !== 'undefined') {
                            var img = element.find('img', 'iframe', 'frame', 'frameset', 'script', 'link', 'style');
                            if(img.length) {
                                angular.forEach(img, function(data) {
                                    var elem = angular.element(data);
                                    if(!elem.attr('ng-render')) {
                                        $compile(elem.attr('ng-render', 'false'))(scope);
                                    }
                                });
                            }
                        }

                    },
                    post: function(scope, element, attrs) {

                        var binding = '';

                        /**
                         * installer markers for HTML
                         * @param element
                         */
                        function setMarker() {

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
                                    $compile(element.attr('nr'))(scope);
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

                            // removes temporary attributes
                            if(attrs.ngRender === 'false') {
                                element.removeAttr('ng-render');
                            }

                        }

                        // for binding variables set listener ng-bind, ng-bind-html, ng-bind-template
                        if(scope.ngBind) {
                            binding = 'ngBind';
                        }
                        if(scope.ngBindHtml) {
                            binding = 'ngBindHtml';
                        }
                        if(scope.ngBindTemplate) {
                            binding = 'ngBindTemplate';
                        }
                        if(binding) {
                            scope.$watch(binding, function() {
                                setMarker();
                            });
                        } else {
                            setMarker();
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