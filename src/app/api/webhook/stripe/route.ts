import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "~/server/db";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!, {
  apiVersion: "2024-12-18.acacia",
});
export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("Stripe-Signature") as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    return NextResponse.json({ message: "Invalid Signature" }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const credit = Number(session.metadata?.["credits"]);
    const userId = session.client_reference_id;

    if (!userId || !credit) {
      return NextResponse.json(
        { message: "Missing user Id or credit" },
        { status: 400 },
      );
    }

    const res = await db.stripeTransaction.create({ data: { userId, credit } });

    const res1 = await db.user.update({
      where: { id: userId },
      data: { credits: { increment: credit } },
    });

    return NextResponse.json(
      { message: "Credit Added successfully" },
      { status: 200 },
    );
  }

  return NextResponse.json({ message: "Hello webhook" }, { status: 200 });
}
