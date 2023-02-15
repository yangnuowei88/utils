/**
 * 防抖(被调用n次,只运行一次)
 * @param fn 回调函数
 * @param timeout 延时
 */
import { typeOf } from './TypeJudge';

export function debounce(fn, timeout = 300) {
    return function (...args) {
        clearTimeout(fn._tid);
        fn._tid = setTimeout(() => {
            fn.call(this, ...args);
        }, timeout);
    };
}

/**
 * 节流(被调用n次,只在time间隔时间点运行)
 * @param fn 回调函数
 * @param timeout 延时
 */
export function throttle(fn, timeout = 300) {
    let start = Date.now();
    return function (...args) {
        const now = Date.now();
        if (now - start >= timeout) {
            fn.call(this, ...args);
            start = now;
        }
    };
}

/**
 * 深拷贝，请勿用于拷贝非纯对象(函数，等将丢失)
 * @param {Object|Array}data 输入参数
 */
export function deepClone(data) {
    const t = typeOf(data);
    let o;

    if (t === 'array') {
        o = [];
    } else if (t === 'object') {
        o = {};
    } else {
        return data;
    }

    if (t === 'array') {
        for (let i = 0; i < data.length; i++) {
            o.push(deepClone(data[i]));
        }
    } else if (t === 'object') {
        for (let i in data) {
            o[i] = deepClone(data[i]);
        }
    }
    return o;
}

/**
 * 实现分时的函数，在intervalTime时间间隔内执行count次fn函数
 * @param {Array}     ary       每次fn执行需要的参数数组
 * @param {Function}  fn        处理函数
 * @param {Number}    count     每个时间间隔内执行的次数
 * @param {Number}    interval  时间间隔
 */
export function timeChunk(ary, fn, count, interval) {
    let obj,
        t,
        len = ary.length,
        intervalTime = interval || 200; // 默认时间间隔200ms
    const start = function () {
        for (let i = 0; i < Math.min(count || 1, len); i++) {
            obj = ary.shift();
            fn(obj);
        }
    };
    return function () {
        t = setInterval(function () {
            if (ary.length === 0) {
                return clearInterval(t);
            }
            start();
        }, intervalTime);
    };
}

