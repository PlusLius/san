/**
 * @file 创建 template 元素
 * @author errorrik(errorrik@gmail.com)
 */

var empty = require('../util/empty');
var createANode = require('../parser/create-a-node');
var removeEl = require('../browser/remove-el');

var NodeType = require('./node-type');
var genElementChildrenHTML = require('./gen-element-children-html');
var nodeInit = require('./node-init');
var nodeDispose = require('./node-dispose');
var isEndStump = require('./is-end-stump');
var createReverseNode = require('./create-reverse-node');
var elementDisposeChildren = require('./element-dispose-children');
var elementOwnToPhase = require('./element-own-to-phase');
var attachings = require('./attachings');
var elementUpdateChildren = require('./element-update-children');
var nodeOwnSimpleAttached = require('./node-own-simple-attached');
var nodeOwnOnlyChildrenAttach = require('./node-own-only-children-attach');
var LifeCycle = require('./life-cycle');

/**
 * 创建 template 元素
 *
 * @param {Object} options 初始化参数
 * @return {Object}
 */
function createTemplate(options) {
    var node = nodeInit(options);

    node.lifeCycle = LifeCycle.start;
    node.children = [];

    node.nodeType = NodeType.TPL;

    node.attach = nodeOwnOnlyChildrenAttach;
    node.dispose = templateOwnDispose;


    node._toPhase = elementOwnToPhase;
    node._getEl = empty;
    node._attachHTML = templateOwnAttachHTML;
    node._attached = nodeOwnSimpleAttached;
    node._update = templateOwnUpdate;

    // trim children blank text node
    var aNodeChildren = node.aNode.children;
    var len = aNodeChildren.length;
    if (len) {
        if (aNodeChildren[--len].isText) {
            aNodeChildren.length = len;
        }

        if (len && aNodeChildren[0].isText) {
            aNodeChildren.splice(0, 1);
        }
    }

    // #[begin] reverse
    if (options.walker) {
        each(node.aNode.children, function (aNodeChild) {
            var child = createReverseNode(aNodeChild, options.walker, node);
            if (!child._static) {
                node.children.push(child);
            }
        });

        attachings.add(node);
    }
    // #[end]

    return node;
}

/**
 * 视图更新函数
 *
 * @param {Array} changes 数据变化信息
 */
function templateOwnUpdate(changes) {
    elementUpdateChildren(this, changes);
}

/**
 * attach 元素的 html
 *
 * @param {Object} buf html串存储对象
 */
function templateOwnAttachHTML(buf) {
    genElementChildrenHTML(this, buf);
    attachings.add(this);
}

/**
 * 销毁释放
 *
 * @param {Object=} options dispose行为参数
 */
function templateOwnDispose(options) {
    elementDisposeChildren(this, options);

    nodeDispose(this);
}

exports = module.exports = createTemplate;
