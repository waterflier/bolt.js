
function ObjTree() {
    this.id = "";
    this.dpi = 96;
    this.rootObject = new UIObject(true);
    this.rootObject.ownerTree = this;
    this.rootObject.objRealRect = new Rect(0,0,0,0);
    this.rootObject.objAbsRect = new Rect(0,0,0,0);

    this.targetTouchObject = null;

    //index
    this.dirtyRectIndex = new SimpleDirtyRectIndex();
    this.objectRectIndex = new SimpleObjectIndex();
}

ObjTree.prototype.bindCanvasInputEvents = function (ownerCanvas) {
    ownerCanvas.onclick =  function onCanvasClick(eventdata) {
        console.log("oncanvasclick",eventdata.x,eventdata.y);
        this.dispatchInputAction((INPUTDEVICE_MOUSE<<16) | INPUT_ACTION_LBUTTON_UP,eventdata.x,eventdata.y,null);
    };
}

ObjTree.prototype.changeDPI = function(newDPI)
{
    if(newDPI == this.dpi)
        return false;

    this.dpi = newDPI;
    //TODO:����һ��
    return true
};

ObjTree.prototype.dispatchInputAction = function(actionType,arg1,arg2,eventdata)
{

    var DeviceType = actionType >> 16;
    Action = actionType & 0x0000ffff;
    if(DeviceType == INPUTDEVICE_MOUSE)
    {
        var X = arg1;
        var Y = arg2;

        var objlist = this.objectRectIndex.hitTest(X,Y);
        var len = objlist.length;

        for(var i=0;i<len;++i)
        {
            uiobject = objlist[i];
            if(uiobject.inputTarget)
            {
                pfun = uiobject.inputTarget[Action];
                if(pfun)
                {
                    if(uiobject.hitTest(X,Y)) {
                        if (pfun(X, Y)) {
                            break;
                        }
                    }
                }
            }
            return;
        }

    }
    else if(DeviceType == INPUTDEVICE_MAIN_TOUCH_SCREEN)
    {
        //uint32_t PointParam = (uint32_t) param1;
        var X = arg1;
        var Y = arg2;

        if(Action == INPUT_ACTION_TOUCH_DOWN)
        {
            var objlist = this.objectRectIndex.hitTest(X,Y);
            var len = objlist.length;

            for(var i=0;i<len;++i)
            {
                uiobject = objlist[i];
                if(uiobject.inputTarget)
                {
                    pfun = uiobject.inputTarget[Action];
                    if(pfun)
                    {
                        if(uiobject.hitTest(X,Y)) {
                            if (pfun(X, Y)) {
                                break;
                            }
                        }
                    }
                }
                /*
                if(pObj->pInputTarget)
                {
                    //find first response
                    InputTargetProcessAction(pObj->pInputTarget,pObj->hSelf,Action, X,Y,eventData);
                    pObjTree->hTargetTouchObject = hObj;
                    break;
                }*/
                return;
            }
        }
        else
        {
            if(this.targetTouchObject)
            {
                //
                if(Action == INPUT_ACTION_TOUCH_UP)
                {
                    this.targetTouchObject = null;
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

/*
* UIObject��û�б��󶨣��м�����Ҫ������
* �Ѱ󶨶���
* ��֧�ִ������桱�Ļ��ƣ�������һ�������Ļ���
* ��ͨ��getObjectByPath�ķ�ʽ�������ʵ�
* �ܽ���objTree���ɵ������¼�
* λ����ز����ᴥ���¼���
*   �κ�ʱ���޸��߼�λ�ö�Ӧ�ô����¼�?
*   ֻ���Ѱ󶨵Ķ���
* */

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
        if(uiobj.renderType == 1)
        {
            if(uiobj.objVisibleRect.isPointIn(x,y) == Rect.PT_MIDMID_RECT)
            {
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


