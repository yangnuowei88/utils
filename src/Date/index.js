import fecha from 'fecha';
/**
 * @module Date
 * @description 日期时间相关函数
 */
/**
 * 获取日期字符串
 * @param {Date|string|number} ts 要转换的时间
 * @param {string} format 日期格式
 * @returns {string|*} 日期字符串
 */
export function getDateString(ts, format = 'YYYY-MM-DD') {
    if (!ts) return;

    let tsDate;

    // 日期对象
    if (ts instanceof Date) {
        tsDate = ts;
    }

    // 字符(日期字符)
    if (typeof ts === 'string') {
        // 日期字符
        tsDate = new Date(ts.replace(/-/g, '/'));

        if (!isValidDate(tsDate)) {
            // 时间戳字符
            tsDate = new Date(+ts);
        }
    }

    // 时间戳数字
    if (typeof ts === 'number') {
        tsDate = new Date(ts);
    }

    // 日期不合法
    if (!isValidDate(tsDate)) return ts;

    return fecha.format(tsDate, format);
}
/**
 * 获取时间字符串
 * @param {Date|string|number} ts 要转换的时间
 * @param {string} format 日期格式
 * @returns {string|*} 时间字符串
 */
export function getDatetimeString(ts, format = 'YYYY-MM-DD HH:mm') {
    return getDateString(ts, format);
}
/**
 * @description 获取当前日期
 * @param {String} seperator 连接字符 默认 -
 * @returns {String} 当前日期
 * @example
 * getNowDate() => "2020-05-18"
 */
export function getNowDate(seperator = '-') {
    const showDate = new Date();
    const year = showDate.getFullYear();
    let month = showDate.getMonth() + 1;
    let strDate = showDate.getDate();
    if (month >= 1 && month <= 9) {
        month = '0' + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = '0' + strDate;
    }
    const currentdate = year + seperator + month + seperator + strDate;
    return currentdate;
}
/**
 * @description 获取某月份的天数
 * @param {String} year
 * @param {String} month
 * @return {Number} 某月份的天数
 *
 * @example
 * getDaysInOneMonth({year: 2020, month: 5}) => 31
 */
export function getDaysInOneMonth({ year, month }) {
    const _month = parseInt(month, 10);
    const d = new Date(year, _month, 0);
    return d.getDate();
}
/**
 * 合法日期判断
 * @param {Date} date 要判断的日期
 * @returns {boolean} 是否合法
 */
export function isValidDate(date) {
    return date instanceof Date && !isNaN(date.getTime());
}
/**
 * 毫秒转秒
 *
 * @export
 * @param {number} ms 毫秒
 * @returns 秒
 */
export function ms2s(ms) {
    return Math.floor(ms / 1000);
}

/**
 * 毫秒转分
 *
 * @export
 * @param {number} ms 毫秒
 * @returns 分
 */
export function ms2m(ms) {
    return Math.floor(ms2s(ms) / 60);
}

/**
 * 毫秒转小时
 *
 * @export
 * @param {number} ms 毫秒
 * @returns 小时
 */
export function ms2h(ms) {
    return Math.floor(ms2m(ms) / 60);
}
