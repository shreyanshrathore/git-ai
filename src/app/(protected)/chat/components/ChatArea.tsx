"use client";
import { Message, User } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Loader2 } from "lucide-react";
import { UserInfo } from "./UserInfo";
import useRefetch from "~/hooks/use-refetch";

interface ChatAreaProps {
  user: User;
  currChatData: Message[] | null;
  sendMessage: (message: string) => void;
  messageInput: string;
  setMessageInput: (message: string) => void;
  isLoading: Boolean;
}

const ChatArea = ({
  user,
  currChatData,
  sendMessage,
  messageInput,
  setMessageInput,
  isLoading,
}: ChatAreaProps) => {
    const refetch = useRefetch()
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
                  {/* SENDER AVATAR */}
                  {/* <div className="mt-1 w-10">
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
                  </div> */}
                  <div
                    className={`rounded-lg p-3 ${
                      message.senderId === user.id
                        ? "bg-slate-100"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                  {/* RECEIVER AVATAR */}
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

export default ChatArea;
