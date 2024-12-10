"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import useRefetch from "~/hooks/use-refetch";
import { api } from "~/trpc/react";

type FormInput = {
  repoUrl: string;
  projectname: string;
  githubTokon?: string;
};
const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const project = api.project.createProject.useMutation();
  const refetch = useRefetch();
  function onSubmit(data: FormInput) {
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
    return true;
  }
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
            <Input
              {...register("projectname", { required: true })}
              placeholder="ProjectName"
              required
            />
            <div className="h-2"></div>
            <Input
              {...register("repoUrl", { required: true })}
              placeholder="Repo URL"
              type="url"
              //   required
            />
            <div className="h-2"></div>
            <Input
              {...register("githubTokon")}
              placeholder="Github Token (Optional)"
            />

            <div className="h-4"> </div>

            <Button type="submit" disabled={project.isPending}>
              Create Project
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
