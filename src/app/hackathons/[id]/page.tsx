import { HackathonDetailPage } from "@/components/pages/hackathon-detail-page";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HackathonDetailPage id={id} />;
}
