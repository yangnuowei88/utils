/**
 * @module Storage
 * @description Storage and Cookie 操作
 */
const { toString } = {};

/**
 * 设置cookie
 * @param {string} key 键
 * @param {string} val 值
 * @param {Date|number} days 过期时间|过期天数
 * @param {string} path cookie的path
 */
function cookieSetItem(key, val, days, path = '/') {
    let str = `${key}=${encodeURIComponent(val)}`;

    let expire;
    // 过期时间
    if (toString.call(days) === '[object Date]') {
        expire = days;
    }
    // 过期天数
    else if (typeof days === 'number') {
        expire = new Date();
        expire.setDate(expire.getDate() + days);
    }

    expire && (str += `;path=${path};expires=${expire.toUTCString()}`);
    document.cookie = str;
}

/**
 * 获取cookie
 * @param {string} key 键
 * @returns {string} cookie值
 */
function cookieGetItem(key) {
    const { cookie } = document;
    const index = cookie.indexOf(`${key}=`);

    if (index !== -1) {
        const start = index + key.length + 1;
        let end = cookie.indexOf(';', start);

        // 最后一个
        end === -1 && (end = cookie.length);
        return decodeURIComponent(cookie.slice(start, end));
    }
}

/**
 * 清除cookie
 * @param {string} key 键
 */
function cookieRemoveItem(key) {
    document.cookie = `${key}=_;expires=${new Date().toUTCString()}`;
}
// 过期时间前缀
const expirePrefix = '_expire_';

/**
 * 清除
 * @param {string} key 键
 */
function removeItem(key) {
    localStorage.removeItem(key);
    localStorage.removeItem(expirePrefix + key);
}

/**
 * 设置localStorage函数
 * @param {string} key 键
 * @param {string} val 值
 * @param {Date|number} days 过期时间|过期天数
 * @param {number} hours 过期小时数
 */
function setItem(key, val, days, hours) {
    // 如设值为空
    if (val === undefined || val === null) {
        return;
    }

    let expire;

    const now = new Date();

    // days参数是一个日期
    if (toString.call(days) === '[object Date]') {
        expire = +days;
    }
    // 过期天数
    else if (typeof days === 'number') {
        expire = now.setDate(now.getDate() + days);
    }
    // 过期小时数
    else if (typeof hours === 'number') {
        expire = now.setHours(now.getHours() + hours);
    }
    // 默认过期天数为1天
    else {
        expire = now.setDate(now.getDate() + 1);
    }

    localStorage.setItem(key, val);
    localStorage.setItem(expirePrefix + key, expire);
}

/**
 * 获取
 * @param {string} key 键
 * @returns {string} 值
 */
function getItem(key) {
    const date = new Date();

    const expire = localStorage.getItem(expirePrefix + key);

    // 判断过期时间,如未过期
    if (expire && +expire > +date) {
        return localStorage.getItem(key);
    }

    // 已过期就清除
    removeItem(key);
    return null;
}
export default {
    cookieSetItem,
    cookieGetItem,
    cookieRemoveItem,
    setItem,
    getItem,
    removeItem,
};
