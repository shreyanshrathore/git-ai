"use client";
import useProject from "~/hooks/use-project";
import { api } from "~/trpc/react";

type Props = {};

const TeamMembers = (props: Props) => {
  const { projectId } = useProject();

  const { data: members } = api.project.getTeamMembers.useQuery({ projectId });
  return (
    <>
      <div className="flex items-center gap-2">
        {members?.map((member) => (
          <img
            key={member.id}
            src={member.user.imageUrl!}
            alt={member.user.firstName!}
            className="h-8 w-8 rounded-full"
          />
        ))}
      </div>
    </>
  );
};

export default TeamMembers;
