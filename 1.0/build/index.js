/*
combined files : 

gallery/zepto-adapter/1.0/index

*/
/**
 * @fileoverview 
 * @author kissy-team<bachi@taobao.com>
 * @module zepto-adapter
 **/
KISSY.add('gallery/zepto-adapter/1.0/index',function (S) {
    /**
     * @fileOverview 兼容kissy-mini 和 zepto 的适配器
     * @ignore
     */

    /**
     * @private
     * @class Zepto 
     * 原生的Zepto对象或者使用kissy时适配出来的对象
     */
    var Zepto = window.Zepto || (function () {

        function excuteDuration(self, fn, speed, easing, callback) {
            var params = getDurationParams(speed, easing, callback);

            fn.call(self, params.duration, params.complete, params.easing);
        }

        function getDurationParams(speed, easing, callback) {

            if (S.isPlainObject(speed)) {
                var obj = speed;
                if (S.isNumber(obj.duration)) {
                    obj.duration = obj.duration / 1000;
                }
                return obj;
            }

            if (S.isNumber(speed)) {
                speed = speed / 1000;
            } else if (S.isString(speed)) {
                callback = easing;
                easing = speed;
                speed = undefined;
            } else if (S.isFunction(speed)) {
                callback = speed;
                speed = undefined;
            }

            if (S.isFunction(easing)) {
                callback = easing;
                easing = undefined;
            }
            return {
                duration: speed,
                complete: callback,
                easing: easing
            };
        }

        function getOffsetParent(element) {
            var doc = document,
                body = doc.body,
                parent,
                positionStyle = S.one(element).css('position'),
                skipStatic = positionStyle == 'fixed' || positionStyle == 'absolute';

            if (!skipStatic) {
                return element.nodeName.toLowerCase() == 'html' ? null : element.parentNode;
            }

            for (parent = element.parentNode; parent && parent != body; parent = parent.parentNode) {
                positionStyle = S.one(parent).css('position');
                if (positionStyle != 'static') {
                    return parent;
                }
            }
            return null;
        }

        var NLP = S.node,
            zeptoNodeList = function (selector, content) {
                if (!(this instanceof zeptoNodeList)) {
                    return new zeptoNodeList(selector, content);
                }
                //S.ready
                if (S.isFunction(selector)) {
                    return S.ready(selector);
                }
                if (S.isString(selector)) {
                    if (content) {
                        return new zeptoNodeList(content).find(selector);
                    }
                    return new zeptoNodeList(S.all(selector));
                }
				var r = S.Node.call(this, selector);
				S.mix(r,{
					eq: function(index){
						return zeptoNodeList(this.item(index));
					},

					bind: NLP.on,
					
					off: NLP.detach,
					
					trigger: NLP.fire,
					
					filter: function (selector) {
						if (!selector) {
							return new zeptoNodeList();
						}
						var rst;
						if (S.isFunction(selector) || S.isString(selector)) {
							return new zeptoNodeList(DOM.filter(this, filter));
						}
						S.each(this, function (node, index) {
							if (node === selector) {
								rst = node;
								return false;
							}
						});
						return new zeptoNodeList(rst);
					},
					//返回的结果不一致
					find: function (selector) {
						return new zeptoNodeList(this.all(selector));
					},
					//复写delegate，更改参数顺序
					delegate: function (selector, eventType, fn) {
						return zeptoNodeList.superclass.delegate.call(this, eventType, selector, fn);
					},
					//更改 便遍历函数的顺序
					//修改this,和对象
					each: function (fn) {
						return S.each.call(this, function (value, index) {
							return fn.call(value, index, value);
						});
					},
					/**
					 * kissy 未提供此方法
					 */
					offsetParent: function () {
						return new zeptoNodeList(getOffsetParent(this[0]));
					},
					/*
					//参数顺序不一致
					animate: function (properties, speed, easing, callback) {
						var params = getDurationParams(speed, easing, callback);
						zeptoNodeList.superclass.animate.call(this, properties, params.duration, params.easing, params.complete);
					},
					*/
					/**
					 * kissy 未提供此方法
					 */
					position: function () {
						var _self = this,
							offset = _self.offset(),
							parent = _self.offsetParent();
						if (parent.length) {
							var parentOffset = parent.offset();
							offset.left -= parentOffset.left;
							offset.top -= parentOffset.top;
						}
						return offset;
					},
					get:function(index){
						if(index !== undefined){
							return this;
						} else {
							return this.item(index).getDOMNode();
						}
					}
					
				});

				//由于 kissy的动画单位和参数位置跟 zepto的不一致
				var durationMethods = ['fadeIn', 'fadeOut', 'fadeToggle', 'slideDown', 'slideUp', 'slideToggle', 'show', 'hide'];
				S.each(durationMethods, function (fnName) {
					r[fnName] = function (speed, easing, callback) {
						excuteDuration(r, NLP[fnName], speed, easing, callback);
					};
				});
				
				//zepto上的很多DOM的方法在kissy的Node上不支持
				var domMethods = ['change', 'blur', 'focus', 'select','click'];
				S.each(domMethods, function (fnName) {
					r[fnName] = function () {
						r.fire(fnName);
					}
				});

				//由于返回的对象的类型是S.Node，所以要更改类型
				var nodeMethods = ['children', 'parent', 'first', 'last', 'next', 'prev', 'siblings', 'closest'];
				S.each(nodeMethods, function (fnName) {
					r[fnName] = function (selector) {
						return new zeptoNodeList(r[fnName](selector));
					}
				});
				return r;
            };

        S.mix(zeptoNodeList, S);
        
        S.mix(zeptoNodeList, {
            /**
             * 是否包含指定DOM
             */
            contains: function (container, contained) {
                return S.one(container).contains(contained);
            },
            /**
             * 实现$.extend
             * @return {Object} 结果
             */
            extend: function () {
                var args = S.makeArray(arguments),
                    deep = false,
                    obj;
                if (S.isBoolean(arguments[0])) {
                    deep = args.shift();
                }
                obj = args[0];
                if (obj) {
                    for (var i = 1; i < args.length; i++) {
                        S.mix(obj, args[i], undefined, undefined, deep);
                    }
                }
                return obj;
            },
            /**
             * kissy 的此方法跟 zepto的接口不一致
             */
            each: function (elements, fn) {
                S.each(elements, function (value, index) {
                    return fn(index, value);
                });
            },
            /**
             * 返回结果不一致
             */
            inArray: function (elem, arr) {
                return S.indexOf(elem, arr);
            },
            /**
             * zepto的map函数将返回为 null 和 undefined的项不返回
             */
            map: function (arr, callback) {
                var rst = [];
                S.each(arr, function (item, index) {
                    var val = callback(item, index);
                    if (val != null) {
                        rst.push(val);
                    }
                });
                return rst;
            },

            parseJSON: JSON.parse,
			fn:S.node
        });

		S.mix(zeptoNodeList, S.UA);

        return zeptoNodeList;
    })();

	window.Zepto = Zepto;
    return Zepto;

}, {requires:[
	/**/'ua'
]});




