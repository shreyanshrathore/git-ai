"use server";

import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "~/lib/gemini";
import { db } from "~/server/db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();

  const queryVector = await generateEmbedding(question);

  const vectorQuery = `[${queryVector.join(",")}]`;

  const result = (await db.$queryRaw`
  SELECT "filename", "sourceCode", "summary", 
  1 - ("summaryEmbedding" <==> ${vectorQuery}::vector) AS similarity
  FROM "SourceCodeEmbedding"
  WHERE 1- ("summaryEmbedding" <==> ${vectorQuery}::vector) > 0.5
  AND "projectId" = ${projectId}
  ORDER BY similarity DESC
  LIMIT 10
  `) as { fileName: string; sourceCode: string; summary: string }[];

  let context = "";

  for (const doc of result) {
    context += `source: ${doc.fileName}\n code content: ${doc.sourceCode}\n summary: ${doc.summary}\n\n`;
  }
  async () => {
    const { textStream } = await streamText({
      model: google("gemini-1.5-flash"),
      prompt: `You are AI code assistant who answers question about the codebase, Your target audience is a technical intern 
      AI assistant is a brand new, powerful, human like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.

      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.

      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      If the question is asking about code or specific file, AI will provide the detailed answer, giving step by step explanation of the code.  If the question is not related to the code, AI will provide a concise and informative answer.

Here is the question: ${question}

Here is the context from the codebase:
${context}

Please answer the question based on the context provided.

      `,
    });
  };
  let prompt = `

  `;
}
