/**
 * @module String
 * @description 字符串相关函数
 */

/**
 * @description 生成UUID
 * @return {String} 返回字符串
 *
 * @example
 * uuid() => '026841df-27db-4ec6-b4e8-6a4c7ee7854f'
 */
export function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (
        c
    ) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
/**
 * 驼峰、帕斯卡转烤串
 * @param {String} str camelCase、PascalCase字符串
 * @returns {String} kebab-case字符串
 */
export const str2kebab = str => str.replace(/\B([A-Z])/g, '-$1').toLowerCase();
/**
 * 是否是特殊字符
 */
export function isSpecialChar(str) {
    const pattern = new RegExp(
        "[`~!%@#$^&*=|{}':;',\\[\\].<>《》/?~！@#￥……&*——|{}【】‘；：”“'。，、？ ]"
    );
    if (pattern.test(str)) {
        return true;
    }
    return false;
}
/**
 * Invert all letters from a given text
 *
 * @example reverseString("beep"); // peeb
 * @example reverseString("Beep"); // peeB
 * @example reverseString("Beep Boop"); // pooB peeB
 * @example reverseString("beep boop 1 20"); // 02 1 poob peeb
 *
 * @param {string} str - the text to transform
 * @returns {string}
 */
export function reverseString(str) {
    return str.split('').reverse().join('');
}
/**
 * echarts 文字换行
 * @param {*} params 数据
 * @param {*} num 以几个字符为一行
 * @returns
 */
export default function fieldWrap(params, num) {
    params = params.toString();
    let newParamsName = ''; // 最终拼接成的字符串
    const paramsNameNumber = params.length; // 实际标签的个数
    const provideNumber = num; // 每行能显示的字的个数
    const rowNumber = Math.ceil(paramsNameNumber / provideNumber); // 换行的话，需要显示几行，向上取整
    //  判断标签的个数是否大于规定的个数， 如果大于，则进行换行处理 如果不大于，即等于或小于，就返回原标签
    // 条件等同于rowNumber>1
    if (paramsNameNumber > provideNumber) {
        // 循环每一行,p表示行
        for (let p = 0; p < rowNumber; p++) {
            let tempStr = ''; // 表示每一次截取的字符串
            const start = p * provideNumber; // 开始截取的位置
            const end = start + provideNumber; // 结束截取的位置
            // 此处特殊处理最后一行的索引值
            if (p == rowNumber - 1) {
                // 最后一次不换行
                tempStr = params.substring(start, paramsNameNumber);
            } else {
                // 每一次拼接字符串并换行
                tempStr = params.substring(start, end) + '\n';
            }
            newParamsName += tempStr; // 最终拼成的字符串
        }
    } else {
        // 将旧标签的值赋给新标签
        newParamsName = params;
    }
    //将最终的字符串返回
    return newParamsName;
}
/**
 * transJson
 * @param {String} params
 * @return {JSON}
 */
export function transJson(params) {
    let parametersJson;
    if (params) {
        const parametersArr = params
            .split(', ')
            .map(pair => pair.split('='))
            .map(([key, value]) => [key, isNaN(value) ? value : +value]);
        parametersJson = Object.fromEntries(parametersArr);
    }
    return parametersJson;
}
