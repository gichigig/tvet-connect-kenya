
import { CourseCard } from "@/components/CourseCard";
import { Course } from "@/data/coursesData";

interface CourseViewProps {
  coursesByCategory: Record<string, Course[]>;
  userProgress: Record<string, number>;
  onEnrollCourse: (courseId: string) => void;
}

export const CourseView = ({ coursesByCategory, userProgress, onEnrollCourse }: CourseViewProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        TVET Courses in Kenya
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Choose from our comprehensive Technical and Vocational Education and Training courses.
      </p>
      
      {Object.keys(coursesByCategory).length > 0 ? (
        Object.entries(coursesByCategory).map(([category, courses]) => (
          <div key={category} className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  instructor={course.instructor}
                  duration={course.duration}
                  students={course.students}
                  rating={course.rating}
                  progress={userProgress[course.id]}
                  image={course.image}
                  onEnroll={onEnrollCourse}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No courses found matching your search.
          </p>
        </div>
      )}
    </div>
  );
};
