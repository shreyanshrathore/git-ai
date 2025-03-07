"use client";

import { Info, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import useRefetch from "~/hooks/use-refetch";
import { api } from "~/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useState } from "react";

type FormInput = {
  repoUrl: string;
  projectname: string;
  githubTokon?: string;
};
const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const project = api.project.createProject.useMutation();
  const checkCredits = api.project.checkCredits.useMutation();
  const { data: user } = api.project.getUser.useQuery();
  const allRepo = api.project.getAllRepo.useQuery();
  const [repoName, setRepoName] = useState<string>("");
  const [repoUrl, setRepoUrl] = useState<string>("");
  const repos = allRepo.data;
  const refetch = useRefetch();
  function onSubmit(data: FormInput) {
    if (!!checkCredits.data) {
      project.mutate(
        {
          githubUrl: data.repoUrl,
          name: data.projectname,
          githubToken: data.githubTokon,
        },
        {
          onSuccess: () => {
            toast.success("Project created successfully");
            reset();
            refetch();
          },
          onError: () => {
            toast.error("Failed to create project");
          },
        },
      );
    } else {
      checkCredits.mutate({
        githubUrl: data.repoUrl,
        githubToken: data.githubTokon,
      });
    }
  }

  const hasEnoughCredits = checkCredits?.data?.userCredit
    ? checkCredits.data.fileCount <= checkCredits.data.userCredit
    : true;
  return (
    <div className="flex h-full items-center justify-center gap-12">
      <img src="./undraw_github.svg" className="h-56 w-auto" />
      <div>
        <div>
          <h1 className="text-2xl font-semibold">
            Link your Github Repository
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the URL of your repository to link it with GIT AI
          </p>
        </div>
        <div className="h-4"> </div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Select
                value=""
                onValueChange={(val) => {
                  const repoIndex = repos?.find(
                    (repo) => val === repo.repoName,
                  );
                  if (repoIndex) {
                    setRepoName(repoIndex.repoName);
                    setRepoUrl(repoIndex.repoUrl);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder="Select Your GitHub Repository"
                    defaultValue={9}
                  />
                </SelectTrigger>
                <SelectContent>
                  {allRepo.isPending && (
                    <div className="flex h-32 items-center justify-center">
                      <span className="text-gray-500">
                        Fetching repositories...{" "}
                        <div className="flex justify-center">
                          <Loader2 className="animate-spin" />
                        </div>
                      </span>
                    </div>
                  )}
                  {allRepo.isSuccess && repos?.length! > 0
                    ? repos?.map((repo, index) => (
                        <SelectItem
                          className="w-auto"
                          key={index}
                          value={repo.repoName}
                        >
                          {repo.repoName}
                        </SelectItem>
                      ))
                    : allRepo.isSuccess && (
                        <div className="flex h-32 items-center justify-center">
                          <span className="text-gray-500">
                            No repositories available
                          </span>
                        </div>
                      )}
                </SelectContent>
              </Select>
            </div>

            <div className="h-4"></div>
            <Input
              {...register("projectname", { required: true })}
              placeholder="ProjectName"
              required
              onChange={(e) => setRepoName(e.target.value)}
              value={repoName}
            />
            <div className="h-2"></div>
            <Input
              {...register("repoUrl", { required: true })}
              placeholder="Repo URL"
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
            />
            <div className="h-2"></div>
            <Input
              {...register("githubTokon")}
              placeholder="Github Token (Optional)"
            />
            {!!checkCredits.data && (
              <>
                <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-4 py-2 text-orange-700">
                  <div className="flex items-center gap-2">
                    <Info className="size-4" />

                    <p className="text-sm">
                      You wwill be charged{" "}
                      <strong>{checkCredits.data.fileCount}</strong> credis for
                      this repository
                    </p>
                  </div>
                  <p className="ml-8 text-sm text-blue-600">
                    {" "}
                    You have{" "}
                    <strong>
                      {checkCredits.data.userCredit} credit remaining
                    </strong>
                  </p>
                </div>
              </>
            )}
            <div className="h-4"> </div>

            <Button
              type="submit"
              disabled={
                project.isPending || checkCredits.isPending || !hasEnoughCredits
              }
            >
              {!!checkCredits.data ? "Create Project" : "Check Credit"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
