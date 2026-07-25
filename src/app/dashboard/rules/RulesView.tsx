"use client";

import { useState } from "react";
import { 
  BookOpen, 
  Search, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Scale, 
  Users, 
  Coins, 
  Lock, 
  Building2, 
  AlertTriangle,
  Gavel
} from "lucide-react";

interface RulesViewProps {
  user: any;
}

export default function RulesView({ user }: RulesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");

  const articles = [
    {
      id: "section-1",
      number: "ধারা ১",
      title: "নাম ও আইনি রূপ",
      icon: <Building2 size={20} className="text-sky-600" />,
      color: "#0284c7",
      bg: "rgba(2, 132, 199, 0.08)",
      points: [
        { label: "১.১ অফিসিয়াল নাম ও পরিচয়", text: "এই সংগঠনের অফিসিয়াল নাম হবে 'ইউনাইটেড ভিশন ক্লাব' (United Vision Club), যা পরবর্তীতে এই সংবিধানে 'ক্লাব' বলে অভিহিত হবে।" },
        { label: "১.২ আইনি রূপ ও ভবিষ্যৎ নিবন্ধন", text: "এই ক্লাবটি প্রাথমিক পর্যায়ে সদস্যদের পারস্পরিক সম্মতির ভিত্তিতে একটি অরাজনৈতিক, লাভজনক যৌথ বিনিয়োগ ফোরাম বা 'Association of Persons' হিসেবে পরিচালিত হবে। দীর্ঘমেয়াদি সুরক্ষার স্বার্থে সদস্যগণের সর্বসম্মত সিদ্ধান্ত অনুযায়ী এটি অংশীদারি আইন বা যথাযথ সরকারি কর্তৃপক্ষের অধীনে নিবন্ধিত হতে পারবে।" }
      ]
    },
    {
      id: "section-2",
      number: "ধারা ২",
      title: "উদ্দেশ্য ও লক্ষ্য",
      icon: <BookOpen size={20} className="text-emerald-600" />,
      color: "#059669",
      bg: "rgba(5, 150, 105, 0.08)",
      points: [
        { label: "২.১ বৈধ ও শরিয়াহ-সম্মত বিনিয়োগ", text: "সদস্যদের যৌথ মূলধন সংগ্রহ করে সম্পূর্ণ বৈধ, শরিয়াহ-সম্মত (প্রযোজ্য ক্ষেত্রে) অথবা প্রচলিত আইনে লাভজনক ও ঝুঁকিমুক্ত খাতে যৌথ বিনিয়োগ করা।" },
        { label: "২.২ পুঁজির নিরাপত্তা ও আর্থিক উন্নয়ন", text: "দীর্ঘমেয়াদে ক্লাবের সম্পদ বৃদ্ধি, পুঁজির নিরাপত্তা নিশ্চিতকরণ এবং সদস্যদের আর্থিক উন্নয়ন সাধন করা।" },
        { label: "২.৩ ডিজিটাল ট্র্যাকিং ও স্বচ্ছতা", text: "সদস্যদের জন্য একটি সম্পূর্ণ স্বচ্ছ, জবাবদিহিতামূলক, ডিজিটাল ট্র্যাকিং সমৃদ্ধ ও প্রাতিষ্ঠানিক বিনিয়োগ ব্যবস্থা গড়ে তোলা।" }
      ]
    },
    {
      id: "section-3",
      number: "ধারা ৩",
      title: "সদস্যপদ, চাঁদা ও জরিমানা",
      icon: <Coins size={20} className="text-amber-600" />,
      color: "#d97706",
      bg: "rgba(217, 119, 6, 0.08)",
      points: [
        { label: "৩.১ প্রতিষ্ঠাতা সদস্য সংখ্যা", text: "ক্লাবের প্রতিষ্ঠাতা সদস্য সংখ্যা সর্বোচ্চ ২০ (বিশ) জনের মধ্যে সীমাবদ্ধ থাকবে।" },
        { label: "৩.২ মাসিক চাঁদার পরিমাণ ও মেয়াদ", text: "প্রত্যেক সদস্যকে প্রতি মাসের ১ থেকে ১০ তারিখের মধ্যে মাসিক ১,০০০/- (এক হাজার) টাকা মূলধন চাঁদা হিসেবে বাধ্যতামূলকভাবে জমা দিতে হবে।" },
        { label: "৩.৩ বিলম্ব ফি ও জরিমানা নীতি", text: "যদি কোনো সদস্য নির্ধারিত সময়ের মধ্যে চাঁদা পরিশোধে ব্যর্থ হন, তবে তাকে পরবর্তী ২০ দিনের মধ্যে ৫০/- (পঞ্চাশ) টাকা বিলম্ব ফি বা জরিমানা সহ চাঁদা পরিশোধ করতে হবে।" },
        { label: "৩.৪ সমান অংশীদারিত্ব", text: "ক্লাবের সকল প্রতিষ্ঠাতা সদস্য সমান অংশীদার হিসেবে গণ্য হবেন।" },
        { label: "৩.৫ নতুন সদস্য অন্তর্ভুক্তির শর্ত", text: "নতুন কোনো সদস্য অন্তর্ভুক্তির প্রয়োজন হলে বিদ্যমান প্রতিষ্ঠাতা সদস্যদের কমপক্ষে ৭৫% সম্মতি বাধ্যতামূলক হবে।" }
      ]
    },
    {
      id: "section-4",
      number: "ধারা ৪",
      title: "মূলধন, মালিকানা ও দায়-দায়িত্ব",
      icon: <ShieldCheck size={20} className="text-indigo-600" />,
      color: "#4f46e5",
      bg: "rgba(79, 70, 229, 0.08)",
      points: [
        { label: "৪.১ যৌথ সম্পদের মালিকানা", text: "ক্লাবের সংগৃহীত মোট মূলধন, অর্জিত মুনাফা এবং ক্রয়কৃত সকল স্থাবর-অস্থাবর সম্পত্তি সকল সদস্যের যৌথ মালিকানাধীন সম্পদ হিসেবে বিবেচিত হবে।" },
        { label: "৪.২ একক মালিকানার নিষেধাজ্ঞা", text: "কোনো সদস্য ব্যক্তিগতভাবে ক্লাবের কোনো নির্দিষ্ট সম্পদ, জমি বা বিনিয়োগের একক বা একক অংশের মালিকানা দাবি করতে পারবেন না।" },
        { label: "৪.৩ লাভ, লোকসান ও আইনি দায় বণ্টন", text: "ক্লাবের সকল নিট লাভ, লোকসান, সম্পদ এবং তৃতীয় পক্ষের আইনি দায় সকল সদস্যের মধ্যে সমানুপাতিক হারে বণ্টিত হবে।" }
      ]
    },
    {
      id: "section-5",
      number: "ধারা ৫",
      title: "পরিচালনা ব্যবস্থা ও কার্যনির্বাহী কমিটি",
      icon: <Users size={20} className="text-purple-600" />,
      color: "#7c3aed",
      bg: "rgba(124, 58, 237, 0.08)",
      points: [
        { label: "৫.১ কার্যনির্বাহী কমিটির মেয়াদ ও গঠন", text: "সাধারণ সদস্যদের প্রত্যক্ষ ভোটে ০২ (দুই) বছর মেয়াদি একটি ০৭ (সাত) সদস্য বিশিষ্ট কার্যনির্বাহী কমিটি গঠিত হবে।" },
        { label: "৫.২ সমান ভোটাধিকার", text: "ক্লাবের সাধারণ ও বিশেষ সভায় সকল সদস্য সমান অধিকার এবং সমান ভোটাধিকার (১ সদস্য = ১ ভোট) ভোগ করবেন।" },
        { label: "৫.৩ কৌশলগত সিদ্ধান্তে ৭৫% সম্মতি", text: "নতুন বিনিয়োগের খাত নির্ধারণ, ক্লাবের সম্পত্তি বিক্রয় বা সংবিধান সংশোধনের ক্ষেত্রে কমপক্ষে ৭৫% সদস্যের সম্মতি আবশ্যক।" },
        { label: "৫.৪ দৈনন্দিন ব্যবস্থাপনা দায়িত্ব", text: "দৈনন্দিন কাজের জন্য কার্যনির্বাহী কমিটিকে সাধারণ সদস্যগণ দায়িত্ব অর্পণ করবেন।" }
      ]
    },
    {
      id: "section-6",
      number: "ধারা ৬",
      title: "বিনিয়োগ নীতি ও ব্যাংক হিসাব পরিচালনা",
      icon: <Building2 size={20} className="text-cyan-600" />,
      color: "#0891b2",
      bg: "rgba(8, 145, 178, 0.08)",
      points: [
        { label: "৬.১ বৈধ খাতে বিনিয়োগ", text: "ক্লাবের অর্থ শুধুমাত্র বাংলাদেশের প্রচলিত আইনে সম্পূর্ণ বৈধ, অনুমোদিত খাতে বিনিয়োগ করা হবে।" },
        { label: "৬.২ ১৫ দিনের পূর্ব নোটিশ", text: "যেকোনো প্রজেক্ট বা খাতে বিনিয়োগের ন্যূনতম ১৫ দিন পূর্বে সংশ্লিষ্ট প্রকল্প প্রস্তাবনা সকল সদস্যকে জানাতে হবে।" },
        { label: "৬.৩ সাধারণ সভার অনুমোদন", text: "বিনিয়োগ চূড়ান্ত করার পূর্বে সাধারণ সভায় সদস্যদের মতামত ও সংখ্যাগরিষ্ঠের (কমপক্ষে ৭৫%) অনুমোদন গ্রহণ করতে হবে।" },
        { label: "৬.৪ যৌথ (Joint) ব্যাংক হিসাব", text: "ক্লাবের সমস্ত আর্থিক লেনদেন 'ইউনাইটেড ভিশন ক্লাব'-এর নামে পরিচালিত একটি যৌথ (Joint) ব্যাংক হিসাবের মাধ্যমে সম্পন্ন হবে।" }
      ]
    },
    {
      id: "section-7",
      number: "ধারা ৭",
      title: "লাভ ও লোকসান বণ্টন",
      icon: <Scale size={20} className="text-teal-600" />,
      color: "#0d9488",
      bg: "rgba(13, 148, 136, 0.08)",
      points: [
        { label: "৭.১ নিট লাভ ও লোকসান সমবণ্টন", text: "ক্লাবের সকল প্রকার বিনিয়োগ হতে অর্জিত নিট লাভ এবং লোকসান সকল সদস্যের মধ্যে সমান অংশে বণ্টিত হবে।" },
        { label: "৭.২ লভ্যাংশ বণ্টন বা পুনঃবিনিয়োগ নীতি", text: "অর্জিত লাভ নগদ লভ্যাংশ হিসেবে বিতরণ করা হবে নাকি তা পুনরায় বিনিয়োগ করা হবে, তা বার্ষিক সাধারণ সভায় ভোটের মাধ্যমে নির্ধারিত হবে।" },
        { label: "৭.৩ সমভাবে লোকসান বহন", text: "কোনো বৈধ বিনিয়োগে ব্যবসায়িক ক্ষতি বা লোকসান হলে, সকল সদস্য সমভাবে সেই ক্ষতির দায় বহন করবেন।" }
      ]
    },
    {
      id: "section-8",
      number: "ধারা ৮",
      title: "সদস্যপদ ত্যাগ, লক-ইন পিরিয়ড ও অর্থ ফেরত নীতি",
      icon: <Lock size={20} className="text-rose-600" />,
      color: "#e11d48",
      bg: "rgba(225, 29, 72, 0.08)",
      points: [
        { label: "৮.১ ০৫ বছরের লক-ইন পিরিয়ড", text: "প্রথম চাঁদা জমা দেওয়ার তারিখ থেকে পরবর্তী ০৫ (পাঁচ) বছর পর্যন্ত কোনো সদস্য তার মূলধন ফেরত দাবি করতে পারবেন না।" },
        { label: "৮.২ বিশেষ জরুরি পরিস্থিতিতে অর্থ ফেরত", text: "গুরুতর অসুস্থতা বা পারিবারিক সংকটে কার্যনির্বাহী কমিটির সুপারিশে কমপক্ষে ৮০% সদস্যের সম্মতিতে আবেদন মঞ্জুর হতে পারে।" },
        { label: "৮.৩ আগাম প্রস্থান ফি (১৫% কর্তন)", text: "০৫ বছরের মধ্যে প্রস্থান করলে মোট প্রাপ্য থেকে ১৫% কর্তন করা হবে।" },
        { label: "৮.৪ স্বাভাবিক প্রস্থান পূর্ব নোটিশ", text: "০৫ বছর পর ক্লাব ত্যাগ করতে চাইলে ন্যূনতম ৯০ দিন পূর্বে নোটিশ প্রদান করতে হবে।" },
        { label: "৮.৫ স্বাভাবিক প্রস্থান ফি (৫% কর্তন)", text: "স্বাভাবিক প্রক্রিয়ায় ক্লাব ত্যাগ করলেও প্রাপ্য অংশ থেকে ৫% প্রস্থান ফি কর্তন করা হবে।" },
        { label: "৮.৬ কর্তিত অর্থের মালিকানা", text: "কর্তনকৃত সকল অর্থ সরাসরি ক্লাবের সাধারণ তহবিলে জমা হবে।" }
      ]
    },
    {
      id: "section-9",
      number: "ধারা ৯",
      title: "অর্থ পরিশোধের পদ্ধতি",
      icon: <Coins size={20} className="text-amber-700" />,
      color: "#b45309",
      bg: "rgba(180, 83, 9, 0.08)",
      points: [
        { label: "৯.১ সম্পদ বিক্রির বাধ্যবাধকতা মুক্ততা", text: "বিদায়ী সদস্যের অর্থ ফেরত দেওয়ার জন্য ক্লাব জরুরি ভিত্তিতে কোনো সম্পদ বিক্রি করতে বাধ্য থাকবে না।" },
        { label: "৯.২ সর্বোচ্চ ১২ মাসের কিস্তিতে পরিশোধ", text: "পর্যাপ্ত নগদ অর্থ না থাকলে, বিদায়ী সদস্যের প্রাপ্য অর্থ সর্বোচ্চ ১২ মাসের মধ্যে কিস্তিতে পরিশোধ করা যাবে।" },
        { label: "৯.৩ অডিটকৃত নিট সম্পদের ভিত্তিতে হিসাব", text: "অর্থ ফেরতের সময় বিদায়ী সদস্যের প্রাপ্য অংশ অডিটকৃত আর্থিক প্রতিবেদন অনুযায়ী বর্তমান নিট সম্পদ মূল্যের ভিত্তিতে হিসাব করা হবে।" },
        { label: "৯.৪ ফিক্সড/গ্যারান্টিযুক্ত রিটার্ন নিষেধাজ্ঞা", text: "কোনো সদস্য নির্দিষ্ট বা গ্যারান্টিযুক্ত ফিক্সড রিটার্ন দাবি করতে পারবেন না।" }
      ]
    },
    {
      id: "section-10",
      number: "ধারা ১০",
      title: "হিসাবরক্ষণ ও স্বচ্ছতা",
      icon: <FileText size={20} className="text-blue-600" />,
      color: "#2563eb",
      bg: "rgba(37, 99, 235, 0.08)",
      points: [
        { label: "১০.১ ডিজিটাল সফটওয়্যার ও অ্যাপস হিসাবায়ন", text: "ক্লাবের লেনদেন ক্যাশ বুক এবং ডিজিটাল সফটওয়্যার বা অ্যাপসের মাধ্যমে সংরক্ষণ করতে হবে।" },
        { label: "১০.২ সদস্যের হিসাব পরিদর্শনের অধিকার", text: "প্রত্যেক সক্রিয় সদস্যের হিসাব পরিদর্শনের অধিকার থাকবে।" },
        { label: "১০.৩ বার্ষিক অডিট ও আর্থিক প্রতিবেদন", text: "প্রতি অর্থবছর শেষে ক্লাবের একটি বার্ষিক আর্থিক প্রতিবেদন ও অডিট রিপোর্ট উপস্থাপন করতে হবে।" }
      ]
    },
    {
      id: "section-11",
      number: "ধারা ১১",
      title: "সদস্যের মৃত্যু বা অক্ষমতা",
      icon: <Users size={20} className="text-slate-700" />,
      color: "#334155",
      bg: "rgba(51, 65, 85, 0.08)",
      points: [
        { label: "১১.১ আইনগত উত্তরাধিকারীর নিকট হস্তান্তর", text: "কোনো সদস্য মৃত্যুবরণ করলে তার জমাকৃত অংশ তার আইনগত উত্তরাধিকারীদের নিকট হস্তান্তর করা হবে।" },
        { label: "১১.২ উত্তরাধিকারীর সদস্যপদ গ্রহণ শর্ত", text: "উত্তরাধিকারী নিজে সদস্য হতে চাইলে কমপক্ষে ৭৫% সদস্যের সম্মতি সাপেক্ষে সদস্যপদ পেতে পারেন।" },
        { label: "১১.৩ ১২ মাসের মধ্যে অর্থ ফেরত", text: "উত্তরাধিকারী সদস্য না হতে চাইলে তার প্রাপ্য অংশ সর্বোচ্চ ১২ মাসের মধ্যে পরিশোধ করা হবে।" }
      ]
    },
    {
      id: "section-12",
      number: "ধারা ১২",
      title: "সদস্য বহিষ্কার",
      icon: <AlertTriangle size={20} className="text-red-600" />,
      color: "#dc2626",
      bg: "rgba(220, 38, 38, 0.08)",
      points: [
        { label: "১২.১ গুরুতর লঙ্ঘনে বহিষ্কার", text: "অর্থ আত্মসাৎ, ফৌজদারি অপরাধ বা সংবিধানের গুরুতর লঙ্ঘনের কারণে সদস্যকে বহিষ্কার করা যাবে।" },
        { label: "১২.২ ৮০% সদস্যের ভোটের বাধ্যবাধকতা", text: "সদস্যকে বহিষ্কারের জন্য সাধারণ সভায় কমপক্ষে ৮০% সদস্যের সম্মতি বা ভোট আবশ্যক।" },
        { label: "১২.৩ ক্ষতিপূরণ কর্তনের অধিকার", text: "বহিষ্কৃত সদস্যের প্রাপ্য অর্থ থেকে ক্লাবের ক্ষতিপূরণ কেটে রাখা যাবে।" }
      ]
    },
    {
      id: "section-13",
      number: "ধারা ১৩",
      title: "বিরোধ নিষ্পত্তি",
      icon: <Gavel size={20} className="text-amber-800" />,
      color: "#92400e",
      bg: "rgba(146, 64, 14, 0.08)",
      points: [
        { label: "১৩.১ প্রাথমিক আপস-আলোচনা", text: "মতবিরোধ সৃষ্টি হলে প্রথমে আলোচনার মাধ্যমে সমাধানের চেষ্টা করতে হবে।" },
        { label: "১৩.২ সালিশি ট্রাইব্যুনাল গঠন", text: "আলোচনা ব্যর্থ হলে, সালিশি আইন, ২০০১ অনুযায়ী একটি সালিশি ট্রাইব্যুনাল গঠন করা হবে।" },
        { label: "১৩.৩ সালিশি পর্ষদের চূড়ান্ত সিদ্ধান্ত", text: "সালিশি পর্ষদের সিদ্ধান্ত চূড়ান্ত হবে।" }
      ]
    },
    {
      id: "section-14",
      number: "ধারা ১৪",
      title: "সংবিধান সংশোধন",
      icon: <FileText size={20} className="text-orange-600" />,
      color: "#ea580c",
      bg: "rgba(234, 88, 12, 0.08)",
      points: [
        { label: "১৪.১ ৭৫% সদস্যের সম্মতি", text: "সংবিধান সংশোধন বা বাতিল করতে হলে কমপক্ষে ৭৫% সদস্যের সম্মতি থাকতে হবে।" }
      ]
    },
    {
      id: "section-15",
      number: "ধারা ১৫",
      title: "তহবিলের উৎস ও মানিলন্ডারিং প্রতিরোধ",
      icon: <ShieldCheck size={20} className="text-emerald-700" />,
      color: "#047857",
      bg: "rgba(4, 120, 87, 0.08)",
      points: [
        { label: "১৫.১ বৈধ উৎস ও মানিলন্ডারিং মুক্ততা", text: "প্রত্যেক সদস্য নিশ্চিত করছেন যে, ক্লাবে তাদের বিনিয়োগকৃত অর্থের উৎস সম্পূর্ণ বৈধ এবং মানিলন্ডারিং প্রতিরোধ আইনের আওতাভুক্ত নয়।" },
        { label: "১৫.২ ব্যক্তিগত আইনি দায়বদ্ধতা", text: "কোনো সদস্যের অর্থের উৎসের কারণে আইনি জটিলতা তৈরি হলে, তার জন্য উক্ত সদস্য ব্যক্তিগতভাবে দায়ী থাকবেন।" }
      ]
    },
    {
      id: "section-16",
      number: "ধারা ১৬",
      title: "ক্লাবের বিলোপসাধন",
      icon: <AlertTriangle size={20} className="text-rose-700" />,
      color: "#be123c",
      bg: "rgba(190, 18, 60, 0.08)",
      points: [
        { label: "১৬.১ ৮০% ভোটে বিলোপসাধন", text: "অনিবার্য কারণে ক্লাব বন্ধ করতে হলে কমপক্ষে ৮০% সদস্যের ভোটের মাধ্যমে তা কার্যকর করা যাবে।" },
        { label: "১৬.২ দায় শোধ ও অবশিষ্ট সম্পত্তি বণ্টন", text: "বিলোপসাধন কার্যকরের পর, ক্লাবের সম্পত্তি বিক্রি করে ঋণ ও দায় পরিশোধ করা হবে এবং উদ্বৃত্ত অর্থ সদস্যদের মধ্যে বণ্টন করা হবে।" }
      ]
    },
    {
      id: "section-17",
      number: "ধারা ১৭",
      title: "ক্ষতিপূরণ ও দায়মুক্তি",
      icon: <ShieldCheck size={20} className="text-blue-700" />,
      color: "#1d4ed8",
      bg: "rgba(29, 78, 216, 0.08)",
      points: [
        { label: "১৭.১ সরল বিশ্বাসে কাজের দায়মুক্তি", text: "সরল বিশ্বাসে ক্লাবের স্বার্থে কাজ করার সময় লোকসানের জন্য কোনো সদস্যকে ব্যক্তিগতভাবে দায়ী করা যাবে না।" },
        { label: "১৭.২ ব্যক্তিগত জালিয়াতির একক দায়", text: "ব্যক্তিগত প্রতারণা বা জালিয়াতির জন্য সংশ্লিষ্ট সদস্য ব্যক্তিগতভাবে দায়ী থাকবেন।" }
      ]
    },
    {
      id: "section-18",
      number: "ধারা ১৮",
      title: "কর ও রাজস্ব",
      icon: <Coins size={20} className="text-slate-800" />,
      color: "#1e293b",
      bg: "rgba(30, 41, 59, 0.08)",
      points: [
        { label: "১৮.১ ব্যক্তিগত আয়কর প্রদানের দায়িত্ব", text: "লভ্যাংশ বিতরণের পর ব্যক্তিগত আয়কর প্রদানের দায়িত্ব সম্পূর্ণভাবে সংশ্লিষ্ট সদস্যের।" }
      ]
    },
    {
      id: "section-19",
      number: "ধারা ১৯",
      title: "প্রযোজ্য আইন ও আদালতের এখতিয়ার",
      icon: <Gavel size={20} className="text-cyan-800" />,
      color: "#155e75",
      bg: "rgba(21, 94, 117, 0.08)",
      points: [
        { label: "১৯.১ বাংলাদেশের প্রচলিত আইন দ্বারা পরিচালনা", text: "সংবিধানের ব্যাখ্যা এবং কার্যক্রম বাংলাদেশের প্রচলিত আইন দ্বারা পরিচালিত হবে।" },
        { label: "১৯.২ দেওয়ানি আদালতের এখতিয়ার", text: "সালিশ ব্যর্থ হলে ক্লাবের কার্যালয় যে জেলায় অবস্থিত, সেই জেলার দেওয়ানি আদালতে মামলা দায়ের করতে হবে।" }
      ]
    }
  ];

  const filteredArticles = articles.filter(art => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      art.number.toLowerCase().includes(term) ||
      art.title.toLowerCase().includes(term) ||
      art.points.some(p => p.label.toLowerCase().includes(term) || p.text.toLowerCase().includes(term))
    );
  });

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1.25rem 0.75rem 3rem" }}>
      
      {/* Printable Header (Visible ONLY during print) */}
      <div className="only-print" style={{ display: "none", textAlign: "center", marginBottom: "2rem", borderBottom: "2px solid #000", paddingBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: "45px", height: "45px", objectFit: "contain", borderRadius: "6px" }} />
          <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#0369a1", margin: 0 }}>ইউনাইটেড ভিশন ক্লাব</h1>
        </div>
        <p style={{ margin: "2px 0", fontSize: "14px", color: "#334155" }}>বরইতলী, চকরিয়া, কক্সবাজার। (স্থাপিত: ২০২৬ খ্রি.)</p>
        <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: "10px 0 4px", textDecoration: "underline" }}>অফিশিয়াল পরিমার্জিত সংবিধান ও পরিচালন বিধিমালা</h2>
        <p style={{ fontSize: "12px", color: "#64748b" }}>সর্বমোট ১৯টি ধারা ও সদস্য অঙ্গীকারপত্র</p>
      </div>

      {/* Main Screen Header & Action Bar */}
      <div className="no-print" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(2, 132, 199, 0.12)", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--foreground)", margin: 0 }}>
                ক্লাব সংবিধান ও বিধিমালা
              </h1>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
                ইউনাইটেড ভিশন ক্লাবের ১৯টি প্রাতিষ্ঠানিক ধারা ও সদস্য পরিচালন নীতিমালা
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => window.print()}
          className="btn btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.55rem 1.1rem", fontSize: "0.9rem", fontWeight: 700 }}
        >
          <Printer size={16} /> প্রিন্ট / PDF ডাউনলোড
        </button>
      </div>

      {/* Search & Quick Jump Bar */}
      <div className="no-print" style={{ backgroundColor: "#ffffff", padding: "1rem", borderRadius: "1rem", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "1.75rem" }}>
        <div style={{ position: "relative", marginBottom: "0.85rem" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input 
            type="text"
            placeholder="ধারা, চাঁদা, জরিমানা, লক-ইন বা যেকোনো নিয়ম সার্চ করুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.65rem 1rem 0.65rem 2.4rem",
              borderRadius: "0.5rem",
              border: "1px solid #cbd5e1",
              fontSize: "0.9rem",
              outline: "none"
            }}
          />
        </div>

        {/* Quick Jump Pills */}
        <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
          {articles.map((art) => (
            <a 
              key={art.id}
              href={`#${art.id}`}
              style={{
                whiteSpace: "nowrap",
                padding: "0.25rem 0.65rem",
                borderRadius: "9999px",
                backgroundColor: art.bg,
                color: art.color,
                fontSize: "0.75rem",
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.2s"
              }}
            >
              {art.number}
            </a>
          ))}
          <a 
            href="#pledge-section"
            style={{
              whiteSpace: "nowrap",
              padding: "0.25rem 0.65rem",
              borderRadius: "9999px",
              backgroundColor: "rgba(5, 150, 105, 0.12)",
              color: "#059669",
              fontSize: "0.75rem",
              fontWeight: 700,
              textDecoration: "none"
            }}
          >
            অঙ্গীকারনামা
          </a>
        </div>
      </div>

      {/* Articles List Container */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {filteredArticles.length > 0 ? (
          filteredArticles.map((art) => (
            <div 
              id={art.id}
              key={art.id}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "1rem",
                border: `1px solid ${art.color}25`,
                padding: "1.25rem 1.5rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                transition: "all 0.25s ease"
              }}
            >
              {/* Article Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1rem", paddingBottom: "0.65rem", borderBottom: `1px solid ${art.color}20` }}>
                <div style={{ padding: "0.4rem", borderRadius: "0.5rem", backgroundColor: art.bg }}>
                  {art.icon}
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: art.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {art.number}
                  </span>
                  <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                    {art.title}
                  </h2>
                </div>
              </div>

              {/* Sub-points with Bold Point Titles */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {art.points.map((p, pIdx) => (
                  <div key={pIdx} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.95rem", lineHeight: "1.6", color: "#334155" }}>
                    <div style={{ minWidth: "6px", height: "6px", borderRadius: "50%", backgroundColor: art.color, marginTop: "0.55rem" }} />
                    <div>
                      <strong style={{ fontWeight: 800, color: "#0f172a", marginRight: "0.35rem" }}>
                        {p.label}:
                      </strong>
                      <span>{p.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "#ffffff", borderRadius: "1rem", color: "#64748b" }}>
            আপনার সার্চ করা শব্দটির সাথে মিলে এমন কোনো ধারা পাওয়া যায়নি।
          </div>
        )}

        {/* ==================== MEMBERS PLEDGE & SIGNATURE PANEL ==================== */}
        <div 
          id="pledge-section"
          style={{
            backgroundColor: "#ecfdf5",
            borderRadius: "1rem",
            border: "2px solid #059669",
            padding: "1.5rem 1.75rem",
            boxShadow: "0 6px 16px rgba(5, 150, 105, 0.08)",
            marginTop: "1.5rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <CheckCircle2 size={26} color="#059669" />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#065f46", margin: 0 }}>
              ৩. সদস্যদের অঙ্গীকার ও সম্মতি প্যানেল
            </h2>
          </div>

          <p style={{ fontSize: "0.95rem", lineHeight: "1.8", color: "#15803d", fontWeight: 600, backgroundColor: "#ffffff", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #a7f3d0", marginBottom: "1.25rem" }}>
            আমরা, নিম্নস্বাক্ষরকারীগণ, সম্পূর্ণ স্বেচ্ছায়, সজ্ঞানে এবং সুস্থ মস্তিষ্কে এই পরিমার্জিত সংবিধানের ১৯টি ধারার সকল শর্ত ও নিয়মাবলি পাঠ করিয়া উহার আইনি বাধ্যবাধকতা পুঙ্খানুপুঙ্খভাবে বুঝিয়া মানিয়া চলার দৃঢ় অঙ্গীকার করিতেছি। আমরা আমাদের যৌথ মূলধনের নিরাপত্তা ও ক্লাবের শৃঙ্খলা বজায় রাখতে এই সংবিধান অনুযায়ী 'ইউনাইটেড ভিশন ক্লাব' পরিচালনার সম্মতি জ্ঞাপন করিলাম।
          </p>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", fontSize: "0.85rem", color: "#047857", fontWeight: 700 }}>
            <div>
              <span>স্বাক্ষরিত ও সংরক্ষিত: </span>
              <span style={{ textDecoration: "underline" }}>ইউনাইটেড ভিশন ক্লাব ডিজিটাল আর্কাইভ</span>
            </div>
            <div>
              <span>অবস্থান: </span>
              <span>বরইতলী, চকরিয়া, কক্সবাজার।</span>
            </div>
          </div>
        </div>

      </div>

      {/* Print CSS Rules */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print { display: none !important; }
          .only-print { display: block !important; }
          body, html, main, .layout-container, .main-content, .card-wrapper {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          @page {
            size: A4;
            margin: 0.5in;
          }
        }
      `}} />

    </div>
  );
}
