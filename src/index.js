'use strict';

var array = require('blear.utils.array');
var string = require('blear.utils.string');

var browserJSPrefixList = ['', 'webkit', 'moz', 'ms', 'MS'];
var browserCSSPrefixList = ['', '-webkit', '-moz', '-ms'];
// @link http://www.w3school.com.cn/cssref/index.asp
var reCSS3 = /(border|animation|backgroud-size|transition|transform|display|filter|overflow)/;
var reCSSPrefix = /^-(webkit|moz|ms)-/i;
// translateX(0) => translateX(0px)
var reCSSCheckVal = /\(.*$$/;
var pEl = document.createElement('p');
var regOn = /^on/;
var compatibleCSSMap = {
    opacity: function (key, val) {
        // @fuckie
        /* istanbul ignore next */
        return {
            key: 'filter',
            val: 'alpha(opacity=' + (val * 100) + ')'
        };
    }
};


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
            (prefix + standard ) :
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
 * @returns {String} 兼容的事件名称
 *
 * @example
 * compatible.event('transitionend', window);
 * // => "onwebkittransitionend"
 */
exports.event = function (standard, parent) {
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
exports.css = function (standardKey, standardVal) {
    standardKey = string.separatorize(standardKey.trim().replace(reCSSPrefix, ''));

    if (!reCSS3.test(standardKey)) {
        return {
            key: standardKey,
            val: standardVal
        };
    }

    var findKey = '';
    var findVal = '';
    var checkVal = (standardVal + '').replace(reCSSCheckVal, '').toLowerCase();

    array.each(browserCSSPrefixList, function (index, prefix) {
        var testKey = prefix ? prefix + '-' + standardKey : standardKey;
        var setKey = string.humprize(testKey);

        if (setKey in pEl.style) {
            findKey = testKey;

            if (standardVal) {
                array.each(browserCSSPrefixList, function (index, prefix) {
                    var setVal = prefix ? prefix + '-' + standardVal : standardVal;

                    try {
                        // ie 下某些复制会报错
                        pEl.style[setKey] = setVal;
                    } catch (err) {
                        // ignore
                    }

                    var cssText = pEl.style.cssText.toLowerCase();

                    if (cssText.indexOf(checkVal) > -1) {
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

    var com = null;

    /* istanbul ignore next */
    if (!findKey && (com = compatibleCSSMap[standardKey])) {
        if (standardVal) {
            return com(standardKey, standardVal);
        } else {
            findKey = standardKey;
        }
    }

    return {key: findKey, val: findVal};
};