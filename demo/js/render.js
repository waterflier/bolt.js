
function CanvasRender(canvas,objtree)
{
    this.canvas = canvas;
    this.objtree = objtree;
}

CanvasRender.prototype.render = function(viewRect)
{
    uiobjects = this.objtree.selectObjectForRender(viewRect);
    len = uiobjects.length;
    ctx = this.canvas.getContext("2d");

    ctx.clearRect(viewRect.left,viewRect.top,viewRect.getWidth(),viewRect.getHeight());

    for(i=0;i<len;++i)
    {
        uiobj = uiobjects[i];
        if(!uiobj.getVisible())
            continue;

        ctx.globalAlpha = uiobj.alpha;
        ctx.rect(viewRect.left,viewRect.top,viewRect.getWidth(),viewRect.getHeight());
        ctx.clip();

        uiobj.draw(ctx,viewRect);
    }
};

