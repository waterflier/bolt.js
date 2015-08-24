/**
 * Created by waterflier on 2015/8/14.
 */

//鼠标

INPUTDEVICE_MOUSE = 1;
INPUT_ACTION_LBUTTON_DOWN  =1|(INPUTDEVICE_MOUSE<<16);
INPUT_ACTION_LBUTTON_UP    =2|(INPUTDEVICE_MOUSE<<16);
INPUT_ACTION_LBUTTON_DBCLICK =3|(INPUTDEVICE_MOUSE<<16);
INPUT_ACTION_RBUTTON_DOWN    =4|(INPUTDEVICE_MOUSE<<16);
INPUT_ACTION_RBUTTON_UP      =5|(INPUTDEVICE_MOUSE<<16);
INPUT_ACTION_RBUTTON_DBCLICK =6|(INPUTDEVICE_MOUSE<<16);
INPUT_ACTION_MBUTTON_DOWN    =7|(INPUTDEVICE_MOUSE<<16);
INPUT_ACTION_MBUTTON_UP      =8|(INPUTDEVICE_MOUSE<<16);
INPUT_ACTION_MBUTTON_DBCLICK =9|(INPUTDEVICE_MOUSE<<16);

INPUT_ACTION_MOUSE_MOVE      =10|(INPUTDEVICE_MOUSE<<16);
INPUT_ACTION_MOUSE_HOVER     =11|(INPUTDEVICE_MOUSE<<16);
INPUT_ACTION_MOUSE_ENTER     =12|(INPUTDEVICE_MOUSE<<16);
INPUT_ACTION_MOUSE_LEAVE     =13|(INPUTDEVICE_MOUSE<<16);

INPUT_ACTION_MOUSE_WHEEL     =14|(INPUTDEVICE_MOUSE<<16);


//按键-标准101键盘
INPUTDEVICE_STANDARD_KEYBOARD =2;
INPUT_ACTION_KEYBOARD_DOWN   =20|(INPUTDEVICE_STANDARD_KEYBOARD<<16);
INPUT_ACTION_KEYBOARD_UP     =21|(INPUTDEVICE_STANDARD_KEYBOARD<<16);
INPUT_ACTION_KEYBOARD_CHAR   =22|(INPUTDEVICE_STANDARD_KEYBOARD<<16);
INPUT_ACTION_KEYBOARD_HOTKEY =23|(INPUTDEVICE_STANDARD_KEYBOARD<<16);


//按键-标准设备按键
INPUTDEVICE_STANDARD_DEVICE_BUTTON =3;

//主触摸屏
INPUTDEVICE_MAIN_TOUCH_SCREEN =4;
INPUT_ACTION_TOUCH_DOWN =50|(INPUTDEVICE_MAIN_TOUCH_SCREEN<<16);  //value x|y param:null data:null
INPUT_ACTION_TOUCH_MOVE  =51|(INPUTDEVICE_MAIN_TOUCH_SCREEN<<16); //value x|y param:null data:null
INPUT_ACTION_TOUCH_UP   =52|(INPUTDEVICE_MAIN_TOUCH_SCREEN<<16); //value x|y param:null data:null
INPUT_ACTION_TOUCH_ONE_DOWN =53|(INPUTDEVICE_MAIN_TOUCH_SCREEN<<16); //value  x|y
INPUT_ACTION_TOUCH_ONE_UP =54|(INPUTDEVICE_MAIN_TOUCH_SCREEN<<16); //value x|y

INPUT_EVENT_BEGIN = 1|(INPUTDEVICE_MOUSE<<16);
INPUT_EVENT_END = INPUT_ACTION_TOUCH_ONE_UP;
////////////////////////////////////////////////////////////////////////////////////////////
function EventContainer(eventname)
{
    this.eventname = eventname;
    this.listeners = new Array();
    this.cookie = 0;
}

EventContainer.prototype.getName = function()
{
    return this.eventname;
};

EventContainer.prototype.toString = function()
{
    return this.eventname;
};

EventContainer.prototype.attach = function(listener)
{
    this.cookie = this.cookie + 1;
    this.listeners[this.cookie] = listener;
    return this.cookie;
};

EventContainer.prototype.remove = function(cookie)
{
    if(this.listeners[cookie])
    {
        delete this.listeners[cookie];
        return true;
    }

    return false;
};

EventContainer.prototype.fire = function()
{
    var args = Array.prototype.slice.call(arguments);
    for(var lid in this.listeners)
    {
        func = this.listeners[lid];
        func.apply(func,args);//TODO: 通过给EventContainer添加状态，可以支持 事件返回值,调用拦截，中断等
    }
};
//////////////////////////////////////////////////////////////////////////////////
function InputTarget()
{
    this.allContainers = [];
}

InputTarget.prototype.putAction = function(actiontype,arg1,arg2,data)
{
    var container = this.allContainers[actiontype];
    if(container == null){
        return true;
    }
    var deviceType = actiontype >> 16;
    if(deviceType == INPUTDEVICE_MOUSE) {
        container.fire(actiontype,arg1,arg2);
        return true;
    }

    return true;
};

InputTarget.prototype.attachListener = function(eventName,func)
{
    var container = this.allContainers[eventName];
    if(container == null){
        container = new EventContainer(eventName);
        this.allContainers[eventName] = container;
    }
    return container.attach(func);
};

InputTarget.prototype.removeListener = function(eventName,cookie)
{
    var container = this.allContainers[eventName];
    if(container == null){
        return false;
    }
    return container.remove(cookie);
};


//-----------Demo Code，演示了传递任意参数的函数调用，不过这样的写法感觉性能好差----------
var fun = function (x,y)
{
    var args = arguments;
    console.log(x,y)
};

var foo = function ()
{
    var args = Array.prototype.slice.call(arguments);
    fun.apply(fun,args);
    //fun(args);
};


function testEventContainer()
{
    testContainer = new EventContainer("test");
    var ck1 = testContainer.attach(fun);
    testContainer.fire(100,200);
    testContainer.remove(ck1);
    testContainer.fire(200,300);
}

testEventContainer();