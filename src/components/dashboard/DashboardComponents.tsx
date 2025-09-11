import React from 'react';

export interface LecturerStatsProps {
  stats: {
    totalCourses: number;
    totalStudents: number;
    pendingAssignments: number;
    upcomingExams: number;
  };
}

export const LecturerStats: React.FC<LecturerStatsProps> = ({ stats }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-2">Lecturer Statistics</h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-gray-600">Total Courses</p>
        <p className="text-xl font-bold">{stats.totalCourses}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Total Students</p>
        <p className="text-xl font-bold">{stats.totalStudents}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Pending Assignments</p>
        <p className="text-xl font-bold">{stats.pendingAssignments}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Upcoming Exams</p>
        <p className="text-xl font-bold">{stats.upcomingExams}</p>
      </div>
    </div>
  </div>
);

export interface StudentStatsProps {
  stats: {
    enrolledUnits: number;
    pendingRegistrations: number;
    upcomingExams: number;
    completedAssignments: number;
    availableNotes: number;
    feesOwed: any;
  };
}

export const StudentStats: React.FC<StudentStatsProps> = ({ stats }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-2">Student Statistics</h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-gray-600">Enrolled Units</p>
        <p className="text-xl font-bold">{stats.enrolledUnits}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Pending Registrations</p>
        <p className="text-xl font-bold">{stats.pendingRegistrations}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Upcoming Exams</p>
        <p className="text-xl font-bold">{stats.upcomingExams}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Completed Assignments</p>
        <p className="text-xl font-bold">{stats.completedAssignments}</p>
      </div>
    </div>
  </div>
);

export interface UnitDetailProps {
  unit: any;
  onBack: () => void;
}

export const UnitDetail: React.FC<UnitDetailProps> = ({ unit, onBack }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <button onClick={onBack} className="mb-4 text-blue-600 hover:text-blue-800">
      ← Back
    </button>
    <h1 className="text-2xl font-bold mb-4">{unit?.name}</h1>
    <p className="text-gray-600">{unit?.description}</p>
    <div className="mt-4 grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-gray-600">Code</p>
        <p className="font-semibold">{unit?.code}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Credits</p>
        <p className="font-semibold">{unit?.credits}</p>
      </div>
    </div>
  </div>
);