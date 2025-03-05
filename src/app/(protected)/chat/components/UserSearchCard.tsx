import { User } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

interface ChatAreaProps {
  user: User;
  activeUserId?: string;
  lastMessage?: string;
}

const UserSearchCard = ({ user, activeUserId, lastMessage }: ChatAreaProps) => {
  return (
    <div
      className={`cursor-pointer p-4 ${
        activeUserId === user.id
          ? "bg-slate-300 font-bold hover:bg-slate-200"
          : "hover:bg-slate-100"
      }`}
    >
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
          <p className="text-sm font-normal text-gray-500">
            {lastMessage || "Tap to start chat"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSearchCard;
