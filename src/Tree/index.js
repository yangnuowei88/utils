/**
 * @module Tree
 * @description 树形结构常用函数
 */
/**
 * @description list 数据结构 转换成 树结构
 * @param {Array} data 需要转换的数据
 * @param {String} id 节点 id
 * @param {String} pid 父级节点 id
 * @param {String} child 子树为节点对象的某个属性值
 * @param {Object} labels 需要新增的字段名集合 { label: 'category_name' }
 * @return {Array}
 *
 * @example
 * formatListToTree({data: [{id:1}, {id: 2}, {id: 3, pid: 1}]})
 * =>
 * [ { id: 1, children: [ {id: 3, pid: 1} ] }, { id: 2 } ]
 */
export function formatListToTree({
    data = [],
    id = 'id',
    pid = 'pid',
    child = 'children',
    labels = null,
}) {
    if (!Array.isArray(data)) {
        return [];
    }
    const isObject = obj =>
        Object.prototype.toString.call(obj) === '[object Object]';
    const arr = [];
    const tmpMap = {};
    const len = data.length;
    for (let i = 0; i < len; i++) {
        const val = data[i];
        if (val[id]) {
            tmpMap[val[id]] = val;
        }
        const item = isObject(labels)
            ? insertNewKeys(labels, data[i])
            : data[i];
        const node = tmpMap[item[pid]];
        if (node) {
            node[child] = node[child] || [];
            node[child].push(item);
        } else {
            arr.push(item);
        }
    }

    return arr;
}

/**
 * 向原始对象中新增属性
 * @param {Object} labels
 * @param {Object} obj
 */
function insertNewKeys(labels, obj) {
    const _obj = {};
    Object.keys(labels).forEach(key => {
        _obj[key] = obj[labels[key]];
    });
    return Object.assign(obj, _obj);
}
/**
 * @description list 数据结构 转换成 树结构
 * @param {Array} data 需要转换的数据
 * @param {object} options 配置信息
 * @param {String} id 节点 id
 * @param {String} pid 父级节点 id
 * @param {String} children 子树为节点对象的某个属性值
 * @param {String|number} root 指定根节点 value
 * @return {Array}
 *
 * @example
 * formatTree([{id:1, pid: 0}, {id: 2, pid: 0}, {id: 3, pid: 1}])
 * =>
 * [ { id: 1, pid: 0 children: [ {id: 3, pid: 1} ] }, { id: 2, pid: 0 } ]
 */
export function formatTree(data, options) {
    if (!Array.isArray(data)) {
        throw new Error('data is not `Array`');
    }

    const _options = Object.assign(
        {},
        {
            pid: 'pid',
            id: 'id',
            children: 'children',
            root: 0,
        },
        options
    );

    let parents = data.filter(p => p[_options.pid] === _options.root);
    let children = data.filter(c => c[_options.pid] !== _options.root);

    dataToTree(parents, children);

    function dataToTree(parents, children) {
        parents.forEach(p => {
            children.forEach((c, i) => {
                if (c[_options.pid] === p[_options.id]) {
                    let _c = JSON.parse(JSON.stringify(children));
                    _c.splice(i, 1);
                    dataToTree([c], _c);

                    if (p[_options.children]) {
                        p[_options.children].push(c);
                    } else {
                        p[_options.children] = [c];
                    }
                }
            });
        });
    }
    return parents;
}
