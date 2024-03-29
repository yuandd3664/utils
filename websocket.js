const WSS_URL = `wss://wss.xxxx.com/ws?appid=xxx`
let Socket = ''
let setIntervalWesocketPush = null

/**建立连接 */
export function createSocket() {
  if (!Socket) {
    console.log('建立websocket连接')
    Socket = new WebSocket(WSS_URL)
    Socket.onopen = onopenWS
    Socket.onmessage = onmessageWS
    Socket.onerror = onerrorWS
    Socket.onclose = oncloseWS
  } else {
    console.log('websocket已连接')
  }
}
/**打开WS之后发送心跳 */
export function onopenWS() {
  sendPing() //发送心跳
}
/**连接失败重连 */
export function onerrorWS() {
  clearInterval(setIntervalWesocketPush)
  Socket.close()
  createSocket() //重连
}
/**WS数据接收统一处理 */
export function onmessageWS(e) {
  window.dispatchEvent(new CustomEvent('onmessageWS', {
    detail: {
      data: e
    }
  }))
}
/**发送数据
 * @param eventType
 */
export function sendWSPush(eventTypeArr) {
  const obj = {
    appId: 'airShip',
    cover: 0,
    event: eventTypeArr
  }
  if (Socket !== null && Socket.readyState === 3) {
    Socket.close()
    createSocket() //重连
  } else if (Socket.readyState === 1) {
    Socket.send(JSON.stringify(obj))
  } else if (Socket.readyState === 0) {
    setTimeout(() => {
      Socket.send(JSON.stringify(obj))
    }, 3000)
  }
}
/**关闭WS */
export function oncloseWS() {
  clearInterval(setIntervalWesocketPush)
  console.log('websocket已断开')
}
/**发送心跳 */
export function sendPing() {
  Socket.send('ping')
  setIntervalWesocketPush = setInterval(() => {
    Socket.send('ping')
  }, 5000)
}

//简单版
let Socket = null;

function createSocket() {
  if (!Socket) {
    console.log('开始建立websocket连接')
    //判断浏览器是否支持websocket
    if('WebSocket' in window){
      Socket = new WebSocket('ws://192.168.115.141:8033/websocket');
    }
    Socket.onopen = onopenWS
    Socket.onmessage = onmessageWS
    Socket.onerror = onerrorWS
    Socket.onclose = oncloseWS
  } else {
    console.log('websocket已连接')
  }
}
//打开websocket
function onopenWS(event) {
  console.log('websocket连接成功');
}
//接收到ws的消息统一处理
function onmessageWS(e) {
  // console.log(e.data)
  let responseData = JSON.parse(e.data)
  window.dispatchEvent(new CustomEvent('onmessageWS', {
    detail: {
      data: responseData
    }
  }))
}
//关闭websocket
function oncloseWS(event) {
  console.log("websocket已断开");
}
//连接失败重连
function onerrorWS(event) {
  console.log("websocket通信发生错误");
  createSocket()
}



