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
        function($compile, $route) {
        return {
            restrict: 'A',
            scope: {
                rendering: '&?ngRender',
                binding: '=?ngBind'
            },
            compile: function() {
                return {
                    pre: function(scope, element, attrs) {

                        // if there is a ngView
                        if(typeof attrs.ngView !== 'undefined') {
                            var dom = angular.element($route.current.locals.$template),
                                foreach = function(dom) {
                                    var str = '';
                                    angular.forEach(dom, function(data) {
                                        if(data.childElementCount > 1) {
                                            str += data.outerHTML.replace(data.innerHTML, foreach(data.children));
                                        } else {
                                            if(data.outerHTML) {
                                                var elem = angular.element(data);
                                                if(!elem.attr('ng-render')) {
                                                    data.setAttribute('ng-render', '');
                                                }
                                                str += data.outerHTML;
                                            }
                                        }
                                    });
                                    return str;
                                };
                            $route.current.locals.$template = foreach(dom);
                        }

                        // if there is a ng-render-inside attribute check subtree
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