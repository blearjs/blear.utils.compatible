'use strict';

var array = require('blear.utils.array');
var string = require('blear.utils.string');

var doc = document;
var browserJSPrefixList = ['', 'webkit', 'moz', 'ms', 'MS'];
var browserCSSPrefixList = ['', '-webkit', '-moz', '-ms'];
var reCSSPrefix = /^-(webkit|moz|ms)-/i;
// translateX(0) => translateX(0px)
var reCSSCheckVal = /\(.*$$/;
var regOn = /^on/;
var transitionAnimationRE = /^(transition|animation)/i;
var newTestEl = function () {
    return doc.createElement('p');
};
var testEl = newTestEl();
// @link http://www.w3cplus.com/css/the-lengths-of-css.html
var reUnit = /(px|em|rem|in|cm|mm|pt|pc|ex|ch|vw|vh|vmin|vmax|%|rgb)/i;


/**
 * 大写单词中的第一个字母
 * @param {String} word
 * @returns {String}
 * @private
 */
var upperCaseFirstLetter = function upperCaseFirstLetter(word) {
    return word.slice(0, 1).toUpperCase() + word.slice(1);
};


/**
 * 获取兼容 api
 * @param {String} standard 标准属性、方法名称
 * @param {Object} parent   标准方法父级
 * @param isEventType {Boolean} 是否为事件
 * @returns {*}
 */
var getCompatibleAPI = function (standard, parent, isEventType) {
    var html5Key = null;
    var find = false;
    var evOn = 'on';

    if (isEventType) {
        standard = standard.replace(regOn, '').toLowerCase();
    }

    array.each(browserJSPrefixList, function (index, prefix) {
        html5Key = isEventType ?
            (prefix + standard) :
            (prefix ? prefix + upperCaseFirstLetter(standard) : standard);

        if ((isEventType ? evOn : '') + html5Key in parent) {
            find = true;
            return false;
        }
    });

    html5Key = find ? html5Key : undefined;

    return html5Key;
};


/**
 * 获取有浏览器前缀的方法名称
 * @param {String} standard 标准属性、方法名称
 * @param {Object} parent   标准方法父级
 * @returns {String} 兼容的属性、方法名称
 *
 * @example
 * compatible.js('audioContext', window);
 * // => "webkitAudioContext"
 */
exports.js = function (standard, parent) {
    return getCompatibleAPI(standard, parent, false);
};


/**
 * 获取有浏览器前缀的事件名称
 * @param {String} standard 标准事件名称
 * @param {Object} [parent=document]  标准事件父级
 * @returns {String|undefined} 兼容的事件名称
 *
 * @example
 * compatible.event('transitionend', window);
 * // => "onwebkittransitionend"
 */
exports.event = function (standard, parent) {
    // ie 的 transition 无法在 JS 对象里直接检测，因此采用另外方式
    // @ref https://github.com/EvandroLG/transitionEnd/blob/master/src/transition-end.js
    if (transitionAnimationRE.test(standard)) {
        var starting = '';
        var ending = standard.replace(transitionAnimationRE, function ($0) {
            starting = $0;
            return '';
        });
        var cssKey = compatibleCSS(starting).key;

        if (/^webkit/i.test(cssKey)) {
            return string.humprize('webkit-' + starting + '-' + ending);
        }

        if (/^o/i.test(cssKey)) {
            return string.humprize('o-' + starting + '-' + ending);
        }

        return starting + ending;
    }

    return getCompatibleAPI(standard, parent || document, true);
};


/**
 * 获取有浏览器前缀的CSS名称
 * @param {String} standardKey 标准的CSS3属性
 * @param {String} [standardVal] 标准的CSS3属性值
 * @returns {{key: String, val: String}} 兼容属性
 *
 * @example
 * compatible.css('border-start');
 * // => {key: "-webkit-border-start"}
 */
var compatibleCSS = exports.css = function (standardKey, standardVal) {
    standardKey = string.separatorize(standardKey.trim().replace(reCSSPrefix, ''));

    var findKey = '';
    var findVal = '';
    var checkVal = (standardVal + '').replace(reCSSCheckVal, '').toLowerCase();

    array.each(browserCSSPrefixList, function (index, prefix) {
        var testKey = prefix ? prefix + '-' + standardKey : standardKey;
        var setKey = string.humprize(testKey);

        if (setKey in testEl.style) {
            findKey = testKey;

            if (standardVal) {
                array.each(browserCSSPrefixList, function (index, prefix) {
                    var setVal = prefix ? prefix + '-' + standardVal : standardVal;
                    // 防止一个元素多次测试互相影响
                    var testEl = newTestEl();

                    try {
                        // ie 下某些复制会报错
                        testEl.style[setKey] = setVal;
                    } catch (err) {
                        // ignore
                    }

                    var cssText = testEl.style.cssText.toLowerCase();

                    // 如果值里有单位说明是正确的 || 值里包含检查数据也是正确的
                    // 12.34567px => 12.346px
                    if (reUnit.test(cssText) || cssText.indexOf(checkVal) > -1) {
                        findVal = setVal;
                        return false;
                    }
                });

                if (findVal) {
                    return false;
                }

                findKey = '';
            } else {
                /* istanbul ignore next */
                return false;
            }
        }
    });

    return {key: findKey, val: findVal};
};