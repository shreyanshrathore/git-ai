"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("ws");
var wss = new ws_1.WebSocketServer({
    port: 3002,
    // Add cors options
    perMessageDeflate: {
        zlibDeflateOptions: {
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
    }
});
// Add server startup confirmation
wss.on('listening', function () {
    console.log('WebSocket server started on port 3002');
});
// Store active connections by chat room
var chatRooms = new Map();
wss.on('connection', function (ws) {
    console.log('New client connected');
    ws.on('message', function (data) {
        var _a, _b, _c;
        try {
            var payload_1 = JSON.parse(data.toString());
            var chatId_1 = payload_1.chatId, message = payload_1.message;
            console.log('Server received message:', payload_1);
            console.log('Current chat rooms:', Array.from(chatRooms.keys()));
            // Add client to chat room if not already present
            if (!chatRooms.has(chatId_1)) {
                console.log('Creating new chat room:', chatId_1);
                chatRooms.set(chatId_1, new Set());
            }
            (_a = chatRooms.get(chatId_1)) === null || _a === void 0 ? void 0 : _a.add(ws);
            ws.chatId = chatId_1;
            // Log clients in the room
            console.log("Clients in room ".concat(chatId_1, ":"), (_b = chatRooms.get(chatId_1)) === null || _b === void 0 ? void 0 : _b.size);
            // Broadcast to all clients in the same chat room
            (_c = chatRooms.get(chatId_1)) === null || _c === void 0 ? void 0 : _c.forEach(function (client) {
                if (client !== ws && client.readyState === ws_1.WebSocket.OPEN) {
                    console.log('Broadcasting message to client in room:', chatId_1);
                    client.send(JSON.stringify(payload_1));
                }
            });
        }
        catch (error) {
            console.error('Error processing message:', error);
        }
    });
    ws.on('close', function () {
        var _a, _b;
        if (ws.chatId) {
            (_a = chatRooms.get(ws.chatId)) === null || _a === void 0 ? void 0 : _a.delete(ws);
            if (((_b = chatRooms.get(ws.chatId)) === null || _b === void 0 ? void 0 : _b.size) === 0) {
                chatRooms.delete(ws.chatId);
            }
        }
        console.log('Client disconnected');
    });
    ws.on('error', function (error) {
        var _a;
        console.error('WebSocket error:', error);
        if (ws.chatId) {
            (_a = chatRooms.get(ws.chatId)) === null || _a === void 0 ? void 0 : _a.delete(ws);
        }
    });
});
console.log('WebSocket server running on port 3002');
