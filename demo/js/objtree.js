
function ObjTree() {
    this.id = "";
    this.dpi = 96;
    this.rootObject = new UIObject(true);
    this.rootObject.ownerTree = this;
    this.rootObject.objRealRect = new Rect(0,0,0,0);
    this.rootObject.objAbsRect = new Rect(0,0,0,0);

    //index
    this.dirtyRectIndex = new SimpleDirtyRectIndex();
    this.objectRectIndex = new SimpleObjectIndex();
}

ObjTree.prototype.changeDPI = function(newDPI)
{
    if(newDPI == this.dpi)
        return false;

    this.dpi = newDPI;
    //TODO:����һ��
    return true
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
        //this.objIndex[obj] = obj.getVisibleRect();
        this.objIndex.push(obj);//TODO: 如何快速找到已经存在的对象
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
    for(var i in this.objIndex)
    {
        uiobj = this.objIndex[i];
        if(uiobj.renderType == 1)
        {
            if(viewRect.isIntersectRect(uiobj.objVisibleRect))
            {
                result.push(uiobj);
            }
        }
    }

    result.sort(function(lhs,rhs){
        return lhs.absZorder - rhs.absZorder;
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


