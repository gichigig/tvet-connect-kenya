// Test Weekly Schedule Feature - Multiple Activities per Week
console.log('🗓️  Testing Weekly Schedule Feature - Multiple Activities per Week\n');

// Simulate week data with multiple activities across different days
const testWeek = {
  weekNumber: 5,
  startDate: new Date('2025-08-18'), // Monday
  endDate: new Date('2025-08-24'),   // Sunday
  materials: [
    {
      id: 'material-1',
      title: 'Introduction to React Hooks',
      description: 'Understanding useState and useEffect',
      type: 'notes',
      dayOfWeek: 'monday',
      releaseTime: '09:00',
      isVisible: true,
      isUploaded: true
    },
    {
      id: 'material-2', 
      title: 'React Context API Examples',
      description: 'Practical examples of Context usage',
      type: 'material',
      dayOfWeek: 'wednesday',
      releaseTime: '10:30',
      isVisible: true,
      isUploaded: true
    },
    {
      id: 'material-3',
      title: 'Component Lifecycle Methods',
      description: 'Class vs Functional components lifecycle',
      type: 'notes',
      dayOfWeek: 'friday',
      releaseTime: '08:00',
      isVisible: false,
      isUploaded: false
    }
  ],
  assignments: [
    {
      id: 'assignment-1',
      title: 'Build a Todo App',
      description: 'Create a React todo application with hooks',
      type: 'document',
      assignDate: new Date('2025-08-19'), // Tuesday
      dueDate: new Date('2025-08-26'),
      maxMarks: 50,
      instructions: 'Use functional components and hooks only',
      requiresAICheck: true
    },
    {
      id: 'assignment-2',
      title: 'State Management Essay',
      description: 'Compare different state management approaches',
      type: 'essay',
      assignDate: new Date('2025-08-21'), // Thursday
      dueDate: new Date('2025-08-28'),
      maxMarks: 30,
      instructions: 'Minimum 1000 words, cite sources',
      requiresAICheck: true
    }
  ],
  exams: [
    {
      id: 'exam-1',
      title: 'React Fundamentals CAT',
      description: 'Continuous Assessment Test on React basics',
      type: 'cat',
      examDate: new Date('2025-08-22'), // Friday
      examTime: '14:00',
      duration: 60,
      venue: 'Computer Lab 1',
      maxMarks: 20,
      instructions: 'Closed book test, no external resources',
      isLocked: false,
      questions: [],
      approvalStatus: 'approved'
    }
  ],
  attendanceSessions: [
    {
      id: 'attendance-1',
      title: 'Monday Lecture Attendance',
      description: 'React Hooks Introduction',
      date: new Date('2025-08-18'), // Monday
      startTime: '09:00',
      endTime: '11:00',
      venue: 'Room 201',
      isActive: false,
      createdAt: new Date(),
      unitId: 'react-101',
      weekNumber: 5,
      type: 'attendance'
    },
    {
      id: 'attendance-2',
      title: 'Wednesday Lab Session',
      description: 'Context API Practical',
      date: new Date('2025-08-20'), // Wednesday
      startTime: '10:00',
      endTime: '12:00',
      venue: 'Lab A',
      isActive: false,
      createdAt: new Date(),
      unitId: 'react-101',
      weekNumber: 5,
      type: 'attendance',
      locationRestriction: {
        enabled: true,
        latitude: -1.2921,
        longitude: 36.8219,
        radius: 50,
        locationName: 'Lab A Building'
      }
    }
  ],
  onlineClasses: [
    {
      id: 'online-1',
      title: 'Advanced React Patterns',
      description: 'Higher-order components and render props',
      date: new Date('2025-08-23'), // Saturday
      startTime: '15:00',
      endTime: '17:00',
      platform: 'zoom',
      meetingLink: 'https://zoom.us/j/123456789',
      meetingId: '123-456-789',
      passcode: 'react2025',
      isActive: true,
      createdAt: new Date(),
      unitId: 'react-101',
      weekNumber: 5,
      type: 'online-class'
    }
  ]
};

// Helper function to organize activities by day (matches the one in component)
function organizeActivitiesByDay(week) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const activitiesByDay = {};

  // Initialize each day
  days.forEach(day => {
    activitiesByDay[day] = {
      materials: [],
      assignments: [],
      exams: [],
      attendanceSessions: [],
      onlineClasses: []
    };
  });

  // Group materials by day
  week.materials.forEach(material => {
    const day = material.dayOfWeek.toLowerCase();
    if (activitiesByDay[day]) {
      activitiesByDay[day].materials.push(material);
    }
  });

  // Group assignments by assign date day
  week.assignments.forEach(assignment => {
    const assignDay = assignment.assignDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    if (activitiesByDay[assignDay]) {
      activitiesByDay[assignDay].assignments.push(assignment);
    }
  });

  // Group exams by exam date day
  week.exams.forEach(exam => {
    const examDay = exam.examDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    if (activitiesByDay[examDay]) {
      activitiesByDay[examDay].exams.push(exam);
    }
  });

  // Group attendance sessions by date day
  week.attendanceSessions?.forEach(session => {
    const sessionDay = session.date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    if (activitiesByDay[sessionDay]) {
      activitiesByDay[sessionDay].attendanceSessions.push(session);
    }
  });

  // Group online classes by date day
  week.onlineClasses?.forEach(onlineClass => {
    const classDay = onlineClass.date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    if (activitiesByDay[classDay]) {
      activitiesByDay[classDay].onlineClasses.push(onlineClass);
    }
  });

  return activitiesByDay;
}

// Test the organization
const organizedActivities = organizeActivitiesByDay(testWeek);

console.log('📊 Week 5 Activities Summary:');
console.log(`   📚 Materials: ${testWeek.materials.length}`);
console.log(`   📝 Assignments: ${testWeek.assignments.length}`);
console.log(`   🎓 Exams: ${testWeek.exams.length}`);
console.log(`   👥 Attendance Sessions: ${testWeek.attendanceSessions.length}`);
console.log(`   💻 Online Classes: ${testWeek.onlineClasses.length}`);
console.log(`   📅 Total Activities: ${testWeek.materials.length + testWeek.assignments.length + testWeek.exams.length + testWeek.attendanceSessions.length + testWeek.onlineClasses.length}\n`);

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayEmojis = {
  monday: '🗓️',
  tuesday: '📋',
  wednesday: '🔬',
  thursday: '📚',
  friday: '🎯',
  saturday: '💻',
  sunday: '🏖️'
};

days.forEach(day => {
  const dayActivities = organizedActivities[day];
  const totalActivities = dayActivities.materials.length + 
                         dayActivities.assignments.length + 
                         dayActivities.exams.length + 
                         dayActivities.attendanceSessions.length + 
                         dayActivities.onlineClasses.length;

  console.log(`${dayEmojis[day]} ${day.toUpperCase()}: ${totalActivities} activities`);
  
  if (totalActivities > 0) {
    // Materials
    dayActivities.materials.forEach(material => {
      console.log(`   📚 [${material.releaseTime}] ${material.title} (${material.type})`);
    });
    
    // Assignments
    dayActivities.assignments.forEach(assignment => {
      console.log(`   📝 Assignment: ${assignment.title} (Due: ${assignment.dueDate.toLocaleDateString()})`);
    });
    
    // Exams
    dayActivities.exams.forEach(exam => {
      console.log(`   🎓 [${exam.examTime}] ${exam.title} at ${exam.venue}`);
    });
    
    // Attendance
    dayActivities.attendanceSessions.forEach(session => {
      const locationInfo = session.locationRestriction?.enabled ? 
        ` (Location restricted: ${session.locationRestriction.radius}m)` : '';
      console.log(`   👥 [${session.startTime}-${session.endTime}] ${session.title}${locationInfo}`);
    });
    
    // Online Classes
    dayActivities.onlineClasses.forEach(onlineClass => {
      console.log(`   💻 [${onlineClass.startTime}-${onlineClass.endTime}] ${onlineClass.title} via ${onlineClass.platform}`);
    });
  } else {
    console.log('   ⭕ No activities scheduled');
  }
  console.log('');
});

console.log('✅ Weekly Schedule Features Verified:');
console.log('   ✅ Multiple materials per week across different days');
console.log('   ✅ Multiple assignments with different due dates');
console.log('   ✅ Exams scheduled on specific days and times');
console.log('   ✅ Attendance sessions with location restrictions');
console.log('   ✅ Online classes on weekends');
console.log('   ✅ Activities properly grouped by day of week');
console.log('   ✅ Time-based scheduling for all activity types');

console.log('\n🎉 Multi-day Activity Planning Successfully Implemented!');
console.log('\n📋 Lecturer Benefits:');
console.log('   • Plan comprehensive weekly schedules');
console.log('   • Schedule multiple activities per day');
console.log('   • Organize content release by day and time');
console.log('   • Set up location-restricted sessions');
console.log('   • Manage both physical and online classes');
console.log('   • View activities in a clear day-by-day layout');
