import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "~/server/db";

export const userRouter = createTRPCRouter({
  getUsers: protectedProcedure
    .input(
      z.object({
        firstName: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.user.findMany({
        where: {
          firstName: {
            startsWith: input.firstName,
          },
        },
      });
    }),

  getUserChats: protectedProcedure.query(async ({ input, ctx }) => {
    const userId = ctx.user.userId as string;
    const userChats = await ctx.db.userToChat.findMany({
      where: { userId },
      include: {
        chat: {
          include: {
            participants: {
              include: { user: true },
            },
          },
        },
      },
    });

    const chatsWithUsers = userChats.map((userChat) => {
      const otherParticipants = userChat.chat.participants.filter(
        (participant) => participant.userId !== userId,
      );

      return {
        chatId: userChat.chatId,
        user: otherParticipants.map((participant) => ({
          ...participant.user,
        })),
      };
    });
    console.log(chatsWithUsers, "here");
    return chatsWithUsers;
  }),

  getChatById: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const chatId = input.chatId as string;
      return await db.chat.findFirst({
        where: {
          id: chatId,
        },
        include: {
          messages: true,
        },
      });
    }),

  createChat: protectedProcedure
    .input(
      z.object({
        receiverId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { receiverId } = input;
      const senderId = ctx.user.userId!;

      // Step 2: Check if a chat between these users already exists
      const existingChat = await db.chat.findFirst({
        where: {
          participants: {
            every: {
              OR: [{ userId: senderId }, { userId: receiverId }],
            },
          },
        },
        include: {
          messages: true,
        },
      });

      if (!existingChat) {
        return await db.chat.create({
          data: {
            participants: {
              create: [
                { user: { connect: { id: senderId } } },
                { user: { connect: { id: receiverId } } },
              ],
            },
          },
          include: {
            participants: true,
            messages: true,
          },
        });
      }
      return existingChat;
    }),

  getAllChatsBySenderId: protectedProcedure
    .input(
      z.object({
        senderId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { senderId } = input;
      return await db.chat.findMany({
        where: {
          participants: {
            some: { userId: senderId },
          },
        },
      });
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { chatId, content } = input;
      const res = await db.message.create({
        data: {
          chatId,
          content,
          senderId: ctx.user.userId!,
        },
      });
      return res;
    }),

  getAllMessagesByChatId: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { chatId } = input;
      return await db.message.findMany({
        where: { chatId },
      });
    }),

  // getChatById: protectedProcedure
  //   .input(
  //     z.object({
  //       chatId: z.string(),
  //     }),
  //   )
  //   .query(async ({ input, ctx }) => {
  //     const { chatId } = input;
  //     const result = await db.chat.findUnique({
  //       where: {
  //         id: chatId,
  //       },
  //       include: {
  //         messages: true,
  //       },
  //     });

  //     return result?.messages as Message[];
  //   }),

  createChats: protectedProcedure
    .input(z.object({ receiverId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const senderId = ctx.user.userId as string;
      const { receiverId } = input;
      const newChat = await db.chat.create({
        data: {},
      });

      await db.userToChat.createMany({
        data: [
          { userId: senderId, chatId: newChat.id },
          { userId: receiverId, chatId: newChat.id },
        ],
      });
      return newChat;
    }),

  getAllChats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.userId as string;

    const all_chats = await db.chat.findMany({
      where: {
        participants: { some: { userId: userId } },
      },
      include: {
        participants: {
          include: { user: true },
        },
        messages: {
          orderBy: { createdAt: "desc" }, // Get the latest message for each chat
          take: 1, // Fetch only the latest message
        },
      },
    });

    // Sort chats based on the latest message timestamp
    all_chats.sort((a, b) => {
      const lastMessageA = a.messages[0]?.createdAt || new Date(0); // Default to oldest date if no messages
      const lastMessageB = b.messages[0]?.createdAt || new Date(0);
      return lastMessageB.getTime() - lastMessageA.getTime(); // Sort descending (newest first)
    });

    const chatsWithSenders = all_chats.map((chat) => ({
      chat,
      senders: chat.participants
        .filter((participant) => participant.userId !== userId)
        .map((participant) => participant.user),
    }));

    return chatsWithSenders;
  }),

  getMessageByChatId: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { chatId } = input;
      const messages = await db.chat.findUnique({
        where: { id: chatId },
        include: { messages: true },
      });
      console.log(messages);
      return messages;
    }),
});
