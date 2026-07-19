import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import PrintListButton from "./PrintListButton";
import { getClubInfo } from "@/lib/clubInfo";

export default async function PrintMemberListPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  
  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "PRESIDENT" && role !== "SECRETARY" && role !== "CASHIER") {
    redirect("/dashboard");
  }

  const club = await getClubInfo();

  const users = await prisma.user.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: 'asc' }
  });
  const roleOrder: Record<string, number> = {
    'PRESIDENT': 1,
    'SECRETARY': 2,
    'CASHIER': 3,
    'ADMIN': 4,
    'MEMBER': 5
  };

  users.sort((a, b) => {
    const roleDiff = (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
    if (roleDiff !== 0) return roleDiff;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
  return (
    <div className="print-list-page report-page-container" style={{ padding: '2rem' }}>
      <div className="no-print" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/dashboard/admin/members/manage" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
          ← ফিরে যান
        </Link>
        <PrintListButton />
      </div>

      <div className="print-area" style={{ position: 'relative', overflow: 'hidden', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <style dangerouslySetInnerHTML={{__html: `
          .watermark-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.05;
            pointer-events: none;
            z-index: 0;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .watermark-img {
            width: 300px;
            height: 300px;
            object-fit: contain;
          }
          @media print {
            body * {
              visibility: hidden;
            }
            body {
              background: white;
              margin: 0;
              padding: 0;
            }
            .print-area, .print-area * {
              visibility: visible;
            }
            .print-area {
              width: 100%;
              padding: 0 !important;
              margin: 0 auto !important;
              border: none !important;
              text-align: center;
              position: relative !important;
            }
            .no-print {
              display: none !important;
            }
            .watermark-container {
              position: fixed !important;
              top: 50% !important;
              left: 50% !important;
              transform: translate(-50%, -50%) !important;
              opacity: 0.05 !important;
              z-index: 0 !important;
              display: block !important;
            }
            .watermark-img {
              width: 380px !important;
              height: 380px !important;
            }
            @page {
              size: A4;
              margin: 0.5in;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 0 auto;
            }
            th, td {
              border: 1px solid black !important;
              padding: 7px 5px !important;
              text-align: center !important;
              font-size: 11.5px;
            }
            td:nth-child(2) { text-align: left !important; }
            td:nth-child(4) { text-align: center !important; }
            td:nth-child(5), td:nth-child(6), td:nth-child(7) { text-align: right !important; }
            th {
              background-color: #e8f4fd !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}} />

        {/* Watermark */}
        {club.watermarkLogo && (
          <div className="watermark-container">
            <img src={club.watermarkLogo} alt="" className="watermark-img" />
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          {club.logo && (
            <div style={{ marginBottom: '10px' }}>
              <img src={club.logo} alt="logo" style={{ height: '60px', objectFit: 'contain' }} />
            </div>
          )}
          <h1 style={{ color: '#0369a1', fontSize: '24px', margin: '0 0 5px 0', fontWeight: 'bold' }}>{club.name}</h1>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{club.address}</p>
          <p style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: 'bold' }}>স্থাপিত: ২০২৬ খ্রি.</p>
          <div>
            <h2 style={{ fontSize: '18px', borderBottom: '1px solid black', display: 'inline-block', paddingBottom: '2px', marginBottom: '10px' }}>সদস্যদের তালিকা</h2>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d1d5db' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ border: '1px solid #d1d5db', padding: '0.5rem', textAlign: 'center' }}>ক্রমিক</th>
              <th style={{ border: '1px solid #d1d5db', padding: '0.5rem', textAlign: 'left' }}>নাম</th>
              <th style={{ border: '1px solid #d1d5db', padding: '0.5rem', textAlign: 'center' }}>পদবী</th>
              <th style={{ border: '1px solid #d1d5db', padding: '0.5rem', textAlign: 'center' }}>ফোন নম্বর</th>
              <th style={{ border: '1px solid #d1d5db', padding: '0.5rem', textAlign: 'center' }}>জমাকৃত অর্থ</th>
              <th style={{ border: '1px solid #d1d5db', padding: '0.5rem', textAlign: 'center' }}>লাভ</th>
              <th style={{ border: '1px solid #d1d5db', padding: '0.5rem', textAlign: 'center' }}>মোট</th>
              <th style={{ border: '1px solid #d1d5db', padding: '0.5rem', textAlign: 'center' }}>মন্তব্য</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id}>
                <td style={{ border: '1px solid #d1d5db', padding: '0.5rem', textAlign: 'center' }}>{index + 1}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '0.5rem', textAlign: 'left' }}>{user.nameBn || user.name}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '0.5rem', textAlign: 'center' }}>
                  {user.role === 'PRESIDENT' ? 'সভাপতি' : 
                   user.role === 'SECRETARY' ? 'সাধারণ সম্পাদক' : 
                   user.role === 'CASHIER' ? 'ক্যাশিয়ার' : 
                   user.role === 'ADMIN' ? 'অ্যাডমিন' : 'সদস্য'}
                </td>
                <td style={{ border: '1px solid #d1d5db', padding: '0.5rem', textAlign: 'center' }}>{user.mobile}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '0.5rem', textAlign: 'right' }}>{user.balance > 0 ? user.balance : ""}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '0.5rem' }}></td>
                <td style={{ border: '1px solid #d1d5db', padding: '0.5rem' }}></td>
                <td style={{ border: '1px solid #d1d5db', padding: '0.5rem' }}></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
