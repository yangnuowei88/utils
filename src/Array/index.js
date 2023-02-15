import { typeOf } from '../TypeJudge';
import { randomInt } from '../Random';
import { deepClone } from '../common';
/**
 * @module Array
 * @description Array 相关操作
 */
/**
 * 随机取出一项数组内容
 * @example choice(["A", "B", "C"]); // "B"
 * @example choice([10, 5, 123]); // 10
 * @param {any[]} array - the array to select a random item
 * @returns {any}
 */
export function choice(array) {
    return array[randomInt(array.length)];
}

/**
 * 取出对象数组最大的值或对象.
 *
 * @example
 * const myArray = [{a:1, b:100}, {a: 0, b:50}, {a:0, b:200}]
 * findBigObject(myArray, "b"); // {a:0, b:200}
 * findBigObject(myArray, "a"); // {a:1, b:100}
 * findBigObject(myArray, "b", true); // 200
 * findBigObject(myArray, "a", true); // 1
 *
 * @param {any[]} array - The array to search
 * @param {string} prop - The property to find the biggest element
 * @param {boolean} [returnOnlyValue=false] - If true only returns the value of the given property with the biggest value
 * @returns {any|number} - The biggest element in the array
 */
export function findBigObject(array, prop, returnOnlyValue = false) {
    const biggest = Math.max(...array.map(o => o[prop]));
    return returnOnlyValue ? biggest : array.find(e => e[prop] === biggest);
}

/**
 *  取出对象数组最小的值或对象
 *
 * @example
 * const myArray = [{a:1, b:100}, {a:10, b:50}, {a:0, b:200}]
 * findLowObject(myArray, "b"); // {a:10, b:50}
 * findLowObject(myArray, "a"); // {a:0, b:200}
 * findLowObject(myArray, "b", true); // 50
 * findLowObject(myArray, "a", true); // 0
 *
 * @param {Object[]} array - The array to search
 * @param {string} prop - The property to find the lowest element
 * @param {boolean} [returnOnlyValue=false] - If true only returns the value of the given property with the lowest value
 * @returns {Object} - The lowest element in the array
 */

export function findLowObject(array, prop, returnOnlyValue = false) {
    const lowest = Math.min(...array.map(o => o[prop]));
    return returnOnlyValue ? lowest : array.find(e => e[prop] === lowest);
}

/**
 * @description
 * Move an array element to the right
 *
 * @example moveLeft([1,2,3,4,5]); // [2,3,4,5,1]
 * @example moveLeft([1,2,3,4,5], 2); // [3,4,5,1,2]
 * @example moveLeft(["a","b","c","d","e"], 7) // ["c","d","e","a","b"]
 * @example moveLeft(["a","b"], 3) // ["b","a"]
 *
 * @param {any[]} array - The array to move
 * @param {number} times - The number of times to move the array
 * @returns {any[]}
 */
export function moveLeft(array = [], times = 1) {
    for (let t = 0; t < times; t++) {
        let last = array[array.length - 1];
        for (let i = array.length - 2; i >= 0; i--) {
            const tempValue = array[i];
            array[i] = last;
            last = tempValue;
        }
        array[array.length - 1] = last;
    }

    return array;
}

/**
 * @description
 * Move an array element to the left
 *
 * @example moveLeft([1,2,3,4,5]); // [5,1,2,3,4]
 * @example moveLeft([1,2,3,4,5], 2); // [4,5,1,2,3]
 * @example moveLeft(["a","b","c","d","e"], 7) // ["d","e","a","b","c"]
 * @example moveLeft(["a","b"], 3) // ["b","a"]
 *
 * @param {any[]} array - The array to move
 * @param {number} times - The number of times to move the array
 * @returns {any[]}
 */
export function moveRight(array = [], times = 1) {
    for (let t = 0; t < times; t++) {
        let last = array[0]; // temp variable to store last changed value
        for (let i = 1; i < array.length; i++) {
            const tempValue = array[i]; // temp variable to store the current value
            array[i] = last; // update the value in the current position
            last = tempValue; // update the last changed value
        }
        array[0] = last; // put the last changed value in the first position
    }

    return array;
}

/**
 * 数组乱序，返回新数组
 * @example shuffle(["A", "B", "C"]); // ["B","A","C"]
 * @example shuffle([1,2,3,4,5,6,7,8,9]); // [8,5,1,4,3,6,9,2,7]
 * @example shuffle([{a:1},{b:2},{c:3}]); // [{a:1},{c:3},{b:2}]
 *
 * @param {any[]} array - the array with the items to randomize
 * @param {boolean} mutateOriginal - the array with the items to randomize
 * @returns {any[]}
 */
export function shuffle(array, mutateOriginal = true) {
    if (mutateOriginal) return array.sort(() => Math.random() - 0.5);

    // -- Don't mutate the original array
    const copy = deepClone(array);
    const shuffled = [];

    while (copy.length) {
        const index = randomInt(copy.length);
        shuffled.push(copy[index]);
        copy.splice(index, 1);
    }

    return shuffled;
}
/**
 * 将一个数组按size拆分成多个数组的块，然后把这些块组成新的数组
 * @author cgh
 * @time   2018-04-09
 * @param  {[type]}   array [description]
 * @param  {[type]}   size  [description]
 * @return {[type]}         [返回一个新数组]
 * @example
 *
 * chunk(['a', 'b', 'c', 'd'], 2);
 * // => [['a', 'b'], ['c', 'd']]
 *
 * chunk(['a', 'b', 'c', 'd'], 3);
 * // => [['a', 'b', 'c'], ['d']]
 */
export function chunk(array, size) {
    const length = array.length ? array.length : 0;
    if (!length || !size) {
        return [];
    }
    let index = 0;
    let resIndex = 0;
    const result = new Array(Math.ceil(length / size));

    while (index < length) {
        result[resIndex++] = array.slice(index, (index += size));
    }
    return result;
}
/**
 * 数组深度扁平化
 * @param {Array} arr 待转换数组
 */
export const flatten = arr =>
    arr.reduce(
        (result, shouldFlattenArr) =>
            result.concat(
                Array.isArray(shouldFlattenArr)
                    ? flatten(shouldFlattenArr)
                    : shouldFlattenArr
            ),
        []
    );
/**
 * 过滤并排序
 * @param {Array.<Object>} src 源数组
 * @param {Array.<String>} sortArray 排序数组
 * @param {String} key 对应的排序字段
 * @example
 * const src = [{id:'name2'}, {id:'name1'}, {name:'tom'}];
 * const sortArray = ['name1', 'name2'];
 *
 * const retArray = filterSort(src, sortArray, 'id');
 * // retArray = [{id:'name1'}, {id:'name2'}];
 */
export function filterSort(src, sortArray = [], key = 'id') {
    if (typeOf(src) === 'array' && src.length) {
        return src
            .filter(c => sortArray.includes(c[key]))
            .sort(
                (pre, next) =>
                    sortArray.indexOf(pre[key]) - sortArray.indexOf(next[key])
            );
    }
    return [];
}
/**
 * 数组升序排列
 *
 * @example
 * const myArr = [10,4,2,7,1,0,11,4,2,3,5,8,4,3,0,6];
 * const myNewSortedArr = sortAscending(myArr); // [0,0,1,2,2,3,3,4,4,4,5,6,7,8,10,11]
 *
 * @param {number[]} arr - the array to sort
 * @param {boolean} [mutateOriginal=false] - if true will change the original array
 * @returns {number[]} A new Array sorted
 */
export function sortAscending(arr, mutateOriginal = false) {
    if (!mutateOriginal) return [...arr].sort((a, b) => a - b);
    return arr.sort((a, b) => a - b);
}

/**
 * 对象数组升序排列
 *
 * @param {any[]} arr - the array to sort
 * @param {string} prop - the property base to sort
 * @returns {any[]} - a new sorted array by the given property
 */
export function sortAscendingObject(arr, prop, mutateOriginal = false) {
    if (!mutateOriginal) return [...arr].sort((a, b) => a[prop] - b[prop]);
    return arr.sort((a, b) => a[prop] - b[prop]);
}

/**
 * 数组降序排列
 *
 * @example
 * const myArr = [10,4,2,7,1,0,11,4,2,3,5,8,4,3,0,6];
 * const myNewSortedArr = sortDescending(myArr); // [11,10,8,7,6,5,4,4,4,3,3,2,2,1,0,0]
 *
 * @param {number[]} arr - the array to sort
 * @returns {number[]} A new Array sorted
 */
export function sortDescending(arr, mutateOriginal = false) {
    if (!mutateOriginal) return [...arr].sort((a, b) => b - a);
    return arr.sort((a, b) => b - a);
}

/**
 * 对象数组降序排列
 *
 * @param {any[]} arr - the array to sort
 * @param {string} prop - the property base to sort
 * @returns {any[]} - a new sorted array by the given property
 */
export function sortDescendingObject(arr, prop, mutateOriginal = false) {
    if (!mutateOriginal) return [...arr].sort((a, b) => b[prop] - a[prop]);
    return arr.sort((a, b) => b[prop] - a[prop]);
}
