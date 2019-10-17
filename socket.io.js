/* ========================================
 *  company : Dilusense
 *   author : Kuangch
 *     date : 2018/12/26
 * ======================================== */

import ENV from '../environment/env.config'
let vars = {}
let listeners = {}

// socket 协议
vars.PROTOCOLS = {
    WIFI_SCAN_RESULT: 'wifi_scan_result',
    FAST_CAPTURE_RESULT: 'fast_capture_result',
    _3D_CAPTURE_PROGRESS: '3d_capture_progress',
    _3D_CAPTURE_RESULT: '3d_capture_result',
    GET_IC_NO_RESULT:'get_ic_no_result'
}

vars.io = {
    on: function(eventName, eventCallback){
        listeners[eventName] = eventCallback
    },
    removeAllListeners: function(eventName){
        if(eventName){
            eventName in listeners && delete listeners[eventName]
        }else{
            listeners = {}
        }
    },
    connect:function(ws){
        createWebSocket(Object.assign(ws,ws_common))
    },
    destroy:function (ws) {
        ws.destroyed=true;
        try {
            ws.instance.close();
        } catch(e) {
            console.error(e);
        }
    }
}

let ws_common = {
    reconnect:{
        lock : false, //避免重复连接
        tt: null,
        interval: 1000 * 3,
    },
    heartCheck:{
        interval:1000 * 5,
        timeoutObj: null,
        serverTimeoutObj: null
    }
}
let wss = {
    push:{
        instance: null,
        protocol: 'push',
        destroyed:false,
    }
}

vars.io.wss=wss;

// 创建web socket
function createWebSocket(ws) {
    try {
        ws.instance = new WebSocket(`ws://${window.location.hostname}:${ENV.websocket_port}`,ws.protocol)
        initEvents(ws);
    } catch(e) {
        console.error(e);
        reconnect(ws);
    }
}

// 初始化事件
function initEvents(ws){

    if(!ws.instance)
        return

    ws.instance.onopen = function(){
        // heartCheck(ws);

        console.log(`ws(${ws.protocol}) connected`)
        let listenerName = `${ws.protocol}_connect`
        listenerName in listeners && listeners[listenerName]()
    }

    ws.instance.onmessage = function(event){
        // heartCheck(ws);

        if(event.data && 'ping' !== event.data){
            try {
                Object.defineProperty(event, "data", {
                    writable: false,
                    value: JSON.parse(event.data)
                });
                event.data.type && event.data.type in listeners && listeners[event.data.type](event)
            } catch (e) {
                console.warn(e)
            }
        }
    }

    ws.instance.onclose = function(){
        console.warn(`ws(${ws.protocol}) close`)
        let listenerName = `${ws.protocol}_disconnect`
        listenerName in listeners && listeners[listenerName]()

        reconnect(ws);
    }

    ws.instance.onerror = function(){
        console.error(`ws(${ws.protocol}) error`)
        let listenerName = `${ws.protocol}_error`
        listenerName in listeners && listeners[listenerName]()

        reconnect(ws);
    }
}

// 重连
function reconnect(ws) {
    if(ws.reconnect.lock) {
        return;
    }
    if(ws.destroyed){
        ws.destroyed=false;
        return;
    }
    ws.reconnect.lock = true;
    //没连接上会一直重连，设置延迟避免请求过多
    ws.reconnect.tt && clearTimeout(ws.reconnect.tt);
    ws.reconnect.tt = setTimeout(function () {
        console.warn(`ws(${ws.protocol}): reconnect`)
        createWebSocket(ws);
        ws.reconnect.lock = false;
    }, ws.reconnect.interval);
}


//心跳检测
function heartCheck(ws){
    ws.heartCheck.timeoutObj && clearTimeout(ws.heartCheck.timeoutObj);
    ws.heartCheck.serverTimeoutObj && clearTimeout(ws.heartCheck.serverTimeoutObj);
    ws.heartCheck.timeoutObj = setTimeout(function(){
        //这里发送一个心跳，后端收到后，返回一个心跳消息，
        console.log(`ws(${ws.protocol}): ping`);
        ws.instance.send("ping");
        ws.heartCheck.serverTimeoutObj = setTimeout(function() {
            console.log(`ws(${ws.protocol}): close`);
            ws.instance.close();
        }, ws.heartCheck.interval + 100);

    }, ws.heartCheck.interval)
}

//createWebSocket(Object.assign(wss.push,ws_common))

export default {
    ...vars
}