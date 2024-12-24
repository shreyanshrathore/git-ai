"use server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text(); // Read the body as text
    const body = JSON.parse(bodyText);
    const client = await clerkClient();
    const user = await client.users.getUser(body.data.id!);
    if (
      user.externalAccounts[0]?.provider == "oauth_github" &&
      body.type == "user.updated"
    ) {
      const githubUserName = user.externalAccounts[0]?.username!;
      await db.user.update({
        where: {
          id: body.data.id,
        },
        data: {
          githubUserName,
        },
      });
    }
    // const githubUserName = user,
  } catch (error) {
    console.error(error, "Error parsing body");
    return NextResponse.json({ message: "Invalid Body" }, { status: 400 });
  }

  return NextResponse.json({ message: "Hello webhook" }, { status: 200 });
}
