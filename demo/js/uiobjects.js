/**
 * Created by waterflier on 11/7/15.
 */


function UIObject(isControl)
{
    this.ID = "";

    this.parentObject = null;
    this.ownerControl = null;
    this.ownerTree = null;

    this.childrenObjects = null;
    if(isControl)
        this.controlChildren = new Array();
    else
        this.controlChildren = null;

    this.objRect = new Rect();
    this.objRealRect = new Rect();
    this.objAbsRect = new Rect();
    this.objVisibleRect = new Rect(); //包裹矩形,用于VisibleRectIndexer (可见对象的快速选择)

    this.contentWidth = 0;
    this.contentHeight = 0;

    this.visible = true;
    this.childrenVisible = true;
    this._parentVisible = true;
    this.isLimitChild = false;
    this.ownerLimitRect = null;

    //this.enable = true;
    //this.childrenEnalbe = true;
    //this._parentEnable = true;

    this.renderType = 0;//0 不绘制 1 普通模式绘制
    //基础渲染控制
    this.alpha = 1.0;
    this.zorder = 0;
    this.absZorder = 0;

    //高级渲染控制，几乎所有参数都会影响VisibleRect
    this.maskInfo = null;
    this.transInfo = null; //TODO:由于无法支持翻转，暂时不是实现
    this.meshInfo = null;//
    this.effectInfo = null;

    //输入事件
    this.inputTarget = null;
    //其它事件
    this.events = null;
}

UIObject.prototype.invaildRect = function(dirtyRect)
{
    if(this.ownerTree)
    {
        if(dirtyRect)
        {
            var realDirtyRect = new Rect(this.objAbsRect.left + dirtyRect.left,this.objAbsRect.top + dirtyRect.top,this.objAbsRect.left + dirtyRect.right,this.objAbsRect.top + dirtyRect.bottom);
            this.ownerTree.pushDirtyRect(realDirtyRect)
        }
        else
        {
            this.ownerTree.pushDirtyRect(this.objVisibleRect);
        }
    }
};

UIObject.prototype.getVisibleRect = function()
{
    return this.objAbsRect;
};

UIObject.prototype.setAlpha = function(newAlpha)
{
    this.alpha = newAlpha;
    this.invaildRect(null);
}

UIObject.prototype.getChild = function(childPath)
{
    if(this.controlChildren == null)
        return null;

    sel = childPath.split(":");
    len = sel.length;
    parent = this;
    obj = null;
    for(i=0;i<len;++i)
    {
        obj = parent.controlChildren[sel[i]];
        if(obj)
        {
            parent = obj;
        }
        else
        {
            return null;
        }
    }
    return obj;
};

UIObject.prototype.getChildByID = function (childID ) {
    if(this.controlChildren == null)
        return null;

    return this.childrenObjects[childID]
}

UIObject.prototype.addChild = function(child,isLogicChild)
{
    function updateAddChild(child,owner)
    {
        if(owner.controlChildren) {
            if (child.ID.length > 0) {
                owner.controlChildren[child.ID] = child;
            }
        }
        child.ownerTree = owner.ownerTree;
        if(child.ownerTree)
        {
            dpi = child.ownerTree.dpi;
            child.objRect.left = child.objRealRect.left * dpi;
            child.objRect.top = child.objRealRect.top * dpi;
            child.objRect.right = child.objRealRect.right * dpi;
            child.objRect.bottom = child.objRealRect.bottom * dpi;
            parent = child.parentObject;
            if(parent) // TODO 这个判断恒成立
            {
                child.objAbsRect.left = child.objRect.left + parent.objAbsRect.left;
                child.objAbsRect.top = child.objRect.top + parent.objAbsRect.top;
                child.objAbsRect.right = child.objRect.right + parent.objAbsRect.left;
                child.objAbsRect.bottom = child.objRect.bottom + parent.objAbsRect.top;

                child.objVisibleRect.copyFrom(child.objAbsRect);
                child.ownerTree.pushDirtyRect(child.objVisibleRect);
                child.ownerTree.updateObjectForIndex(child);

                child.absZorder = parent.absZorder + 100 + child.zorder;
            }

        }
        console.log("OnBind",child.ID);

        if(child.childrenObjects) {
            len = child.childrenObjects.length;
            for (i = 0; i < len; ++i) {
                updateAddChild(child.childrenObjects[i], owner);
            }
        }

        console.log("OnInitControl",child.ID)
    };

    //已经是别人的孩子了，不能被再次添加
    if(child.ownerTree || child.parentObject)
        return false;

    //维持最基本的层次关系
    if(this.childrenObjects == null)
    {
        this.childrenObjects = new Array();
    }
    this.childrenObjects.push(child);
    child.parentObject = this;

    //处理名字空间
    if(isLogicChild)
    {
        if(this.controlChildren)
        {
            updateAddChild(child,this);
        }
    }
    else
    {
        owner = this.ownerControl;
        if(owner == null)
            owner = this;
        updateAddChild(child,owner);
    }

    return true;
};

UIObject.prototype.removeChild = function(child)
{
    function updateRemoveChild(child,owner)
    {
        if(child.ID.length > 0)
        {
            delete owner.controlChildren[child.ID]
        }

        if(child.ownerTree)
        {
            child.ownerTree.pushDirtyRect(child.objVisibleRect);
            child.ownerTree.updateObjectForIndex(child);
        }
    }

    if(child.parentObject != this)
        return false;

    len = this.childrenObjects.length;
    for(i=0;i<len;++i)
    {
        if(this.childrenObjects[i] == child)
        {
            this.childrenObjects[i] = this.childrenObjects[len-1];
            this.childrenObjects.pop();
            break;
        }
    }

    updateRemoveChild(child,child.ownerControl);
};

UIObject.prototype.moveObject = function(newPosRect)
{
    this.objRect = newPosRect;
    if(this.ownerTree)
    {
        //已绑定对象，需要触发事件
    }
    return true;
};

UIObject.prototype.setVisible = function(newVisible)
{
    var oldVisible = childObj.isVisible();
    this.visible = newVisible;
    if(childObj.isVisible() != oldVisible)
    {
        //update VisibleRectIndex
        if(this.ownerTree)
        {
            this.ownerTree.updateObjectForIndex(this)
        }
        //fireEvent
        console.log("abs visible changed",this.ID)
    }
    else
    {
        //fireEvent
        console.log("visible changed",this.ID)
    }

    return true;
};

UIObject.prototype.getVisible = function ()
{
    return this.visible;
};

UIObject.prototype.setChildrenVisbile = function(newChildrenVisible)
{
    function updateChildrenNewParentVisible(obj,parentVisible)
    {
        len = obj.childrenObjects.length;
        for(i=0;i<len;++i)
        {
            childObj = this.childrenObjects[i];
            var oldParentVisible = childObj._parentVisible;
            var newParentVisible = childObj.childrenVisible && parentVisible;
            if(oldParentVisible != newParentVisible)
            {
                var oldVisible = childObj.isVisible();
                childObj._parentVisible = newParentVisible;

                updateChildrenNewParentVisible(childObj,newParentVisible);
                if(childObj.isVisible() != oldVisible)
                {
                    //update VisibleRectIndex

                    //fireEvent
                    console.log("abs visible changed",childObj.ID)
                }
            }
        }
    }

    var oldParentVisible = this._parentVisible;
    this.childrenVisible = newChildrenVisible;
    var newParentVisible = this.childrenVisible && this._parentVisible;

    if (newParentVisible != oldParentVisible)
    {
        updateChildrenNewParentVisible(this,newParentVisible);
    }

    return true;
};

UIObject.prototype.getChildrenVisible = function()
{
    return this.childrenVisible;
};

UIObject.prototype.isVisible = function()
{
    return this.visible & this._parentVisible;
};
//--------------------------------------------------------------


UIObject.prototype.invalidObject = function()
{
    if(this.ownerTree)
    {
        return true;
    }
    else
    {
        return false;
    }
};

UIObject.prototype.isChild = function (obj)
{
    if(obj.parentObject == null)
    {
        return false;
    }

    if(obj.parentObject == this)
    {
        return true;
    }
    return false;
}

UIObject.prototype.isDescendant = function(obj)
{
    if(obj.parentObject)
    {
        if(obj.parentObject == this)
        {
            return true;
        }
        else
        {
            return this.isDescendant(obj.parentObject);
        }
    }
    else
    {
        return false;
    }
}



////////////////////////////////////////////////////
function ImageObject ()
{
    UIObject.call(this);
    this.renderType = 1;
    this.img = null;

}

ImageObject.prototype = new UIObject();
ImageObject.prototype.constructor = ImageObject;

/*
function createImageObject()
{
    var obj = {}
    obj.__proto__  = ImageObject.prototype;
    ImageObject(obj);
    return obj;
}
*/

ImageObject.prototype.setImageByPath = function(srcPath)
{
    this.img = new Image();
    this.img.src = srcPath;
    var uiobj = this;
    this.img.onload = function () {
        uiobj.invaildRect(null);
    }
};


ImageObject.prototype.draw = function(ctx,clipRect)
{
    console.log("image draw ",this.ID);
    if(this.img) {
        if(this.ownerLimitRect) {
            realClipRect = clipRect.intersectRect(this.ownerLimitRect);
            ctx.rect(realClipRect.left,realClipRect.top,realClipRect.getWidth(),realClipRect.getHeight());
            ctx.clip();
        }

        ctx.drawImage(this.img,this.objAbsRect.left,this.objAbsRect.top,this.objAbsRect.getWidth(),this.objAbsRect.getHeight());
    }
};

/////////////////////////////////////////////////////
function TextObject()
{
    UIObject.call(this);
    this.renderType = 1;
}

TextObject.prototype = new UIObject();
TextObject.prototype.constructor = TextObject;

TextObject.prototype.draw = function(ctx,clipRect)
{

};

//////////////////////////////////////////////////////






