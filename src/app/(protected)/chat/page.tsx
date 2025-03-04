"use client";
import { Message, User } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { useWebSocket } from "~/hooks/use-websocket";
import { Loader2 } from "lucide-react";
import { UserInfo } from "./components/UserInfo";
import { Search } from "./components/Search";
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
        {" "}
        {/* Adjusted height to account for header */}
        {/* Sidebar with user search */}
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

const UserSearchCard = ({ user }: { user: User }) => {
  return (
    <div className="cursor-pointer p-4 hover:bg-slate-100">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={user.imageUrl as string} />
          <AvatarFallback>
            {user.firstName?.charAt(0).toUpperCase()! +
              user.lastName?.charAt(0).toUpperCase()!}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.emailAddress}</p>
          <p className="text-sm text-gray-500">Last message...</p>
        </div>
      </div>
    </div>
  );
};

const ChatArea = ({
  user,
  currChatData,
  sendMessage,
  messageInput,
  setMessageInput,
  isLoading,
}: {
  user: User;
  currChatData: Message[] | null;
  sendMessage: (message: string) => void;
  messageInput: string;
  setMessageInput: (message: string) => void;
  isLoading: Boolean;
}) => {
  const [userInfoOpen, setUserInfoOpen] = useState<boolean>(false);
  const onSave = (data: any) => {
    console.log(data);
  };
  const endRef = useRef(null);
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
    console.log(currChatData, "currchatdata");
  }, [currChatData]);
  return (
    <div className="flex flex-1 flex-col">
      <UserInfo
        userInfoOpen={userInfoOpen}
        setUserInfoOpen={setUserInfoOpen}
        user={user}
        onSave={onSave}
      />
      <div className="border-b p-4">
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => setUserInfoOpen((prev) => (prev ? false : true))}
        >
          <Avatar>
            <AvatarImage src={user.imageUrl as string} />
            <AvatarFallback>
              {user.firstName?.charAt(0).toUpperCase()! +
                user.lastName?.charAt(0).toUpperCase()!}
            </AvatarFallback>
          </Avatar>
          <p className="font-medium">
            {user.firstName} {user.lastName}
          </p>
        </div>
      </div>

      {!isLoading && (
        <div className="flex-1 overflow-y-auto p-4">
          {/* Messages will go here */}
          <div className="space-y-[2px]">
            {currChatData?.map((message, index) => {
              const isSameSenderAsPrevious =
                index > 0 &&
                currChatData[index - 1]?.senderId === message.senderId;

              return (
                <div
                  key={message.id}
                  className={`flex items-start ${
                    message.senderId === user.id ? "" : "justify-end"
                  }`}
                >
                  <div className="mt-1 w-10">
                    {!isSameSenderAsPrevious &&
                      message.senderId === user.id && (
                        <Avatar>
                          <AvatarImage src={user.imageUrl as string} />
                          <AvatarFallback>
                            {user.firstName?.charAt(0).toUpperCase()! +
                              user.lastName?.charAt(0).toUpperCase()!}
                          </AvatarFallback>
                        </Avatar>
                      )}
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      message.senderId === user.id
                        ? "bg-slate-100"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                  {/* <div className="mt-1 w-10">
                    {!isSameSenderAsPrevious &&
                      message.senderId !== user.id && (
                        <Avatar>
                          <AvatarFallback>ME</AvatarFallback>
                        </Avatar>
                      )}
                  </div> */}
                </div>
              );
            })}

            <div ref={endRef}></div>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="w-full, flex h-full items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      )}

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            className="flex-1"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage(messageInput);
              }
            }}
          />
          <Button onClick={() => sendMessage(messageInput)}>Send</Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
