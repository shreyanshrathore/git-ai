"use client";
import { Message, User } from "@prisma/client";
import { useEffect, useState } from "react";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { useWebSocket } from "~/hooks/use-websocket";
import { Search } from "./components/Search";
import ChatArea from "./components/ChatArea";
import UserSearchCard from "./components/UserSearchCard";
const ChatPage = () => {
  const [search, setSearch] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [messageInput, setMessageInput] = useState("");
  const [currentChat, setCurrentChat] = useState<{
    chatId: string | null;
    receiver: User | null;
    messages: Message[] | null;
  }>({
    chatId: null,
    receiver: null,
    messages: null,
  });

  const { data: allChats } = api.user.getAllChats.useQuery();
  const sendMessageMutation = api.user.sendMessage.useMutation();

  const { data: messagesData, isLoading } =
    api.user.getMessageByChatId.useQuery(
      currentChat?.chatId ? { chatId: currentChat.chatId } : { chatId: "" },
      {
        enabled: !!currentChat?.chatId,
      },
    );
  useEffect(() => {
    if (messagesData?.messages) {
      setCurrentChat((prev) => ({
        ...prev,
        messages: messagesData.messages,
      }));
    }
  }, [messagesData?.messages]);
  // Keep this for hotkey shortcut / ok?
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  const fetchMessage = (chatId: string, receiver: User) => {
    setCurrentChat({ receiver, chatId, messages: messagesData?.messages! });
  };
  const sendMessage = (message: string) => {
    if (messageInput.length > 0) {
      sendMessageMutation.mutate(
        {
          chatId: currentChat.chatId!,
          content: message,
        },
        {
          onSuccess: (newMessage) => {
            setMessageInput("");
            setCurrentChat((prev) => ({
              ...prev,
              messages: [...(prev.messages || []), newMessage],
            }));
            sendWebSocketMessage(newMessage);
          },
        },
      );
    }
  };

  const handleNewMessage = (message: Message) => {
    console.log("message received", message);
    setCurrentChat((prev) => ({
      ...prev,
      messages: [...(prev.messages || []), message],
    }));
  };

  const { sendMessage: sendWebSocketMessage } = useWebSocket(
    currentChat.chatId,
    handleNewMessage,
  );
  return (
    <div className="h-full">
      <div className="flex h-full">
        <div className="flex w-1/3 flex-col border-r">
          <div className="p-4">
            <Input
              type="search"
              placeholder="Type / to search users"
              className="w-full"
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchOpen(true)}
            />
            <Search searchOpen={searchOpen} setSearchOpen={setSearchOpen} />
          </div>

          <div className="flex-1 overflow-y-auto">
            {allChats?.map((chat, index) => (
              <div
                key={index}
                onClick={() => fetchMessage(chat.chat.id!, chat.senders[0]!)}
              >
                <UserSearchCard user={chat.senders[0]!} />
              </div>
            ))}
          </div>
        </div>
        {/* Chat area */}
        {currentChat.receiver && (
          <ChatArea
            user={currentChat.receiver}
            currChatData={currentChat.messages}
            sendMessage={sendMessage}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
