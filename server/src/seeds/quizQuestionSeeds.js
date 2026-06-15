import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { QuizQuestion } from "../models/QuizQuestion.js";

const questions = [
  {
    questionText: "What type of activities do you enjoy most?",
    options: [
      { text: "Building apps and writing code", weightTags: [{ tag: "IT", value: 3 }, { tag: "Engineering", value: 1 }] },
      { text: "Conducting experiments and research", weightTags: [{ tag: "Medicine", value: 2 }, { tag: "Engineering", value: 2 }] },
      { text: "Managing money and investments", weightTags: [{ tag: "Business", value: 3 }, { tag: "Law", value: 1 }] },
      { text: "Drawing, painting, or designing", weightTags: [{ tag: "Design", value: 3 }, { tag: "Education", value: 1 }] },
    ],
    stream: "Common",
    category: "interests",
    order: 1,
  },
  {
    questionText: "Which subject do you find most fascinating?",
    options: [
      { text: "Computer Science / Programming", weightTags: [{ tag: "IT", value: 3 }] },
      { text: "Biology / Chemistry", weightTags: [{ tag: "Medicine", value: 3 }] },
      { text: "Mathematics / Statistics", weightTags: [{ tag: "Engineering", value: 2 }, { tag: "Business", value: 1 }] },
      { text: "History / Literature / Languages", weightTags: [{ tag: "Education", value: 2 }, { tag: "Law", value: 1 }] },
    ],
    stream: "Common",
    category: "interests",
    order: 2,
  },
  {
    questionText: "How do you approach problem solving?",
    options: [
      { text: "Break it down logically into smaller parts", weightTags: [{ tag: "IT", value: 2 }, { tag: "Engineering", value: 2 }] },
      { text: "Research deeply and gather evidence", weightTags: [{ tag: "Medicine", value: 2 }, { tag: "Law", value: 2 }] },
      { text: "Think about costs, benefits, and strategy", weightTags: [{ tag: "Business", value: 3 }] },
      { text: "Brainstorm creative and visual solutions", weightTags: [{ tag: "Design", value: 3 }] },
    ],
    stream: "Common",
    category: "personality",
    order: 3,
  },
  {
    questionText: "Which work environment appeals to you?",
    options: [
      { text: "Tech company or startup", weightTags: [{ tag: "IT", value: 3 }, { tag: "Design", value: 1 }] },
      { text: "Hospital, lab, or research center", weightTags: [{ tag: "Medicine", value: 3 }] },
      { text: "Corporate office or bank", weightTags: [{ tag: "Business", value: 3 }] },
      { text: "School, university, or community center", weightTags: [{ tag: "Education", value: 3 }] },
    ],
    stream: "Common",
    category: "personality",
    order: 4,
  },
  {
    questionText: "What motivates you the most?",
    options: [
      { text: "Innovation and building new technology", weightTags: [{ tag: "IT", value: 2 }, { tag: "Engineering", value: 2 }] },
      { text: "Healing people and saving lives", weightTags: [{ tag: "Medicine", value: 3 }] },
      { text: "Financial success and leadership", weightTags: [{ tag: "Business", value: 3 }] },
      { text: "Creating beautiful, meaningful things", weightTags: [{ tag: "Design", value: 3 }] },
    ],
    stream: "Common",
    category: "personality",
    order: 5,
  },
  {
    questionText: "How comfortable are you with advanced mathematics?",
    options: [
      { text: "I love it — calculus, algebra, all of it", weightTags: [{ tag: "Engineering", value: 3 }, { tag: "IT", value: 1 }] },
      { text: "I'm decent with applied math and stats", weightTags: [{ tag: "Business", value: 2 }, { tag: "IT", value: 1 }] },
      { text: "I prefer biology and chemistry over math", weightTags: [{ tag: "Medicine", value: 3 }] },
      { text: "Numbers aren't really my thing", weightTags: [{ tag: "Design", value: 2 }, { tag: "Education", value: 1 }] },
    ],
    stream: "Maths",
    category: "aptitude",
    order: 6,
  },
  {
    questionText: "Which of these tools would you most like to master?",
    options: [
      { text: "Python, JavaScript, or other programming languages", weightTags: [{ tag: "IT", value: 3 }] },
      { text: "Microscopes, lab equipment, stethoscope", weightTags: [{ tag: "Medicine", value: 3 }] },
      { text: "Excel, SAP, or accounting software", weightTags: [{ tag: "Business", value: 3 }] },
      { text: "Photoshop, Figma, or sketching tools", weightTags: [{ tag: "Design", value: 3 }] },
    ],
    stream: "Common",
    category: "interests",
    order: 7,
  },
  {
    questionText: "How do you prefer to learn new things?",
    options: [
      { text: "Hands-on coding or building prototypes", weightTags: [{ tag: "IT", value: 2 }, { tag: "Engineering", value: 2 }] },
      { text: "Reading research papers and textbooks", weightTags: [{ tag: "Medicine", value: 2 }, { tag: "Law", value: 1 }] },
      { text: "Case studies and real-world business scenarios", weightTags: [{ tag: "Business", value: 3 }] },
      { text: "Visual tutorials, workshops, and mentoring", weightTags: [{ tag: "Design", value: 2 }, { tag: "Education", value: 2 }] },
    ],
    stream: "Common",
    category: "personality",
    order: 8,
  },
  {
    questionText: "Which career sounds most exciting?",
    options: [
      { text: "Software Engineer or Data Scientist", weightTags: [{ tag: "IT", value: 3 }] },
      { text: "Doctor, Pharmacist, or Biotech Researcher", weightTags: [{ tag: "Medicine", value: 3 }] },
      { text: "CEO, Financial Analyst, or Entrepreneur", weightTags: [{ tag: "Business", value: 3 }] },
      { text: "Graphic Designer, Architect, or UX Designer", weightTags: [{ tag: "Design", value: 3 }] },
    ],
    stream: "Common",
    category: "interests",
    order: 9,
  },
  {
    questionText: "What would you rather do on a free day?",
    options: [
      { text: "Build a personal project or learn a new framework", weightTags: [{ tag: "IT", value: 3 }] },
      { text: "Read about medical breakthroughs", weightTags: [{ tag: "Medicine", value: 3 }] },
      { text: "Analyze stock markets or plan a business", weightTags: [{ tag: "Business", value: 3 }] },
      { text: "Sketch, photograph, or rearrange my room", weightTags: [{ tag: "Design", value: 3 }] },
    ],
    stream: "Common",
    category: "interests",
    order: 10,
  },
  {
    questionText: "How do you feel about working with biological specimens?",
    options: [
      { text: "I love dissections and lab work", weightTags: [{ tag: "Medicine", value: 3 }] },
      { text: "It's okay but not my passion", weightTags: [{ tag: "Engineering", value: 1 }, { tag: "Education", value: 1 }] },
      { text: "I'd rather work with data and machines", weightTags: [{ tag: "IT", value: 2 }, { tag: "Engineering", value: 1 }] },
      { text: "Not at all — I prefer creative or people work", weightTags: [{ tag: "Design", value: 2 }, { tag: "Business", value: 1 }] },
    ],
    stream: "Bio",
    category: "aptitude",
    order: 11,
  },
  {
    questionText: "How important is financial independence to you?",
    options: [
      { text: "Very — I want to build wealth early", weightTags: [{ tag: "Business", value: 3 }] },
      { text: "Important, but purpose matters more", weightTags: [{ tag: "Medicine", value: 1 }, { tag: "Education", value: 2 }] },
      { text: "I want a stable tech salary", weightTags: [{ tag: "IT", value: 2 }, { tag: "Engineering", value: 1 }] },
      { text: "I'd trade money for creative freedom", weightTags: [{ tag: "Design", value: 3 }] },
    ],
    stream: "Commerce",
    category: "personality",
    order: 12,
  },
  {
    questionText: "Which of these group projects would you lead?",
    options: [
      { text: "Developing a mobile app", weightTags: [{ tag: "IT", value: 3 }] },
      { text: "Organizing a health awareness campaign", weightTags: [{ tag: "Medicine", value: 2 }, { tag: "Education", value: 1 }] },
      { text: "Running a school business venture", weightTags: [{ tag: "Business", value: 3 }] },
      { text: "Creating a short film or art exhibit", weightTags: [{ tag: "Design", value: 3 }] },
    ],
    stream: "Common",
    category: "interests",
    order: 13,
  },
  {
    questionText: "How do you handle stress and deadlines?",
    options: [
      { text: "I stay calm and debug systematically", weightTags: [{ tag: "IT", value: 2 }, { tag: "Engineering", value: 2 }] },
      { text: "I stay patient and follow protocols", weightTags: [{ tag: "Medicine", value: 2 }, { tag: "Law", value: 1 }] },
      { text: "I prioritize tasks and delegate quickly", weightTags: [{ tag: "Business", value: 3 }] },
      { text: "I get inspired by pressure — it sparks creativity", weightTags: [{ tag: "Design", value: 3 }] },
    ],
    stream: "Common",
    category: "personality",
    order: 14,
  },
  {
    questionText: "Which describes your ideal college major?",
    options: [
      { text: "Computer Engineering or IT", weightTags: [{ tag: "IT", value: 3 }, { tag: "Engineering", value: 1 }] },
      { text: "Medicine, Nursing, or Biomedical Science", weightTags: [{ tag: "Medicine", value: 3 }] },
      { text: "Business Administration or Finance", weightTags: [{ tag: "Business", value: 3 }] },
      { text: "Fine Arts, Architecture, or Media", weightTags: [{ tag: "Design", value: 3 }] },
    ],
    stream: "Common",
    category: "interests",
    order: 15,
  },
  {
    questionText: "Which real-world issue would you most like to solve?",
    options: [
      { text: "Cybersecurity threats and digital privacy", weightTags: [{ tag: "IT", value: 3 }] },
      { text: "Access to healthcare in rural areas", weightTags: [{ tag: "Medicine", value: 2 }, { tag: "Education", value: 1 }] },
      { text: "Poverty and economic inequality", weightTags: [{ tag: "Business", value: 2 }, { tag: "Law", value: 2 }] },
      { text: "Urban planning and sustainable design", weightTags: [{ tag: "Design", value: 2 }, { tag: "Engineering", value: 2 }] },
    ],
    stream: "Common",
    category: "interests",
    order: 16,
  },
  {
    questionText: "What type of books or content do you consume?",
    options: [
      { text: "Tech blogs, dev tutorials, hacker news", weightTags: [{ tag: "IT", value: 3 }] },
      { text: "Scientific journals and medical documentaries", weightTags: [{ tag: "Medicine", value: 3 }] },
      { text: "Business podcasts, Forbes, financial news", weightTags: [{ tag: "Business", value: 3 }] },
      { text: "Design blogs, Pinterest, art magazines", weightTags: [{ tag: "Design", value: 3 }] },
    ],
    stream: "Common",
    category: "interests",
    order: 17,
  },
  {
    questionText: "Which skill are you most confident in?",
    options: [
      { text: "Logical reasoning and coding", weightTags: [{ tag: "IT", value: 3 }] },
      { text: "Attention to detail and careful observation", weightTags: [{ tag: "Medicine", value: 2 }, { tag: "Law", value: 1 }] },
      { text: "Negotiation and persuasion", weightTags: [{ tag: "Business", value: 2 }, { tag: "Law", value: 2 }] },
      { text: "Visual composition and aesthetics", weightTags: [{ tag: "Design", value: 3 }] },
    ],
    stream: "Common",
    category: "aptitude",
    order: 18,
  },
  {
    questionText: "How do you feel about public speaking and debating?",
    options: [
      { text: "I prefer written communication (docs, code)", weightTags: [{ tag: "IT", value: 2 }, { tag: "Engineering", value: 1 }] },
      { text: "I can present research findings confidently", weightTags: [{ tag: "Medicine", value: 2 }] },
      { text: "I love pitching ideas and persuading people", weightTags: [{ tag: "Business", value: 2 }, { tag: "Law", value: 2 }] },
      { text: "I'd rather teach or mentor one-on-one", weightTags: [{ tag: "Education", value: 3 }] },
    ],
    stream: "Arts",
    category: "personality",
    order: 19,
  },
  {
    questionText: "Where do you see yourself in 10 years?",
    options: [
      { text: "Leading a tech team or running a startup", weightTags: [{ tag: "IT", value: 2 }, { tag: "Business", value: 1 }, { tag: "Engineering", value: 1 }] },
      { text: "Working as a specialist doctor or researcher", weightTags: [{ tag: "Medicine", value: 3 }] },
      { text: "Managing a company or investment portfolio", weightTags: [{ tag: "Business", value: 3 }] },
      { text: "Running my own design studio or teaching art", weightTags: [{ tag: "Design", value: 2 }, { tag: "Education", value: 2 }] },
    ],
    stream: "Common",
    category: "interests",
    order: 20,
  },
];

async function seed() {
  await connectDB();
  await QuizQuestion.deleteMany({});
  const result = await QuizQuestion.insertMany(questions);
  console.log(`Seeded ${result.length} quiz questions`);
  mongoose.connection.close();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
