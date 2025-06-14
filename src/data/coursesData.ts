
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  students: number;
  rating: number;
  image: string;
  lessons: Lesson[];
  category: string;
  level: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  videoUrl?: string;
}

export const coursesData: Course[] = [
  {
    id: "1",
    title: "Automotive Technology",
    description: "Comprehensive training in vehicle maintenance, repair, and diagnostics. Learn engine systems, electrical systems, and modern automotive technology.",
    instructor: "John Mwangi",
    duration: "6 months",
    students: 450,
    rating: 4.7,
    image: "photo-1486312338219-ce68d2c6f44d",
    category: "Engineering",
    level: "Diploma",
    lessons: [
      { id: "1-1", title: "Engine Fundamentals", duration: "45 min", completed: false },
      { id: "1-2", title: "Electrical Systems", duration: "50 min", completed: false },
      { id: "1-3", title: "Brake Systems", duration: "40 min", completed: false },
      { id: "1-4", title: "Transmission Systems", duration: "55 min", completed: false },
      { id: "1-5", title: "Diagnostic Tools", duration: "60 min", completed: false },
    ]
  },
  {
    id: "2",
    title: "Information Technology",
    description: "Master computer systems, networking, software development, and cybersecurity fundamentals for the digital age.",
    instructor: "Grace Wanjiku",
    duration: "12 months",
    students: 890,
    rating: 4.9,
    image: "photo-1461749280684-dccba630e2f6",
    category: "Technology",
    level: "Diploma",
    lessons: [
      { id: "2-1", title: "Computer Fundamentals", duration: "30 min", completed: false },
      { id: "2-2", title: "Programming Basics", duration: "45 min", completed: false },
      { id: "2-3", title: "Network Administration", duration: "50 min", completed: false },
      { id: "2-4", title: "Database Management", duration: "40 min", completed: false },
      { id: "2-5", title: "Cybersecurity Basics", duration: "35 min", completed: false },
    ]
  },
  {
    id: "3",
    title: "Electrical Installation",
    description: "Learn electrical wiring, installation, maintenance, and safety procedures for residential and commercial buildings.",
    instructor: "Peter Kariuki",
    duration: "8 months",
    students: 567,
    rating: 4.8,
    image: "photo-1498050108023-c5249f4df085",
    category: "Engineering",
    level: "Certificate",
    lessons: [
      { id: "3-1", title: "Electrical Safety", duration: "40 min", completed: false },
      { id: "3-2", title: "Wiring Systems", duration: "50 min", completed: false },
      { id: "3-3", title: "Circuit Design", duration: "45 min", completed: false },
      { id: "3-4", title: "Motor Controls", duration: "55 min", completed: false },
      { id: "3-5", title: "Maintenance Procedures", duration: "35 min", completed: false },
    ]
  },
  {
    id: "4",
    title: "Hospitality Management",
    description: "Comprehensive training in hotel operations, customer service, food and beverage management, and tourism industry practices.",
    instructor: "Mary Akinyi",
    duration: "10 months",
    students: 340,
    rating: 4.6,
    image: "photo-1473091534298-04dcbce3278c",
    category: "Hospitality",
    level: "Diploma",
    lessons: [
      { id: "4-1", title: "Hotel Operations", duration: "35 min", completed: false },
      { id: "4-2", title: "Customer Service", duration: "30 min", completed: false },
      { id: "4-3", title: "Food & Beverage", duration: "40 min", completed: false },
      { id: "4-4", title: "Event Management", duration: "45 min", completed: false },
      { id: "4-5", title: "Tourism Principles", duration: "50 min", completed: false },
    ]
  },
  {
    id: "5",
    title: "Building Construction",
    description: "Learn construction techniques, building materials, project management, and safety standards in the construction industry.",
    instructor: "David Otieno",
    duration: "14 months",
    students: 782,
    rating: 4.8,
    image: "photo-1519389950473-47ba0277781c",
    category: "Construction",
    level: "Diploma",
    lessons: [
      { id: "5-1", title: "Construction Materials", duration: "45 min", completed: false },
      { id: "5-2", title: "Foundation Work", duration: "55 min", completed: false },
      { id: "5-3", title: "Structural Systems", duration: "50 min", completed: false },
      { id: "5-4", title: "Project Management", duration: "40 min", completed: false },
      { id: "5-5", title: "Safety Standards", duration: "35 min", completed: false },
    ]
  },
  {
    id: "6",
    title: "Fashion Design & Tailoring",
    description: "Master fashion design principles, pattern making, garment construction, and entrepreneurship in the fashion industry.",
    instructor: "Susan Mutua",
    duration: "9 months",
    students: 420,
    rating: 4.7,
    image: "photo-1461749280684-dccba630e2f6",
    category: "Creative Arts",
    level: "Certificate",
    lessons: [
      { id: "6-1", title: "Design Principles", duration: "40 min", completed: false },
      { id: "6-2", title: "Pattern Making", duration: "50 min", completed: false },
      { id: "6-3", title: "Garment Construction", duration: "60 min", completed: false },
      { id: "6-4", title: "Fashion Business", duration: "35 min", completed: false },
      { id: "6-5", title: "Quality Control", duration: "30 min", completed: false },
    ]
  },
  {
    id: "7",
    title: "Plumbing Technology",
    description: "Comprehensive plumbing training covering pipe installation, water systems, drainage, and modern plumbing technologies.",
    instructor: "James Kiprotich",
    duration: "6 months",
    students: 290,
    rating: 4.5,
    image: "photo-1486312338219-ce68d2c6f44d",
    category: "Engineering",
    level: "Certificate",
    lessons: [
      { id: "7-1", title: "Pipe Systems", duration: "45 min", completed: false },
      { id: "7-2", title: "Water Supply", duration: "40 min", completed: false },
      { id: "7-3", title: "Drainage Systems", duration: "50 min", completed: false },
      { id: "7-4", title: "Plumbing Tools", duration: "35 min", completed: false },
      { id: "7-5", title: "Maintenance & Repair", duration: "45 min", completed: false },
    ]
  },
  {
    id: "8",
    title: "Agriculture Technology",
    description: "Modern farming techniques, crop production, livestock management, and agricultural business practices for sustainable farming.",
    instructor: "Catherine Wambui",
    duration: "12 months",
    students: 630,
    rating: 4.8,
    image: "photo-1498050108023-c5249f4df085",
    category: "Agriculture",
    level: "Diploma",
    lessons: [
      { id: "8-1", title: "Crop Production", duration: "50 min", completed: false },
      { id: "8-2", title: "Soil Management", duration: "45 min", completed: false },
      { id: "8-3", title: "Livestock Care", duration: "40 min", completed: false },
      { id: "8-4", title: "Farm Equipment", duration: "35 min", completed: false },
      { id: "8-5", title: "Agricultural Business", duration: "55 min", completed: false },
    ]
  },
  {
    id: "9",
    title: "Secretarial Studies",
    description: "Office administration, communication skills, computer applications, and business correspondence for modern office environments.",
    instructor: "Alice Njoki",
    duration: "8 months",
    students: 410,
    rating: 4.6,
    image: "photo-1473091534298-04dcbce3278c",
    category: "Business",
    level: "Certificate",
    lessons: [
      { id: "9-1", title: "Office Administration", duration: "35 min", completed: false },
      { id: "9-2", title: "Business Communication", duration: "40 min", completed: false },
      { id: "9-3", title: "Computer Applications", duration: "45 min", completed: false },
      { id: "9-4", title: "Records Management", duration: "30 min", completed: false },
      { id: "9-5", title: "Customer Relations", duration: "35 min", completed: false },
    ]
  },
  {
    id: "10",
    title: "Welding & Fabrication",
    description: "Learn various welding techniques, metal fabrication, safety procedures, and quality control in metalwork industries.",
    instructor: "Robert Kimani",
    duration: "7 months",
    students: 380,
    rating: 4.7,
    image: "photo-1519389950473-47ba0277781c",
    category: "Engineering",
    level: "Certificate",
    lessons: [
      { id: "10-1", title: "Arc Welding", duration: "50 min", completed: false },
      { id: "10-2", title: "Gas Welding", duration: "45 min", completed: false },
      { id: "10-3", title: "Metal Fabrication", duration: "55 min", completed: false },
      { id: "10-4", title: "Welding Safety", duration: "30 min", completed: false },
      { id: "10-5", title: "Quality Control", duration: "40 min", completed: false },
    ]
  }
];

export const getUserProgress = (): Record<string, number> => {
  // Simulate user progress data
  return {
    "1": 25,
    "2": 60,
    "3": 0,
    "4": 80,
    "5": 15,
    "6": 0,
    "7": 45,
    "8": 30,
    "9": 70,
    "10": 0,
  };
};
