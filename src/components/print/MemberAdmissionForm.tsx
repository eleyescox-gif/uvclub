"use client";

import React from 'react';

interface MemberAdmissionFormProps {
  memberData?: any; // Optional data to pre-fill the form
}

export default function MemberAdmissionForm({ memberData }: MemberAdmissionFormProps) {
  // Helpers to render boxes for NID, Mobile, DOB
  const renderBoxes = (count: number, prefill?: string) => {
    return Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{
        width: '24px', 
        height: '30px', 
        border: '1px solid #4b5563', 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginRight: '-1px', // collapse borders
        fontSize: '14px',
        fontWeight: 'bold',
        backgroundColor: 'white'
      }}>
        {prefill && prefill[i] ? prefill[i] : ''}
      </div>
    ));
  };

  // Format DOB string if available
  let dobStr = "";
  if (memberData?.dob) {
    const d = new Date(memberData.dob);
    if (!isNaN(d.getTime())) {
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear().toString();
      dobStr = `${day}${month}${year}`;
    }
  }

  // Convert English numbers to Bengali (for percentage or DOB if needed, though boxes usually stay English or as is. We'll leave DOB as is, but convert percentage)
  const toBnNum = (engNum: string | number) => {
    const bnNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return engNum.toString().replace(/\d/g, d => bnNumbers[parseInt(d)]);
  };

  return (
    <div className="print-container" style={{ 
      maxWidth: '210mm', // A4 width for screen
      minHeight: '297mm', // A4 height for screen
      padding: '20mm 15mm',
      margin: '0 auto',
      backgroundColor: 'white',
      color: 'black',
      fontFamily: '"Tiro Bangla", "SolaimanLipi", sans-serif',
      position: 'relative',
      boxSizing: 'border-box'
    }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ width: '150px', height: '40px', border: '1px solid black', display: 'flex', alignItems: 'center', paddingLeft: '10px' }}>
          <span>ফরম নং: {memberData?.id ? memberData.id.split('-')[0].toUpperCase() : ''}</span>
        </div>
        
        <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
          <h1 style={{ color: '#0369a1', fontSize: '28px', margin: '0 0 10px 0', fontWeight: 'bold' }}>ইউনাইটেড ভিশন ক্লাব</h1>
          <p style={{ margin: '0 0 5px 0', fontSize: '16px' }}>একসাথে আগামীর পথে</p>
          <p style={{ margin: '0 0 5px 0', fontSize: '16px' }}>বরইতলী, চকরিয়া, কক্সবাজার।</p>
          <p style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>স্থাপিত: ২০২৬ খ্রি.</p>
          
          <div style={{ 
            backgroundColor: '#0284c7', 
            color: 'white', 
            display: 'inline-block', 
            padding: '8px 25px', 
            borderRadius: '5px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            সদস্য পদের আবেদন ফরম
          </div>
        </div>

        <div style={{ width: '130px', height: '160px', border: '1px solid #9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#6b7280', fontSize: '13px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#f8fafc', flexShrink: 0 }}>
          {memberData?.profilePicture ? (
            <img src={memberData.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
          ) : (
            <>পাসপোর্ট সাইজ<br/>ছবি</>
          )}
        </div>
      </div>

      {/* Section 1: Personal Info */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#0369a1', fontSize: '18px', margin: '0 0 15px 0', fontWeight: 'bold' }}>১। ব্যক্তিগত তথ্যাদি:</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <span style={{ width: '180px' }}>আবেদনকারীর নাম (বাংলা)</span>
            <div style={{ flex: 1, borderBottom: '1px dotted black', paddingBottom: '2px', fontWeight: 'bold' }}>
              {memberData?.nameBn || ''}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <span style={{ width: '180px' }}>নাম (ইংরেজি ব্লকে)</span>
            <div style={{ flex: 1, borderBottom: '1px dotted black', paddingBottom: '2px', textTransform: 'uppercase' }}>
              {memberData?.nameEn ? memberData.nameEn.toUpperCase() : ''}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
              <span style={{ width: '120px' }}>পিতা/স্বামীর নাম</span>
              <div style={{ flex: 1, borderBottom: '1px dotted black', paddingBottom: '2px' }}>
                {memberData?.fatherName || ''}
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
              <span style={{ width: '80px' }}>মাতার নাম</span>
              <div style={{ flex: 1, borderBottom: '1px dotted black', paddingBottom: '2px' }}>
                {memberData?.motherName || ''}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '180px' }}>জাতীয় পরিচয়পত্র (NID)</span>
            <div style={{ display: 'flex' }}>
              {renderBoxes(17, memberData?.nid)}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '180px' }}>মোবাইল নম্বর</span>
            <div style={{ display: 'flex' }}>
              {renderBoxes(11, memberData?.mobile)}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '100px' }}>জন্ম তারিখ</span>
              <div style={{ display: 'flex' }}>
                {renderBoxes(8, dobStr)}
              </div>
            </div>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>(দিন / মাস / বছর)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <span style={{ width: '180px' }}>স্থায়ী ঠিকানা</span>
            <div style={{ flex: 1, borderBottom: '1px dotted black', paddingBottom: '2px' }}>
              {memberData?.address || ''}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Nominee Info */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#0369a1', fontSize: '18px', margin: '0 0 15px 0', fontWeight: 'bold' }}>২। নমিনির তথ্যাদি:</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 2, display: 'flex', alignItems: 'flex-end' }}>
              <span style={{ width: '100px' }}>নমিনির নাম</span>
              <div style={{ flex: 1, borderBottom: '1px dotted black', paddingBottom: '2px' }}>
                {memberData?.nomineeName || ''}
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
              <span style={{ width: '60px' }}>সম্পর্ক</span>
              <div style={{ flex: 1, borderBottom: '1px dotted black', paddingBottom: '2px' }}>
                {memberData?.nomineeRelation || ''}
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
              <span style={{ width: '40px' }}>বয়স</span>
              <div style={{ flex: 1, borderBottom: '1px dotted black', paddingBottom: '2px' }}>
                {memberData?.nomineeAge || ''}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '180px' }}>NID / জন্ম নিবন্ধন</span>
            <div style={{ display: 'flex' }}>
              {renderBoxes(17, memberData?.nomineeNid)}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '180px' }}>নমিনির মোবাইল</span>
            <div style={{ display: 'flex' }}>
              {renderBoxes(11, memberData?.nomineeMobile)}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Declaration */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#0369a1', fontSize: '18px', margin: '0 0 10px 0', fontWeight: 'bold' }}>৩। অঙ্গীকারনামা</h3>
        <p style={{ lineHeight: '1.8', textAlign: 'justify', fontSize: '15px' }}>
          আমি এই মর্মে অঙ্গীকার করছি যে, উপরে প্রদত্ত সকল তথ্য সম্পূর্ণ সত্য ও সঠিক। আমি "ইউনাইটেড ভিশন ক্লাব"-এর গঠনতন্ত্র, নিয়মাবলি ও শৃঙ্খলা মেনে চলতে বাধ্য থাকব। ক্লাবের স্বার্থবিরোধী বা মর্যাদাহানিকর কোনো কাজের সাথে আমি নিজেকে লিপ্ত করব না। যদি কোনো তথ্য অসত্য প্রমাণিত হয়, তবে ক্লাব কর্তৃপক্ষ আমার সদস্যপদ বাতিল করার পূর্ণ অধিকার সংরক্ষণ করেন।
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px dashed black', width: '200px', paddingTop: '5px' }}>
              আবেদনকারীর স্বাক্ষর ও তারিখ
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px dashed black', width: '250px', paddingTop: '5px' }}>
              প্রস্তাবক/সমর্থকের স্বাক্ষর ও নাম
            </div>
          </div>
        </div>
      </div>
      
      {/* Global CSS for Print */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          body {
            margin: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0 !important;
            /* Do not remove padding so the content doesn't hit the paper edge */
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: none !important;
            background: white !important;
          }
          @page {
            size: A4;
            margin: 0; /* Let container padding act as margins */
          }
        }
      `}} />
    </div>
  );
}
