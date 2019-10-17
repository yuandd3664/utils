// var http = require("http");
// console.log('hello')
// http.createServer(function(request, response) {
//     console.log(request)
//     // response.writeHead(200, {"Content-Type": "text/plain"});
//     // response.write("Hello World");
//     // response.end();
// }).listen(8888);

var WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({port: 8888});
wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        console.log('received: %s', message);
    });
    ws.send('something');
});