/**
 * 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var compatible = require('../src/index.js');

describe('index.js', function () {
    var divEl = null;

    beforeAll(function () {
        divEl = document.createElement('div');
        document.body.appendChild(divEl);
    });

    afterAll(function () {
        document.body.removeChild(divEl);
    });

    var setStyle = function (el, cssKey, cssVal) {
        el.style[cssKey] = cssVal;
    };

    var getStyle = function (el, cssKey) {
        return el.style[cssKey];
    };

    it('.js', function () {
        var key1 = compatible.js('document', window);
        var key2 = compatible.js('IDBRequest', window);
        var key3 = compatible.js('CSSMatrix', window);
        var key4 = compatible.js('transitionEvent', window);

        expect(key1 in window).toBe(true);
        expect(key2 in window).toBe(true);
        expect(key3 in window).toBe(true);
        expect(key4 in window).toBe(true);
    });

    it('.event', function () {
        var key1 = compatible.event('onabort', window);
        var key2 = compatible.event('animationiteration', window);

        key1 && expect('on' + key1 in window).toBe(true);
        key2 && expect('on' + key2 in window).toBe(true);
    });

    it('.css', function () {
        var ret1 = compatible.css('width');
        var ret2 = compatible.css('display', 'flex');
        var ret3 = compatible.css('border-radius', '2px');
        var ret4 = compatible.css('filter', 'blur(2px)');

        expect(ret1.key).toBe('width');
        setStyle(divEl, ret1.key, '100px');
        expect(getStyle(divEl, ret1.key)).toEqual('100px');

        expect(ret2.key).toBe('display');
        expect(ret2.val).toMatch(/flex/);
        setStyle(divEl, ret2.key, ret2.val);
        expect(getStyle(divEl, ret2.key)).toEqual(ret2.val);

        if (ret3.key) {
            expect(ret3.key).toMatch('border-radius');
            expect(ret3.val).toMatch('2px');
        }

        // 某些浏览器不支持
        if (ret4.key) {
            expect(ret4.key).toMatch(/filter/i);
            expect(ret4.val).toMatch(/blur/);
            setStyle(divEl, ret4.key, ret4.val);
            expect(getStyle(divEl, ret4.key)).toEqual(ret4.val);
        }
    });
});
