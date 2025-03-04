import { useEffect, useRef, useCallback } from 'react';
import { Message } from '@prisma/client';

interface WebSocketMessage {
  type: 'message';
  chatId: string;
  message: Message;
}

export const useWebSocket = (
  chatId: string | null,
  onMessageReceived: (message: Message) => void
) => {
  const ws = useRef<WebSocket | null>(null);

  const sendMessage = useCallback((message: Message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const payload: WebSocketMessage = {
        type: 'message',
        chatId: chatId!,
        message,
      };
      console.log('Client sending message:', payload);
      ws.current.send(JSON.stringify(payload));
    } else {
      console.warn('WebSocket not ready:', ws.current?.readyState);
    }
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    console.log("Initializing WebSocket for chatId:", chatId);
    
    try {
        // Connect to WebSocket server
        ws.current = new WebSocket('ws://localhost:3002');

        ws.current.onopen = () => {
            console.log('WebSocket connected for chatId:', chatId);
            // Send an explicit initialization message
            const initMessage = {
                type: 'init',
                chatId: chatId,
            };
            ws.current?.send(JSON.stringify(initMessage));
        };

        ws.current.onmessage = (event) => {
            console.log('Raw WebSocket message received:', event.data);
            try {
                const data = JSON.parse(event.data) as WebSocketMessage;
                console.log("Parsed WebSocket data:", data);
                console.log("Current chatId:", chatId);
                
                if (data.type === 'message' && data.chatId === chatId) {
                    console.log("Message matches current chat, calling onMessageReceived");
                    onMessageReceived(data.message);
                } else {
                    console.log("Message did not match current chat:",
                        `type=${data.type}`,
                        `messageChatId=${data.chatId}`,
                        `currentChatId=${chatId}`
                    );
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
                console.error('Raw message was:', event.data);
            }
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.current.onclose = (event) => {
            console.log('WebSocket closed for chatId:', chatId, 'Code:', event.code, 'Reason:', event.reason);
        };

    } catch (error) {
        console.error('Error creating WebSocket connection:', error);
    }

    // Cleanup on unmount
    return () => {
        if (ws.current) {
            console.log('Cleaning up WebSocket for chatId:', chatId);
            ws.current.close();
        }
    };
  }, [chatId, onMessageReceived]);

  return { sendMessage };
}; 