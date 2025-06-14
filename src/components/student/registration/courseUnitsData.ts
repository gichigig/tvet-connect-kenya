
import { AvailableUnit } from './types';

export const courseUnits: Record<string, Record<number, AvailableUnit[]>> = {
  "Software Engineering": {
    1: [
      {
        id: "se1-1",
        code: "PROG101",
        name: "Introduction to Programming",
        lecturer: "Dr. John Kamau",
        credits: 4,
        semester: "Semester 1",
        year: 1,
        course: "Software Engineering",
        prerequisites: [],
        description: "Fundamentals of programming using Python",
        schedule: "Mon, Wed, Fri 8:00-10:00 AM",
        whatsappLink: "https://chat.whatsapp.com/prog101-group",
        hasDiscussionGroup: true
      },
      {
        id: "se1-2",
        code: "MATH101",
        name: "Discrete Mathematics",
        lecturer: "Prof. Mary Wanjiku",
        credits: 3,
        semester: "Semester 1",
        year: 1,
        course: "Software Engineering",
        prerequisites: [],
        description: "Mathematical foundations for computer science",
        schedule: "Tue, Thu 10:00-12:00 PM",
        hasDiscussionGroup: false
      },
      {
        id: "se1-3",
        code: "COM101",
        name: "Computer Fundamentals",
        lecturer: "Mr. Peter Ochieng",
        credits: 3,
        semester: "Semester 1",
        year: 1,
        course: "Software Engineering",
        prerequisites: [],
        description: "Basic computer concepts and digital literacy",
        schedule: "Mon, Wed 2:00-4:00 PM",
        whatsappLink: "https://chat.whatsapp.com/com101-group",
        hasDiscussionGroup: true
      }
    ],
    2: [
      {
        id: "se2-1",
        code: "OOP201",
        name: "Object Oriented Programming",
        lecturer: "Dr. Sarah Kimani",
        credits: 4,
        semester: "Semester 1",
        year: 2,
        course: "Software Engineering",
        prerequisites: ["PROG101"],
        description: "Object-oriented programming concepts using Java",
        schedule: "Mon, Wed, Fri 9:00-11:00 AM",
        whatsappLink: "https://chat.whatsapp.com/oop201-group",
        hasDiscussionGroup: true
      },
      {
        id: "se2-2",
        code: "DSA201",
        name: "Data Structures and Algorithms",
        lecturer: "Mr. James Mwangi",
        credits: 4,
        semester: "Semester 1",
        year: 2,
        course: "Software Engineering",
        prerequisites: ["PROG101", "MATH101"],
        description: "Fundamental data structures and algorithmic thinking",
        schedule: "Tue, Thu 8:00-10:00 AM",
        hasDiscussionGroup: false
      }
    ],
    3: [
      {
        id: "se3-1",
        code: "WEB301",
        name: "Web Development",
        lecturer: "Ms. Grace Wanjiru",
        credits: 4,
        semester: "Semester 1",
        year: 3,
        course: "Software Engineering",
        prerequisites: ["OOP201"],
        description: "Full-stack web development with modern frameworks",
        schedule: "Mon, Wed, Fri 1:00-3:00 PM",
        whatsappLink: "https://chat.whatsapp.com/web301-group",
        hasDiscussionGroup: true
      },
      {
        id: "se3-2",
        code: "DB301",
        name: "Database Systems",
        lecturer: "Dr. Michael Kiprotich",
        credits: 3,
        semester: "Semester 1",
        year: 3,
        course: "Software Engineering",
        prerequisites: ["DSA201"],
        description: "Database design, SQL, and database management systems",
        schedule: "Tue, Thu 11:00-1:00 PM",
        hasDiscussionGroup: true
      }
    ]
  },
  "Computer Science": {
    1: [
      {
        id: "cs1-1",
        code: "CS101",
        name: "Introduction to Computer Science",
        lecturer: "Dr. Alice Njeri",
        credits: 4,
        semester: "Semester 1",
        year: 1,
        course: "Computer Science",
        prerequisites: [],
        description: "Overview of computer science fundamentals",
        schedule: "Mon, Wed, Fri 8:00-10:00 AM",
        hasDiscussionGroup: true
      },
      {
        id: "cs1-2",
        code: "CALC101",
        name: "Calculus I",
        lecturer: "Prof. Robert Kipchoge",
        credits: 4,
        semester: "Semester 1",
        year: 1,
        course: "Computer Science",
        prerequisites: [],
        description: "Differential and integral calculus",
        schedule: "Tue, Thu 9:00-11:00 AM",
        hasDiscussionGroup: false
      }
    ]
  }
};
