import { Octokit } from "octokit";
import { db } from "~/server/db";
import axios from "axios";
import { aiSummariseCommit } from "./gemini";
export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const githubUrl = "https://github.com/docker/genai-stack";

type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const getCommitHashes = async (
  githubUrl: string,
): Promise<Response[]> => {
  const [owner, repo] = githubUrl.split("/").slice(-2);

  if (!owner || !repo) {
    throw new Error("Invalid github url");
  }
  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  const sortedCommit = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  ) as any[];

  return sortedCommit.slice(0, 15).map((commit) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit.message ?? "",
    commitAuthorAvatar: commit.author.avatar_url ?? "",
    commitAuthorName: commit.commit.author.name ?? "",
    commitDate: commit.commit.author.date ?? "",
  }));
};

async function summarizeCommit(githubUrl: string, commitHash: string) {
  const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
    },
  });

  const result = (await aiSummariseCommit(data)) || "";
  return result;
}

export const pollCommits = async (projectId: string) => {
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  const commitHashes = await getCommitHashes(githubUrl);
  const unProcessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );

  const summaryResponses = await Promise.allSettled(
    unProcessedCommits.map((commit) => {
      return summarizeCommit(githubUrl, commit.commitHash);
    }),
  );

  const summaries = summaryResponses.map((summary) => {
    if (summary.status === "fulfilled") {
      return summary.value;
    }
    return "";
  });

  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => {
      return {
        projectId: projectId,
        commitHash: unProcessedCommits[index]!.commitHash,
        commitMessage: unProcessedCommits[index]!.commitMessage,
        commitAuthorName: unProcessedCommits[index]!.commitAuthorName,
        commitAuthorAvatar: unProcessedCommits[index]!.commitAuthorAvatar,
        commitDate: unProcessedCommits[index]!.commitDate,
        summary: summary || "",
      };
    }),
  });
  return commits;
};

export const fetchProjectGithubUrl = async (projectId: string) => {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      githubUrl: true,
    },
  });

  if (!project?.githubUrl) {
    throw new Error("Project has no github url");
  }
  return { project, githubUrl: project?.githubUrl };
};

async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: Response[],
) {
  const processedCommit = await db.commit.findMany({
    where: { projectId },
  });

  const unProcessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommit.some(
        (processedCommit) => processedCommit?.commitHash == commit.commitHash,
      ),
  );

  return unProcessedCommits;
}

await pollCommits("cm4ej2ezc000912oce5tsn011").then(console.log);
