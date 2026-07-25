import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import RulesView from "./RulesView";

export const metadata = {
  title: "ক্লাব সংবিধান ও বিধিমালা | ইউনাইটেড ভিশন ক্লাব",
  description: "ইউনাইটেড ভিশন ক্লাবের অফিসিয়াল পরিমার্জিত সংবিধান ও পরিচালন বিধিমালা।"
};

export default async function RulesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return <RulesView user={session.user} />;
}
