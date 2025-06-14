
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
    title: "JavaScript Fundamentals",
    description: "Master the basics of JavaScript programming with hands-on exercises and real-world examples.",
    instructor: "Sarah Johnson",
    duration: "8 hours",
    students: 12450,
    rating: 4.8,
    image: "photo-1461749280684-dccba630e2f6",
    lessons: [
      { id: "1-1", title: "Introduction to JavaScript", duration: "15 min", completed: false },
      { id: "1-2", title: "Variables and Data Types", duration: "20 min", completed: false },
      { id: "1-3", title: "Functions and Scope", duration: "25 min", completed: false },
      { id: "1-4", title: "Arrays and Objects", duration: "30 min", completed: false },
      { id: "1-5", title: "DOM Manipulation", duration: "35 min", completed: false },
    ]
  },
  {
    id: "2",
    title: "React Development Bootcamp",
    description: "Build modern web applications with React, from basic components to advanced state management.",
    instructor: "Mike Chen",
    duration: "12 hours",
    students: 8930,
    rating: 4.9,
    image: "photo-1486312338219-ce68d2c6f44d",
    lessons: [
      { id: "2-1", title: "React Basics", duration: "20 min", completed: false },
      { id: "2-2", title: "Components and Props", duration: "25 min", completed: false },
      { id: "2-3", title: "State and Lifecycle", duration: "30 min", completed: false },
      { id: "2-4", title: "Hooks Introduction", duration: "35 min", completed: false },
      { id: "2-5", title: "Building Real Apps", duration: "40 min", completed: false },
    ]
  },
  {
    id: "3",
    title: "Python for Data Science",
    description: "Learn Python programming with focus on data analysis, visualization, and machine learning basics.",
    instructor: "Dr. Emily Rodriguez",
    duration: "15 hours",
    students: 15670,
    rating: 4.7,
    image: "photo-1498050108023-c5249f4df085",
    lessons: [
      { id: "3-1", title: "Python Basics", duration: "25 min", completed: false },
      { id: "3-2", title: "Data Structures", duration: "30 min", completed: false },
      { id: "3-3", title: "Pandas and NumPy", duration: "35 min", completed: false },
      { id: "3-4", title: "Data Visualization", duration: "40 min", completed: false },
      { id: "3-5", title: "Machine Learning Intro", duration: "45 min", completed: false },
    ]
  },
  {
    id: "4",
    title: "Web Design Masterclass",
    description: "Create beautiful, responsive websites with modern CSS, HTML, and design principles.",
    instructor: "Alex Thompson",
    duration: "10 hours",
    students: 9340,
    rating: 4.6,
    image: "photo-1473091534298-04dcbce3278c",
    lessons: [
      { id: "4-1", title: "HTML Foundations", duration: "20 min", completed: false },
      { id: "4-2", title: "CSS Styling", duration: "25 min", completed: false },
      { id: "4-3", title: "Responsive Design", duration: "30 min", completed: false },
      { id: "4-4", title: "Flexbox and Grid", duration: "35 min", completed: false },
      { id: "4-5", title: "Modern CSS Features", duration: "40 min", completed: false },
    ]
  },
  {
    id: "5",
    title: "Node.js Backend Development",
    description: "Build scalable server-side applications with Node.js, Express, and MongoDB.",
    instructor: "David Kumar",
    duration: "14 hours",
    students: 7820,
    rating: 4.8,
    image: "photo-1519389950473-47ba0277781c",
    lessons: [
      { id: "5-1", title: "Node.js Fundamentals", duration: "25 min", completed: false },
      { id: "5-2", title: "Express Framework", duration: "30 min", completed: false },
      { id: "5-3", title: "Database Integration", duration: "35 min", completed: false },
      { id: "5-4", title: "Authentication & Security", duration: "40 min", completed: false },
      { id: "5-5", title: "Deployment Strategies", duration: "30 min", completed: false },
    ]
  },
  {
    id: "6",
    title: "UI/UX Design Principles",
    description: "Learn user-centered design, wireframing, prototyping, and modern design tools.",
    instructor: "Lisa Park",
    duration: "11 hours",
    students: 11200,
    rating: 4.9,
    image: "photo-1461749280684-dccba630e2f6",
    lessons: [
      { id: "6-1", title: "Design Thinking", duration: "20 min", completed: false },
      { id: "6-2", title: "User Research", duration: "25 min", completed: false },
      { id: "6-3", title: "Wireframing", duration: "30 min", completed: false },
      { id: "6-4", title: "Prototyping", duration: "35 min", completed: false },
      { id: "6-5", title: "Design Systems", duration: "40 min", completed: false },
    ]
  }
];

export const getUserProgress = (): Record<string, number> => {
  // Simulate user progress data
  return {
    "1": 60,
    "2": 25,
    "3": 0,
    "4": 80,
    "5": 0,
    "6": 15,
  };
};
