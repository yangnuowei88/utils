import { sortAscending } from '../Array';
/**
 * @module Math
 * @description Math 相关操作
 */
/**
 * Returns the median of the givens numbers
 *
 * @example median(1); // 1
 * @example median(1,2); // 1.5
 * @example median(1,2,3,4); // 2.5
 * @example median(1,2,3,4,5); // 3
 * @example median(...[1,2,3,4]); // 2.5
 *
 * @param  {...number} numbers - the numbers to get the median
 * @returns {number}
 */
export function median(...numbers) {
    const { length } = numbers;
    if (!length) return 0;

    sortAscending(numbers, true);

    if (length % 2 > 0)
        return (numbers[length / 2 - 1] + numbers[length / 2]) / 2;
    return numbers[(length - 1) / 2];
}
/**
 * Returns the most repeated element in an array
 *
 * @example
 * mode([1, 2, 2, 3, 4]); // 2
 * mode(["apple", "banana", "banana", "cherry"]); // "banana"
 *
 * @param  {Array} args - the elements to get the mode
 * @returns {*}
 */
export function mode(...args) {
    if (args.length === 1) return args[0];

    const mode = {};
    let max = args[0];
    let count = 0;

    for (let i = 0; i < args.length; i++) {
        const el = args[i];

        if (mode[el]) mode[el]++;
        else mode[el] = 1;

        if (count < mode[el]) {
            max = el;
            count = mode[el];
        }
    }

    return max;
}
/**
 * Returns an array of numbers between the `start` and `end` parameters,
 * incrementing by the `step` parameter.
 * Optionally, the values within the specified `skip` range can be skipped.
 *
 * @example
 * range(1, 5); // [1, 2, 3, 4, 5]
 * range(0, 100, 10); // [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
 * range(0, 100, 100) // [0, 100]
 * range(1, 100, 100) // [1]
 * range(0, 10, 1, [{start:2, end:8}]) // [0, 1, 9, 10]
 * range(0, 10, 1, [{start:2, end:4}, {start:7, end:8}]) // [0, 1, 5, 6, 9, 10]
 *
 * @param {number} start - The starting point of the range
 * @param {number} end - The ending point of the range
 * @param {number} [step=1] - The increment value
 * @param {Array<{start: number, end: number}>} [skip=[]] - The range of values to skip
 * @returns {number[]} An array of numbers
 */
export function range(start, end, step = 1, skip = []) {
    const arr = [];

    for (let i = start; i < end + 1; i += step) {
        let shouldSkip = false;
        skip.forEach(({ start, end }) => {
            if (i >= start && i <= end) shouldSkip = true;
        });
        if (!shouldSkip) arr.push(i);
    }

    return arr;
}
/**
 * 保留位数
 *
 * @export
 * @param {*} originalNum 原始值
 * @param {number} [keepCount=1] 保留的位数，默认1
 * @param {boolean} [round=true] 四舍五入，默认为true，否则直接截取
 * @param {boolean} [keepNegativeZero=false] 是否保留负零，默认为false，不保留
 * @returns {string} 调整后的数字字符串
 */
export function fixedDecimal(
    originalNum,
    keepCount = 1,
    round = true,
    keepNegativeZero = false
) {
    const num = parseFloat(originalNum);
    if (isNaN(num)) return originalNum;

    let numStr = '';
    if (round) {
        numStr = num.toFixed(keepCount);
    } else {
        const stringNum = num.toString();
        let { 0: interget, 1: decimal = '' } = stringNum.split('.');

        if (!keepCount) return interget;

        let decimalLen = decimal ? decimal.length : 0;
        if (decimalLen === keepCount) return stringNum;

        if (decimalLen > keepCount) return decimal.substring(0, keepCount);

        while (decimalLen < keepCount) {
            decimal = decimal + '0';
            decimalLen++;
        }

        numStr = `${interget}.${decimal}`;
    }

    return !keepNegativeZero &&
        parseFloat(numStr) === 0 &&
        numStr.indexOf('-') === 0
        ? numStr.slice(1)
        : numStr;
}
