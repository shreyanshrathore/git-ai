import { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Edit, Save } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import { User } from "@prisma/client";
import { toast } from "sonner";
interface UserInfoProps {
  userInfoOpen: boolean;
  setUserInfoOpen: (open: boolean) => void;
  user: User;
  onSave: (updatedUser: Partial<UserInfoProps["user"]>) => void;
}

export function UserInfo({
  userInfoOpen,
  setUserInfoOpen,
  user,
  onSave,
}: UserInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  const handleInputChange = (
    key: keyof typeof editedUser,
    value: string | number,
  ) => {
    setEditedUser((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    onSave(editedUser);
  };

  return (
    <Dialog open={userInfoOpen} onOpenChange={setUserInfoOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Info</DialogTitle>
          <DialogDescription>Details of the user</DialogDescription>
        </DialogHeader>

        <Card className="max-w-sm">
          <CardHeader>
            <div className="flex items-center">
              <img
                src={user.imageUrl || "/placeholder-image.png"}
                alt="User Avatar"
                className="h-16 w-16 rounded-full border"
              />
              <div className="ml-4">
                {isEditing ? (
                  <>
                    <Input
                      className="mb-2"
                      placeholder="First Name"
                      value={editedUser.firstName || ""}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Last Name"
                      value={editedUser.lastName || ""}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                    />
                  </>
                ) : (
                  <h2 className="text-xl font-semibold">
                    {user.firstName || "First Name"}{" "}
                    {user.lastName || "Last Name"}
                  </h2>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Email: {user.emailAddress}</p>
            <p className="text-gray-600">Credits: {user.credits}</p>
            <p className="text-gray-600">
              GitHub Username: {user.githubUserName || "N/A"}
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            {isEditing ? (
              <div className="flex gap-x-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleSave}
                  className="flex items-center gap-2"
                >
                  <Save size={16} /> Save
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => {
                  toast.info("This feature will soon be accessible.");
                }}
                className="flex items-center gap-2"
              >
                <Edit size={16} /> Edit
              </Button>
            )}
          </CardFooter>
        </Card>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setUserInfoOpen(false)}
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
