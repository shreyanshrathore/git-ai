import IssuesList from "./issues-list";

type Props = {
  params: Promise<{ meetingId: string }>;
};

const MeetingDetailPage = async ({ params }: Props) => {
  const { meetingId } = await params;

  return (
    <div>
      <IssuesList meetingId={meetingId} />
    </div>
  );
};

export default MeetingDetailPage;
