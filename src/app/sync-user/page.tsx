import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { db } from "~/server/db";

const SyncUser = async () => {
  const { userId } = await auth();
  console.log(userId, "userId");
  if (!userId) {
    throw new Error("User not found");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  console.log("clerk user", user);
  if (!user.emailAddresses[0]?.emailAddress) {
    return notFound();
  }

  const res = await db.user.upsert({
    where: {
      emailAddress: user.emailAddresses[0]?.emailAddress ?? "",
    },
    update: {
      imageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
      githubUserName: user.externalAccounts[0]?.firstName!,
    },
    create: {
      id: userId,
      emailAddress: user.emailAddresses[0]?.emailAddress ?? "",
      imageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });

  return redirect("/dashboard");
};

export default SyncUser;
