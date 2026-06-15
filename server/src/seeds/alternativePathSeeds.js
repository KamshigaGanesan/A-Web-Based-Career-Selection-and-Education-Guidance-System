import "dotenv/config";
import mongoose from "mongoose";
import { AlternativePath } from "../models/AlternativePath.js";
import { connectDB } from "../config/db.js";

const seedData = [
  {
    title: "BSc (Hons) in Information Technology",
    provider: "SLIIT",
    type: "private",
    streamTags: ["Maths", "Tech"],
    districtAvailability: ["Colombo", "Kandy", "Matara"],
    durationMonths: 48,
    feesLKR: 250000,
    entryRequirements: "3 passes at GCE A/L including Mathematics or IT",
    description:
      "A comprehensive 4-year IT degree covering software engineering, databases, networks, and AI. SLIIT is one of Sri Lanka's leading private tech universities with strong industry partnerships.",
    pros: [
      "Strong industry connections and internship programs",
      "Modern curriculum aligned with global standards",
      "Multiple campus locations across Sri Lanka",
    ],
    cons: [
      "Higher fees compared to government universities",
      "Competitive admission for scholarship seats",
    ],
    applyLink: "https://www.sliit.lk/apply",
    careerTags: ["Software", "Engineering", "IT", "Data Science"],
    ratingAvg: 4.3,
    ratingCount: 2,
    reviews: [
      { name: "Kasun", rating: 5, comment: "Excellent lecturers and lab facilities", createdAt: new Date() },
      { name: "Nethmi", rating: 4, comment: "Good industry exposure, fees are manageable with installments", createdAt: new Date() },
    ],
  },
  {
    title: "BSc in Computer Science",
    provider: "NIBM",
    type: "private",
    streamTags: ["Maths", "Tech"],
    districtAvailability: ["Colombo", "Galle", "Kurunegala"],
    durationMonths: 36,
    feesLKR: 180000,
    entryRequirements: "3 passes at GCE A/L",
    description:
      "A 3-year degree in Computer Science with specializations in cybersecurity, software engineering, and networking. Affiliated with international universities.",
    pros: [
      "Affordable compared to other private universities",
      "International university affiliations",
      "Flexible class schedules for working students",
    ],
    cons: [
      "Fewer research opportunities than larger universities",
      "Campus facilities vary by location",
    ],
    applyLink: "https://www.nibm.lk",
    careerTags: ["Software", "Cybersecurity", "Networking", "IT"],
    ratingAvg: 3.8,
    ratingCount: 1,
    reviews: [
      { name: "Dilshan", rating: 4, comment: "Good value for money", createdAt: new Date() },
    ],
  },
  {
    title: "National Diploma in Engineering Technology",
    provider: "NAITA",
    type: "diploma",
    streamTags: ["Maths", "Tech"],
    districtAvailability: ["Colombo", "Kandy", "Gampaha", "Ratnapura"],
    durationMonths: 24,
    feesLKR: 45000,
    entryRequirements: "GCE O/L with passes in Mathematics and Science",
    description:
      "A 2-year hands-on diploma covering mechanical, electrical, and civil engineering technology. Strong focus on practical skills and workshop training.",
    pros: [
      "Very affordable government-subsidized fees",
      "High employability with practical training",
      "Pathway to higher studies later",
    ],
    cons: [
      "Limited to engineering disciplines",
      "May require further study for managerial roles",
    ],
    applyLink: "https://www.naita.gov.lk",
    careerTags: ["Engineering", "Manufacturing", "Construction", "Electrical"],
    ratingAvg: 4.0,
    ratingCount: 1,
    reviews: [
      { name: "Ruwan", rating: 4, comment: "Practical skills that employers value", createdAt: new Date() },
    ],
  },
  {
    title: "Diploma in Nursing & Healthcare",
    provider: "KAATSU International University",
    type: "diploma",
    streamTags: ["Bio"],
    districtAvailability: ["Colombo"],
    durationMonths: 36,
    feesLKR: 200000,
    entryRequirements: "GCE A/L with Biology, minimum 2 passes",
    description:
      "A 3-year diploma program in nursing with clinical rotations at partner hospitals. Includes modules on patient care, pharmacology, and community health.",
    pros: [
      "High demand for nursing professionals locally and abroad",
      "Clinical placements at leading hospitals",
      "Pathway to BSc Nursing",
    ],
    cons: [
      "Physically demanding clinical rotations",
      "Limited to Colombo campus",
    ],
    applyLink: "https://www.kiu.ac.lk",
    careerTags: ["Healthcare", "Nursing", "Medicine"],
    ratingAvg: 4.2,
    ratingCount: 1,
    reviews: [
      { name: "Sanduni", rating: 4, comment: "Clinical experience is invaluable", createdAt: new Date() },
    ],
  },
  {
    title: "NVQ Level 5 in Software Development",
    provider: "VTA (Vocational Training Authority)",
    type: "vocational",
    streamTags: ["Maths", "Tech", "Commerce"],
    districtAvailability: ["Colombo", "Kandy", "Galle", "Jaffna", "Kurunegala", "Ratnapura"],
    durationMonths: 12,
    feesLKR: 15000,
    entryRequirements: "GCE O/L with IT or Mathematics pass",
    description:
      "An intensive 1-year vocational program in software development covering web development, database management, and basic mobile app development.",
    pros: [
      "Extremely affordable",
      "Quick path to employment",
      "Available across many districts",
      "NVQ certification recognized nationally",
    ],
    cons: [
      "Not equivalent to a degree for some employers",
      "Limited theoretical depth",
    ],
    applyLink: "https://www.vtasl.gov.lk",
    careerTags: ["Software", "Web Development", "IT"],
    ratingAvg: 3.5,
    ratingCount: 0,
    reviews: [],
  },
  {
    title: "NVQ Level 4 in Automobile Technology",
    provider: "NAITA",
    type: "vocational",
    streamTags: ["Maths", "Tech"],
    districtAvailability: ["Colombo", "Gampaha", "Kandy"],
    durationMonths: 18,
    feesLKR: 25000,
    entryRequirements: "GCE O/L with passes in Mathematics and Science",
    description:
      "Hands-on vocational training in automobile mechanics, diagnostics, and repair. Includes practical workshops and industry attachments.",
    pros: [
      "Strong practical focus with real vehicles",
      "Low cost with government subsidies",
      "Growing demand for skilled automobile technicians",
    ],
    cons: [
      "Physically demanding",
      "Limited career progression without further study",
    ],
    applyLink: "https://www.naita.gov.lk",
    careerTags: ["Engineering", "Automobile", "Manufacturing"],
    ratingAvg: 3.7,
    ratingCount: 0,
    reviews: [],
  },
  {
    title: "Foundation Programme (Engineering Pathway) - University of London",
    provider: "British Council Sri Lanka",
    type: "foundation",
    streamTags: ["Maths", "Tech"],
    districtAvailability: ["Colombo"],
    durationMonths: 12,
    feesLKR: 450000,
    entryRequirements: "GCE A/L with Mathematics, minimum C pass",
    description:
      "A 1-year foundation program that prepares students for entry into University of London engineering and computing degree programs. Covers mathematics, physics, and academic English.",
    pros: [
      "Direct pathway to a top UK university degree",
      "Internationally recognized qualification",
      "Study in Sri Lanka before transferring abroad",
    ],
    cons: [
      "Expensive compared to local options",
      "Requires strong English proficiency",
      "Only available in Colombo",
    ],
    applyLink: "https://www.britishcouncil.lk",
    careerTags: ["Engineering", "Software", "IT", "Research"],
    ratingAvg: 4.5,
    ratingCount: 1,
    reviews: [
      { name: "Amal", rating: 5, comment: "Perfect stepping stone for studying abroad", createdAt: new Date() },
    ],
  },
  {
    title: "BSc (Hons) Business Management",
    provider: "NSBM Green University",
    type: "private",
    streamTags: ["Commerce", "Arts"],
    districtAvailability: ["Colombo"],
    durationMonths: 36,
    feesLKR: 220000,
    entryRequirements: "3 passes at GCE A/L in any stream",
    description:
      "A 3-year business degree covering marketing, finance, HR management, and entrepreneurship. Strong focus on industry projects and soft skills.",
    pros: [
      "Green campus with modern facilities",
      "Plymouth University UK affiliation",
      "Strong alumni network in corporate sector",
    ],
    cons: [
      "Primarily Colombo-based",
      "Business field is highly competitive",
    ],
    applyLink: "https://www.nsbm.ac.lk",
    careerTags: ["Business", "Marketing", "Finance", "Management"],
    ratingAvg: 4.1,
    ratingCount: 1,
    reviews: [
      { name: "Tharushi", rating: 4, comment: "Great campus environment and lecturers", createdAt: new Date() },
    ],
  },
  {
    title: "Diploma in Agriculture & Food Technology",
    provider: "Wayamba University (External)",
    type: "diploma",
    streamTags: ["Bio", "Maths"],
    districtAvailability: ["Kurunegala", "Colombo", "Kandy"],
    durationMonths: 24,
    feesLKR: 60000,
    entryRequirements: "GCE A/L with Biology or Agriculture",
    description:
      "A 2-year external diploma covering crop science, food processing, agribusiness, and sustainable farming practices.",
    pros: [
      "Affordable government university program",
      "Growing demand for agri-tech professionals",
      "Practical field training included",
    ],
    cons: [
      "External program with limited campus resources",
      "Niche field with specific career paths",
    ],
    applyLink: "https://www.wyb.ac.lk",
    careerTags: ["Agriculture", "Food Science", "Research"],
    ratingAvg: 3.9,
    ratingCount: 0,
    reviews: [],
  },
  {
    title: "Study in Malaysia - Computer Science (Pathway)",
    provider: "EduLanka (Agency)",
    type: "foreign",
    streamTags: ["Maths", "Tech", "Commerce"],
    districtAvailability: ["Colombo", "Kandy"],
    durationMonths: 36,
    feesLKR: 500000,
    entryRequirements: "GCE A/L with 3 passes, IELTS 5.5+",
    description:
      "Study computer science at partner universities in Malaysia including APU, Taylor's, and UCSI. Includes visa processing, accommodation assistance, and scholarship guidance.",
    pros: [
      "Internationally recognized Malaysian degree",
      "Lower cost than UK/Australia pathways",
      "Multicultural experience",
      "Post-study work visa available",
    ],
    cons: [
      "Living expenses abroad",
      "Distance from family",
      "Requires English proficiency certification",
    ],
    applyLink: "https://www.edulanka.lk",
    careerTags: ["Software", "IT", "Engineering", "Data Science"],
    ratingAvg: 4.0,
    ratingCount: 1,
    reviews: [
      { name: "Chamara", rating: 4, comment: "Affordable international option", createdAt: new Date() },
    ],
  },
  {
    title: "Foundation in Arts & Humanities",
    provider: "University of Colombo (External)",
    type: "foundation",
    streamTags: ["Arts"],
    districtAvailability: ["Colombo", "Kandy", "Jaffna", "Galle"],
    durationMonths: 12,
    feesLKR: 35000,
    entryRequirements: "GCE A/L with 2 passes in Arts subjects",
    description:
      "A 1-year foundation program for students who did not gain direct university entry. Covers sociology, political science, languages, and research methodology.",
    pros: [
      "Affordable government university foundation",
      "Multiple study center locations",
      "Direct pathway to external degree programs",
    ],
    cons: [
      "Limited to Arts stream subjects",
      "External program with self-study emphasis",
    ],
    applyLink: "https://www.cmb.ac.lk/external",
    careerTags: ["Teaching", "Social Work", "Journalism", "Public Service"],
    ratingAvg: 3.6,
    ratingCount: 0,
    reviews: [],
  },
  {
    title: "Diploma in Tourism & Hospitality Management",
    provider: "Sri Lanka Institute of Tourism & Hotel Management",
    type: "diploma",
    streamTags: ["Commerce", "Arts"],
    districtAvailability: ["Colombo", "Kandy"],
    durationMonths: 24,
    feesLKR: 85000,
    entryRequirements: "GCE A/L with 2 passes, English proficiency",
    description:
      "A 2-year diploma covering hotel operations, tour management, event planning, and customer service. Includes practical training at partner hotels.",
    pros: [
      "Booming tourism industry in Sri Lanka",
      "Practical training at 5-star hotels",
      "International career opportunities",
    ],
    cons: [
      "Irregular work hours in hospitality",
      "Seasonal demand fluctuations",
    ],
    applyLink: "https://www.slithm.edu.lk",
    careerTags: ["Tourism", "Hospitality", "Management", "Business"],
    ratingAvg: 4.0,
    ratingCount: 0,
    reviews: [],
  },
];

async function seed() {
  try {
    await connectDB();
    await AlternativePath.deleteMany({});
    const result = await AlternativePath.insertMany(seedData);
    console.log(`Seeded ${result.length} alternative paths`);
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
