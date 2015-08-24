
function ObjTree() {
    this.id = "";
    this.dpi = 96;
    this.rootObject = new UIObject(true);
    this.rootObject.ownerTree = this;
    this.rootObject.objRealRect = new Rect(0,0,0,0);
    this.rootObject.objAbsRect = new Rect(0,0,0,0);

    this.targetTouchObject = null;
    this.focusObject = null;
    this.captureMouseObject = null;

    //index
    this.dirtyRectIndex = new SimpleDirtyRectIndex();
    this.objectRectIndex = new SimpleObjectIndex();
}

ObjTree.prototype.bindCanvasInputEvents = function (ownerCanvas) {
    var objtree = this;
    ownerCanvas.onmousedown =  function onCanvasClick(eventdata) {
        console.log("on canvas down",eventdata.x,eventdata.y);
        objtree.dispatchInputAction(INPUT_ACTION_LBUTTON_DOWN,eventdata.x,eventdata.y,null);
    };
    ownerCanvas.onmousemove =  function onCanvasClick(eventdata) {
        console.log("on canvas move",eventdata.x,eventdata.y);
        objtree.dispatchInputAction(INPUT_ACTION_MOUSE_MOVE,eventdata.x,eventdata.y,null);
    };
    ownerCanvas.onmouseup =  function onCanvasClick(eventdata) {
        console.log("on canvas move",eventdata.x,eventdata.y);
        objtree.dispatchInputAction(INPUT_ACTION_LBUTTON_UP,eventdata.x,eventdata.y,null);
    };
};

ObjTree.prototype.changeDPI = function(newDPI) {
    if (newDPI == this.dpi)
        return false;

    this.dpi = newDPI;
    //TODO: 修改所有对象的像素位置
    return true
};

ObjTree.prototype.setFocus = function(newObject) {
    if (this.focusObject != newObject) {
        var old = this.focusObject;
        this.focusObject = newObject;
        //TODO fireEvent
    }
};

ObjTree.prototype.captureMouse = function(newObject) {
    if (this.captureMouseObject != newObject) {
        this.captureMouseObject = newObject;
    }
};

ObjTree.prototype.dispatchInputAction = function(actionType,arg1,arg2,eventdata) {

    var DeviceType = actionType >> 16;
    if (DeviceType == INPUTDEVICE_MOUSE) {
        var X = arg1;
        var Y = arg2;

        //TODO:处理鼠标捕获


        var objlist = this.objectRectIndex.hitTest(X, Y);
        var len = objlist.length;

        for (var i = 0; i < len; ++i) {
            uiobject = objlist[i];
            if (uiobject.inputTarget) {
                if (uiobject.hitTest(X, Y)) {
                    if (uiobject.inputTarget.putAction(actionType, arg2, arg2, eventdata)) {
                        if (actionType == INPUT_ACTION_LBUTTON_DOWN || actionType == INPUT_ACTION_RBUTTON_DOWN || actionType == INPUT_ACTION_MBUTTON_DOWN) {
                            this.setFocus(uiobject)
                        }
                        return;
                    }
                }
            }
        }
    }
};

ObjTree.prototype.pushDirtyRect = function(dirtyRect)
{
   return this.dirtyRectIndex.pushRect(dirtyRect);
};

ObjTree.prototype.getDirtyRectList = function()
{
    return this.dirtyRectIndex.getDirtyRectList();
};

ObjTree.prototype.selectObjectForRender = function(viewRect)
{
    return this.objectRectIndex.selectObjectForRender(viewRect);
};

ObjTree.prototype.updateObjectForIndex = function(obj)
{
    return this.objectRectIndex.updateObject(obj);
};

ObjTree.prototype.getRootObject = function()
{
    return this.rootObject;
};


/////////////////////////////////////////////////////////
function SimpleObjectIndex ()
{
    this.objIndex = new Array();
}

SimpleObjectIndex.prototype.updateObject = function(obj)
{
    if(obj.isVisible())
    {
        this.objIndex[obj] = obj;
        //this.objIndex.push(obj);//TODO: 如何快速找到已经存在的对象
        console.log(obj.ID);
    }
    else
    {
        delete this.objIndex[obj];
    }
};

SimpleObjectIndex.prototype.selectObjectForRender = function(viewRect)
{
    result = new Array();
    for(var handle in this.objIndex)
    {
        uiobj = this.objIndex[handle];
        if(uiobj.renderType == 1)
        {
            if(viewRect.isIntersectRect(uiobj.objVisibleRect))
            {
                result.push(uiobj);
            }
        }
    }

    //zorder 从小到大
    result.sort(function(lhs,rhs){
        return lhs.absZorder - rhs.absZorder;
    });

    return result;
};

SimpleObjectIndex.prototype.hitTest = function(x,y)
{
    result = new Array();
    for(var handle in this.objIndex)
    {
        uiobj = this.objIndex[handle];
        if(uiobj.getVisible()) {
            if (uiobj.objVisibleRect.isPointIn(x, y) == Rect.PT_MIDMID_RECT) {
                result.push(uiobj);
            }
        }
    }

    //zorder从大到小
    result.sort(function(lhs,rhs){
        return rhs.absZorder - lhs.absZorder;
    });

    return result;
};


////////////////////////////////////////////////////

function SimpleDirtyRectIndex ()
{
    this.currentRect = null;
}

SimpleDirtyRectIndex.prototype.pushRect = function(dirtyRect)
{
    if(this.currentRect)
    {
        this.currentRect = this.currentRect.unionRect(dirtyRect);
    }
    else
    {
        this.currentRect = dirtyRect;
    }
};

SimpleDirtyRectIndex.prototype.getDirtyRectList = function()
{
    result = null;
    if(this.currentRect)
    {
        result =  [this.currentRect];
        this.currentRect = null;
    }

    return result;
};


