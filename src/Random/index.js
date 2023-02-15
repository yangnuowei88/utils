/**
 * @module Random
 * @description 随机相关函数
 */
/**
 * Return a random float number between the given values and the given precision
 *
 * @example
 * randomFloat(0, 1);
 * randomFloat(-10, 0, 5);
 * randomFloat(-550, 444);
 *
 * @param {number} [min=0] - min value
 * @param {number} [max=1] - max value
 * @param {number} [precision=2] - the float precision
 * @returns {number} - random float number
 */
export function randomFloat(min = 0, max = 1, precision = 2) {
    if (!max) {
        max = min;
        min = 0;
    }
    return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

/**
 * Return a random integer number between the given values and the given precision
 *
 * @example
 * randomInt(0, 1);
 * randomInt(-10, 0);
 * randomInt(-550, 444);
 *
 * @param {number} min - min value
 * @param {number} max - max value
 * @returns {number} random integer number
 */
export function randomInt(min, max) {
    if (!max) {
        max = min;
        min = 0;
    }
    return Math.round(min + Math.random() * (max - min));
}

/**
 * Return a random number between the given values and the given precision
 *
 * @example
 * randomNumber(0, 1);
 * randomNumber(-10, 0, 5);
 * randomNumber(-550, 444);
 *
 * @param {number} min - min value
 * @param {number} max - max value
 * @returns {number} - random number
 */
export function randomNumber(min, max) {
    return randomFloat(min, max);
}

/**
 * @description 产生任意长度随机字母数字组合
 * @param {String} randomFlag 是否任意长度
 * @param {String} min 任意长度最小位[固定位数]
 * @param {String} max 任意长度最大位
 * @return {String}
 *
 * @example
 * randomWord(false, 10, 100) => 8rgBAH1AiS
 */
export function randomWord(randomFlag, min, max) {
    let str = '',
        range = min,
        arr = [
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            'a',
            'b',
            'c',
            'd',
            'e',
            'f',
            'g',
            'h',
            'i',
            'j',
            'k',
            'l',
            'm',
            'n',
            'o',
            'p',
            'q',
            'r',
            's',
            't',
            'u',
            'v',
            'w',
            'x',
            'y',
            'z',
            'A',
            'B',
            'C',
            'D',
            'E',
            'F',
            'G',
            'H',
            'I',
            'J',
            'K',
            'L',
            'M',
            'N',
            'O',
            'P',
            'Q',
            'R',
            'S',
            'T',
            'U',
            'V',
            'W',
            'X',
            'Y',
            'Z',
        ];

    // 随机产生
    if (randomFlag) {
        range = Math.round(Math.random() * (max - min)) + min;
    }
    for (let i = 0; i < range; i++) {
        let pos = Math.round(Math.random() * (arr.length - 1));
        str += arr[pos];
    }
    return str;
}

/**
 * @description 固定长度随机字符串
 */
export function randomWordByLength(len = 32) {
    const $chars =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    const maxPos = $chars.length;
    let str = '';
    for (let i = 0; i < len; i++) {
        str += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return str;
}

/**
 * Returns a random color hexadecimal
 *
 * @example
 * randomColor() // '#243ff4'
 * randomColor() // '#64e30f'
 *
 * @returns {string} a new random color
 */
export function randomColor() {
    return '#' + ((Math.random() * 0xffffff) << 0).toString(16);
}

/**
 * Export a random rgb color (red, green, blue)
 *
 * @example
 * randomRGBColor() // 'rgb(67.77, 251.89, 163.64)'
 * randomRGBColor() // 'rgb(142.84, 37.61, 173.32)'
 *
 * @returns {string}
 */
export function randomRGBColor() {
    return `rgb(${randomInt(255)}, ${randomInt(255)}, ${randomInt(255)})`;
}

/**
 * Export a random rgba color (red, green, blue, alpha)
 *
 * @example
 * randomRGBAColor() // 'rgba(73.67, 177.51, 5.37, 0.82158)'
 * randomRGBAColor() // 'rgba(187.17, 195.28, 28.24, 0.73586)'
 *
 * @returns {string}
 */

export function randomRGBAColor() {
    return `rgba(${randomInt(255)}, ${randomInt(255)}, ${randomInt(
        255
    )}, ${Math.random().toFixed(5)})`;
}
