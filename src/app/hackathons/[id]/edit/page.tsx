import { EditHackathonPage } from "@/components/pages/edit-hackathon-page";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditHackathonPage id={id} />;
}
