/**
 * ----------------------------------------------------------
 * 拖拽数据模型
 * @version  1.0
 * @author cqh <cqh@corp.netease.com>
 * @module pool/component-drag-drop/src/dragDrop
 *
 */
NEJ.define([
],function(

){
    var dragdrop = {
        dragging: false,
        data: null,
        proxy: null,
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        pageX: 0,
        pageY: 0,
        movementX: 0,
        movementY: 0,
        droppable: null,
        droppables: []
    };
    return dragdrop;
});
