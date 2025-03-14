"use client";
import { Presentation, Upload } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { uploadFile } from "~/lib/firebase";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { api } from "~/trpc/react";
import useProject from "~/hooks/use-project";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const MeetingCard = () => {
  const project = useProject();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState<Boolean>(false);
  const router = useRouter();
  const uploadMeeting = api.project.uploadMeeting.useMutation();
  const processMeeting = useMutation({
    mutationFn: async (data: {
      meetingUrl: string;
      meetingId: string;
      projectId: string;
    }) => {
      const { meetingId, meetingUrl, projectId } = data;
      const response = await axios.post("/api/process-meeting", {
        meetingId,
        meetingUrl,
        projectId,
      });
      return response.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".mp4", ".wav", ".m4a"],
    },
    multiple: false,
    maxSize: 50_000_000,
    onDrop: async (acceptedFiles) => {
      setIsUploading(true);
      const acceptedFile = acceptedFiles[0];
      if (!acceptedFile) return;
      const downloadUrl = (await uploadFile(
        acceptedFile as File,
        setProgress,
      )) as string;
      uploadMeeting.mutate(
        {
          meetingUrl: downloadUrl,
          name: acceptedFile.name,
          projectId: project.projectId,
        },
        {
          onSuccess: (meeting) => {
            toast.success("Meeting uploaded successfully"),
              router.push("/meetings");
            processMeeting.mutateAsync({
              meetingId: meeting.id,
              meetingUrl: downloadUrl,
              projectId: project.projectId,
            });
          },
          onError: () => toast.error("Failed to upoad meeting"),
        },
      );
      window.alert(downloadUrl);
      setIsUploading(false);
    },
  });

  return (
    <Card
      className="col-span-2 flex flex-col items-center justify-center p-10"
      {...getRootProps()}
    >
      {!isUploading && (
        <>
          <Presentation className="h-10 w-10 animate-bounce" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Create a new meeting
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Analyse your meeting with Git AI <br />
            Powered by AI
          </p>

          <div className="mt-6">
            <Button disabled={isUploading}>
              <Upload className="ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Upload Meeting
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </>
      )}

      {isUploading && (
        <div className="">
          <CircularProgressbar
            value={progress}
            text={`${progress}%`}
            className="size-20"
            styles={buildStyles({
              // pathColor: "#000",
              // textColor: "#000",
            })}
          />
          <p className="text-center text-sm text-gray-500">
            Uploading your meeting...
          </p>
        </div>
      )}
    </Card>
  );
};

export default MeetingCard;
