import { User } from "@prisma/client";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

import { useKey } from "~/hooks/use-key";
import { api } from "~/trpc/react";

interface SearchProps {
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

export function Search({ searchOpen, setSearchOpen }: SearchProps) {
  useKey({ key: "k", metaKey: true }, () => setSearchOpen(true));
  useKey({ key: "k", ctrlKey: true }, () => setSearchOpen(true));

  const [search, setSearch] = useState("");

  const allUsers = api.user.getUsers.useQuery({ firstName: search });

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="h-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Info</DialogTitle>
        </DialogHeader>
        <Input
          type="search"
          placeholder=""
          className="w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* User list rendering */}
        <div
          className={`mt-4 ${
            allUsers.data?.length ? "max-h-[40vh] overflow-y-auto" : "h-auto"
          }`}
        >
          {allUsers.isLoading && <p>Loading users...</p>}
          {allUsers.isError && <p>Error loading users.</p>}
          {allUsers.data?.length ? (
            <ul className="space-y-2">
              {allUsers.data.map((user) => (
                <UserSearchCard key={user.id} user={user} />
              ))}
            </ul>
          ) : (
            !allUsers.isLoading && (
              <p className="text-gray-500">No users found.</p>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
          <p className="font-medium">{user.firstName + " " + user.lastName} </p>
          <p className="text-sm text-gray-500">Last message...</p>
        </div>
      </div>
    </div>
  );
};
