import { str2kebab } from '../String';
import { isEmpty } from '../TypeJudge';
/**
 * @module Dom
 * @description dom 相关操作
 */
/**
 * 添加样式类
 * @param {Element} el 元素
 * @param {String} className 样式名
 */
export function addClass(el, className) {
    if (hasClass(el, className)) {
        return;
    }
    const newClass = el.className.split(' ');
    newClass.push(className);
    el.className = newClass.join(' ');
}

/**
 * 移除样式类
 * @param {Element} el 元素
 * @param {String} className 样式名
 */
export function removeClass(el, className) {
    if (!hasClass(el, className)) {
        return;
    }
    const newClassList = el.className.split(' ');
    newClassList.splice(newClassList.indexOf(className), 1);
    el.className = newClassList.join(' ');
}

/**
 * 判断是否有样式类
 * @param {Element} el 元素
 * @param {String} className 样式类
 */
export function hasClass(el, className) {
    const reg = new RegExp('(^|\\s)' + className + '(\\s|$)');
    return reg.test(el.className);
}

/**
 * 获取/设置data-*
 * @param {Element} el 元素
 * @param {String} name 名称
 * @param {Any} val 需要设置的值
 */
export function getData(el, name, val) {
    const prefix = 'data-';
    name = prefix + name;
    if (val) {
        return el.setAttribute(name, val);
    } else {
        return el.getAttribute(name);
    }
}

/**
 * 获取元素尺寸
 * @param {Element} el 元素
 */
export function getRect(el) {
    if (el instanceof window.SVGElement) {
        const rect = el.getBoundingClientRect();
        return {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
        };
    } else {
        return {
            top: el.offsetTop,
            left: el.offsetLeft,
            width: el.offsetWidth,
            height: el.offsetHeight,
        };
    }
}

/**
 * 复制到剪贴板
 * @param {String} str 需要复制的字符串
 */
export function copyToClipboard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    const selected =
        document.getSelection().rangeCount > 0
            ? document.getSelection().getRangeAt(0)
            : false;
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    if (selected) {
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(selected);
    }
}

/**
 * 滚动html到顶部
 */
export function scrollToTop() {
    const c = document.documentElement.scrollTop || document.body.scrollTop;
    if (c > 0) {
        window.requestAnimationFrame(scrollToTop);
        window.scrollTo(0, c - c / 8);
    }
}

/**
 * 获取计算样式
 * @param {Object} ele
 * @returns {Object} 样式对象
 */
export function getStyle(ele) {
    // * 使用defaultView兼容FF<=30中出现的问题
    let view = ele.ownerDocument.defaultView;

    if (!view || !view.opener) {
        view = window;
    }

    return view.getComputedStyle(ele, null);
}

/**
 * 添加样式
 * @param {Element} el 元素
 * @param {Object} styleObj 样式obj
 */
export function addStyle(el, styleObj) {
    const oldStyle = el.style.cssText;

    const newStyle = Object.entries(styleObj).reduce((acc, cur) => {
        cur[0] = str2kebab(cur[0]); // key转换成kebab-case
        return (acc += cur.join(':') + ';');
    }, oldStyle);

    el.style.cssText = newStyle;
}

/**
 * 判断是否支持css3 变量
 *
 * @export
 * @returns 是否支持
 */
export function canSupportCssVar() {
    if (canSupportCssVar.isSupport != null) return canSupportCssVar.isSupport;

    const id = 'test-support-css-var';
    let styleEl = document.createElement('style');
    styleEl.innerText = styleEl.innerText = `:root{--${id}:-9999;}#${id}{position:absolute;top:-99999em;left:-99999em;z-index:var(--${id});opacity:0;font-size:0;width:0;height:0;pointer-events: none;}`;

    document.head.appendChild(styleEl);

    let testSpan = document.createElement('span');
    testSpan.id = id;

    document.body.appendChild(testSpan);

    const styleObj = getStyle(testSpan);

    const isSupport = !!styleObj && styleObj.zIndex === '-9999';

    document.head.removeChild(styleEl);
    document.body.removeChild(testSpan);
    styleEl = null;
    testSpan = null;

    canSupportCssVar.isSupport = isSupport;

    return isSupport;
}

/**
 * 检查是否支持webp格式图片
 *
 * @export
 * @returns 是否支持webp
 */
export function supportWebp() {
    try {
        return (
            document
                .createElement('canvas')
                .toDataURL('image/webp')
                .indexOf('data:image/webp') === 0
        );
    } catch (err) {
        return false;
    }
}

/**
 * 生成svg文本
 *
 * @export
 * @param {*} [{
 *   width = 300,
 *   height = 150,
 *   fontSize = 14,
 *   fontFamily = 'system-ui, sans-serif',
 *   color = '#a2a9b6',
 *   opacity = 1,
 *   x = 50,
 *   y = 50,
 *   content = 'svg测试文本',
 *   transform = 'rotate(0,0,0)'
 * }={}]
 * @return {String} svg字符串（未转义）
 */

/**
 * 加载css
 *
 * @export
 * @param {String} href css地址
 * @param {Object} [options={ rel: 'stylesheet' }] 额外options
 * @return {Promise}  promise实例
 */
export function loadCss(href, options = { rel: 'stylesheet' }) {
    return new Promise((resolve, reject) => {
        if (typeof href !== 'string')
            return reject('must specify href(string)');

        let link = document.createElement('link');
        link.href = href;

        const op = Object.assign({}, { rel: 'stylesheet' }, options);
        !isEmpty(op) &&
            Object.entries(op).forEach(([key, val]) => (link[key] = val));

        document.head.appendChild(link);

        link.onload = () => {
            link = null;
            resolve();
        };

        link.onerror = () => {
            document.head.removeChild(link);

            link = null;
            reject(new Error(`load css failed:${href}`));
        };
    });
}

/**
 * 加载js
 *
 * @export
 * @param {String} src script地址
 * @param {Object} [options={ type: 'text/javascript' }] 额外options
 * @return {Promise}  promise实例
 */
export function loadJs(src, options = { type: 'text/javascript' }) {
    return new Promise((resolve, reject) => {
        if (typeof src !== 'string') return reject('must specify src(string)');

        let script = document.createElement('script');
        script.src = src;

        const op = Object.assign({}, { type: 'text/javascript' }, options);
        !isEmpty(op) &&
            Object.entries(op).forEach(([key, val]) => (script[key] = val));

        document.body.appendChild(script);

        script.onload = () => {
            script = null;
            resolve();
        };

        script.onerror = () => {
            document.body.removeChild(script);
            script = null;

            reject(new Error(`load js failed:${src}`));
        };
    });
}
/**
 * @description 获取scrollbar 宽度
 */
export function getScrollbarWidth() {
    let scrollBarWidth = null;
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.width = '100px';
    outer.style.position = 'absolute';
    outer.style.top = '-9999px';
    document.body.appendChild(outer);

    const widthNoScroll = outer.offsetWidth;
    outer.style.overflow = 'scroll';

    const inner = document.createElement('div');
    inner.style.width = '100%';
    outer.appendChild(inner);

    const widthWithScroll = inner.offsetWidth;
    outer.parentNode.removeChild(outer);
    scrollBarWidth = widthNoScroll - widthWithScroll;

    return scrollBarWidth;
}
