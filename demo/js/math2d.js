/**
 * Created by waterflier on 2015-7-12.
 */


function Rect(left,top,right,bottom)
{
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
}

Rect.PT_LEFTUP_RECT   =0;
Rect.PT_MIDUP_RECT    =1;
Rect.PT_RIGHTUP_RECT  =2;
Rect.PT_LEFTMID_RECT  =3;
Rect.PT_MIDMID_RECT   =4;
Rect.PT_RIGHTMID_RECT =5;
Rect.PT_LEFTDOWN_RECT =6;
Rect.PT_MIDDOWN_RECT  =7;
Rect.PT_RIGHTDOWN_RECT=8;
Rect.IntersectTable  =
[
    [0,0,0,0,1,1,0,1,2],
    [0,0,0,1,1,1,1,1,1],
    [0,0,0,1,1,0,2,1,0],
    [0,1,1,0,1,1,0,1,1],
    [1,1,1,1,3,1,1,1,1],
    [1,1,0,1,1,0,1,1,0],
    [0,1,2,0,1,1,0,0,0],
    [0,1,1,1,1,1,0,0,0],
    [2,1,0,1,1,0,0,0,0]
];

Rect.prototype.getHeight = function()
{
    return this.bottom - this.top;
}

Rect.prototype.getWidth = function()
{
    return this.right - this.left;
}

Rect.prototype.isPointIn = function (x,y)
{
    if(x < this.left)
    {
        if(y < this.top)
        {
            return Rect.PT_LEFTUP_RECT;
        }
        else if(y >= this.bottom)
        {
            return Rect.PT_LEFTDOWN_RECT;
        }
        else
        {
            return Rect.PT_LEFTMID_RECT;
        }
    }
    else if(x >= this.right)
    {
        if(y < this.top)
        {
            return Rect.PT_RIGHTUP_RECT;
        }
        else if(y >= this.bottom)
        {
            return Rect.PT_RIGHTDOWN_RECT;
        }
        else
        {
            return Rect.PT_RIGHTMID_RECT;
        }
    }
    else
    {
        if(y < this.top)
        {
            return Rect.PT_MIDUP_RECT;
        }
        else if(y >= this.bottom)
        {
            return Rect.PT_MIDDOWN_RECT;
        }
        else
        {
            return Rect.PT_MIDMID_RECT;
        }
    }
};

Rect.prototype.isIntersectRect = function (rect2)
{
    var ptInRectLeftTop = this.isPointIn(rect2.left,rect2.top);
    var ptInRectRightBottom = this.isPointIn(rect2.right,rect2.bottom);

    return Rect.IntersectTable[ptInRectLeftTop][ptInRectRightBottom];
};

Rect.prototype.unionRect = function(rect2)
{
    left = Math.min(this.left,rect2.left);
    top = Math.min(this.top,rect2.top);
    right = Math.max(this.right,rect2.right);
    bottom = Math.max(this.bottom,rect2.bottom);

    return new Rect(left,top,right,bottom);
};

Rect.prototype.intersectRect = function(rect2)
{
    result = new Rect(0,0,0,0);
    result.left  = Math.max(this.left, rect2.left);
    result.right = Math.min(this.right, rect2.right);

    if (result.left < result.right)
    {
        result.top = Math.max(this.top, rect2.top);
        result.bottom = Math.min(this.bottom, rect2.bottom);

        if (result.top < result.bottom)
        {
            return new Rect(0,0,0,0);
        }

        return result;
    }
    else
    {
        return new Rect(0,0,0,0);
    }
};

Rect.prototype.copyFrom = function(rect2)
{
    this.left = rect2.left;
    this.top = rect2.top;
    this.right = rect2.right;
    this.bottom = rect2.bottom;
};

Rect.prototype.getWarpRectByTrans = function(transinfo)
{
    console.log("getWarpRectByTrans");
};
/*
var events = new Array();
events.push(function(a,b) {
        console.log("a+b",a,b)
    }
);

events.push(function(a,b) {
        console.log("a*b",a,b)
    }
);

function fireEvent(a,b)
{
    for(i=0;i<events.length;++i)
    {
        handler = events[i];
        handler(a,b)
    }
}
*/
//test code
function RectObject ()
{
    Rect.call(this);
    this.renderType = 1;
    this.img = null;

}


