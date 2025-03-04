import { WebSocket, WebSocketServer } from 'ws';
import { Message } from '@prisma/client';

interface ChatMessage {
    type: 'message';
    chatId: string;
    message: Message;
}

interface WebSocketClient extends WebSocket {
    chatId?: string;
}

const wss = new WebSocketServer({ 
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
wss.on('listening', () => {
    console.log('WebSocket server started on port 3002');
});

// Store active connections by chat room
const chatRooms = new Map<string, Set<WebSocketClient>>();

wss.on('connection', (ws: WebSocketClient) => {
    console.log('New client connected');

    ws.on('message', (data) => {
        try {
            const payload = JSON.parse(data.toString()) as ChatMessage;
            const { chatId, message } = payload;
            console.log('Server received message:', payload);
            console.log('Current chat rooms:', Array.from(chatRooms.keys()));
            
            // Add client to chat room if not already present
            if (!chatRooms.has(chatId)) {
                console.log('Creating new chat room:', chatId);
                chatRooms.set(chatId, new Set());
            }
            chatRooms.get(chatId)?.add(ws);
            ws.chatId = chatId;

            // Log clients in the room
            console.log(`Clients in room ${chatId}:`, chatRooms.get(chatId)?.size);

            // Broadcast to all clients in the same chat room
            chatRooms.get(chatId)?.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    console.log('Broadcasting message to client in room:', chatId);
                    client.send(JSON.stringify(payload));
                }
            });
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        if (ws.chatId) {
            chatRooms.get(ws.chatId)?.delete(ws);
            if (chatRooms.get(ws.chatId)?.size === 0) {
                chatRooms.delete(ws.chatId);
            }
        }
        console.log('Client disconnected');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        if (ws.chatId) {
            chatRooms.get(ws.chatId)?.delete(ws);
        }
    });
});

console.log('WebSocket server running on port 3002');