import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ApproveButton from "./ApproveButton";

export default async function DataClearRequestsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  
  const role = (session.user as any).role;
  if (role !== "SECRETARY") {
    redirect("/dashboard");
  }

  const requests = await prisma.dataClearRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#b91c1c' }}>ট্রায়াল ডেটা ডিলিট রিকুয়েস্ট</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>সভাপতির পক্ষ থেকে ট্রায়াল ডেটা মুছে ফেলার অনুরোধসমূহ এখানে জমা হবে। আপনি অ্যাপ্রুভ করলে ডেটা মুছে যাবে।</p>

      {requests.length === 0 ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem', color: '#6b7280' }}>
          কোনো পেন্ডিং রিকুয়েস্ট নেই।
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {requests.map(req => (
            <div key={req.id} className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.25rem' }}>সভাপতি ট্রায়াল ডেটা মুছে ফেলতে চাচ্ছেন</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>অনুরোধের সময়: {new Date(req.createdAt).toLocaleString('bn-BD')}</p>
              </div>
              <ApproveButton requestId={req.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
