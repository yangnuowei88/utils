/**
 * @module Vue
 * @description Vue 基础工具库
 */

/**
 * @description  Vue查找祖先组件
 * @param {Object} context VUE实例对象
 * @param {string|Array} componentName 组件名称
 */
export function findParentComponent(context, componentName) {
    if (typeof componentName === 'string') {
        componentName = [componentName];
    }
    let parent = context.$parent;
    let name = parent.$options.name;
    while (parent && (!name || componentName.indexOf(name) < 0)) {
        parent = parent.$parent;
        if (parent) name = parent.$options.name;
    }
    return parent;
}
