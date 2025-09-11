// Update all other courses in the coursesData array with name and department properties
// I'll update the remaining courses quickly by extending the array

import { Course, Lesson } from './coursesData';

const updateCourseWithCompatibility = (course: any): Course => ({
  ...course,
  name: course.title,
  department: course.category
});

export const coursesDataUpdated = [
  {
    id: "1",
    title: "Automotive Technology",
    name: "Automotive Technology",
    description: "Comprehensive training in vehicle maintenance, repair, and diagnostics. Learn engine systems, electrical systems, and modern automotive technology.",
    instructor: "John Mwangi",
    duration: "6 months",
    students: 450,
    rating: 4.7,
    image: "photo-1486312338219-ce68d2c6f44d",
    category: "Engineering",
    department: "Engineering",
    level: "Diploma",
    lessons: [
      { id: "1-1", title: "Engine Fundamentals", duration: "45 min", completed: false },
      { id: "1-2", title: "Electrical Systems", duration: "50 min", completed: false },
      { id: "1-3", title: "Brake Systems", duration: "40 min", completed: false },
      { id: "1-4", title: "Transmission Systems", duration: "55 min", completed: false },
      { id: "1-5", title: "Diagnostic Tools", duration: "60 min", completed: false },
    ]
  }
] as Course[];