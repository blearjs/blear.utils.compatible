/**
 * 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var collection = require('../src/index.js');

describe('index.js', function () {
    it('.each', function () {
        var obj1 = {a: 1, b: 2};
        collection.each(obj1, function (key, val) {
            expect(obj1[key]).toBe(val);
        });

        var arr1 = ['a', 'b'];
        collection.each(arr1, function (index, val) {
            expect(arr1[index]).toBe(val);
        });

        var boo1 = true;
        var times = 0;
        collection.each(boo1, function () {
            times++;
        });
        expect(times).toEqual(0);
    });

    it('.map', function () {
        var obj1 = {a: 1, b: 2};
        var obj2 = collection.map(obj1, function (val) {
            return val * val * val;
        });
        expect(obj1).not.toBe(obj2);
        expect(obj1).toEqual({a: 1, b: 2});
        expect(obj2).toEqual({a: 1, b: 8});

        var arr1 = ['a', 'b'];
        var arr2 = collection.map(arr1, function (val) {
            return val + val + val;
        });
        expect(arr1).not.toBe(arr2);
        expect(arr1).toEqual(['a', 'b']);
        expect(arr2).toEqual(['aaa', 'bbb']);

        var boo1 = true;
        var times = 0;
        var boo2 = collection.map(boo1, function () {
            times++;
            return '';
        });
        expect(times).toEqual(0);
        expect(boo1).toBe(boo2);
    });

    it('.filter', function () {
        var obj1 = {a: 1, b: 2};
        var obj2 = collection.filter(obj1, function (val) {
            return val > 1;
        });
        expect(obj1).not.toBe(obj2);
        expect(obj1).toEqual({a: 1, b: 2});
        expect(obj2).toEqual({b: 2});

        var arr1 = ['a', 'b'];
        var arr2 = collection.filter(arr1, function (val) {
            return val.charCodeAt(0) > 97;
        });
        expect(arr1).not.toBe(arr2);
        expect(arr1).toEqual(['a', 'b']);
        expect(arr2).toEqual(['b']);

        var boo1 = true;
        var times = 0;
        var boo2 = collection.filter(boo1, function () {
            times++;
            return '';
        });
        expect(times).toEqual(0);
        expect(boo1).toBe(boo2);
    });
});
