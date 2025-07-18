// src/data/zetechCourses.ts
// Zetech University courses, diplomas, certificates, and departments structured by school and level

export const schools = [
  {
    name: "School of Business & Economics",
    undergraduate: [
      "Bachelor of Business Administration and Management (BBAM)",
      "Bachelor of Commerce (BCom)",
      "Bachelor of Accounting and Finance (BAF)",
      "Bachelor of Purchasing & Supply Chain Management (BPSCM)",
      "Bachelor of Economics and Statistics (BES)",
      "Bachelor of Science in Hospitality & Tourism Management (BSc HTM)",
      "Bachelor of Science in Health Systems Management (BSc HSM)"
    ],
    diploma: [
      "Diploma in Banking & Finance",
      "Diploma in Accounting & Finance",
      "Diploma in Business Management & Admin",
      "Diploma in Human Resources",
      "Diploma in Marketing",
      "Diploma in Office Management",
      "Diploma in Procurement & Supply Management",
      "Diploma in Entrepreneurship"
    ],
    certificate: [
      "Certificate in Business Management",
      "Certificate in Purchasing, Supplies & Management"
    ]
  },
  {
    name: "School of ICT, Media & Engineering",
    undergraduate: [
      "Bachelor of Business Information Technology (BBIT)",
      "Bachelor of Science in Information Technology (BSc IT)",
      "Bachelor of Science in Computer Science (BCS)",
      "Bachelor of Science in Software Engineering (BSE)",
      "Bachelor of Science in Computer Science & Mathematics",
      "Bachelor of Science in Computer Science & Applied Physics",
      "Bachelor of Science in Media & Digital Communication (BMDC)",
      "Bachelor of Journalism (BAJ)"
    ],
    diploma: [
      "Diploma in Information Technology",
      "Diploma in Software Engineering",
      "Diploma in Computer Science",
      "Diploma in Computer Engineering",
      "Diploma in Business IT",
      "Diploma in Telecommunications",
      "Diploma in Instrumentation & Control",
      "Diploma in Electronics",
      "Diploma in Electrical Engineering",
      "Diploma in Communication & Computer Networks"
    ],
    certificate: [
      "Certificate in Electric & Electronic Engineering",
      "Certificate in Information Computer Technology"
    ]
  },
  {
    name: "School of Education, Arts & Social Sciences",
    undergraduate: [
      "Bachelor of Arts in International Relations & Diplomacy (BIRD)",
      "Bachelor of Arts in Education (Arts & Science)",
      "Bachelor of Arts in Psychology with Technology (BPSY)",
      "Bachelor of Arts in Sociology & Technology (BST)",
      "Bachelor of Arts in Political Science with Technology (BPT)"
    ],
    diploma: [
      "Diploma in Criminology & Security Studies",
      "Diploma in International Relations & Diplomacy",
      "Diploma in Early Childhood Development & Education",
      "Diploma in Community Health",
      "Diploma in Counseling Psychology",
      "Diploma in Project Management",
      "Diploma in Community Development",
      "Diploma in Records & Archives",
      "Diploma in Library Science",
      "Diploma in Leadership & Governance",
      "Diploma in Social Work"
    ],
    certificate: [
      "Certificate in Early Childhood Development and Education"
    ]
  },
  {
    name: "School of Media Arts & Communication",
    diploma: [
      "Diploma in Communication & Media Studies (Broadcast, Print, PR, Advertising)"
    ],
    certificate: [
      "Certificate in Journalism and Media Studies"
    ]
  },
  {
    name: "School of Hospitality",
    undergraduate: [
      "Bachelor of Science in Hospitality & Tourism Management (BSc HTM)"
    ],
    diploma: [
      "Diploma in Hospitality Management",
      "Diploma in Tourism Management",
      "Diploma in Travel & Tour Guiding",
      "Diploma in Nutrition, Food Science & Health"
    ],
    certificate: [
      "Certificate in Food Science & Nutrition",
      "Certificate in Hospitality & Tourism Management"
    ]
  },
  {
    name: "School of Development & Social Sciences",
    diploma: [
      "Diploma in Criminology & Security Studies",
      "Diploma in International Relations & Diplomacy",
      "Diploma in Early Childhood Development & Education",
      "Diploma in Community Health",
      "Diploma in Counseling Psychology",
      "Diploma in Project Management",
      "Diploma in Community Development",
      "Diploma in Records & Archives",
      "Diploma in Library Science",
      "Diploma in Leadership & Governance",
      "Diploma in Social Work"
    ],
    certificate: [
      "Certificate in Early Childhood Development and Education"
    ]
  },
  {
    name: "New/Additional Schools",
    undergraduate: [
      "Bachelor of Science in Data Science & Analytics (BSDA)",
      "Bachelor of Science in Nursing (BSc Nursing)",
      "Bachelor of Laws (LL.B)"
    ]
  }
];

// Flat lists for convenience
export const allUndergraduateCourses = schools.flatMap(s => s.undergraduate || []);
export const allDiplomaCourses = schools.flatMap(s => s.diploma || []);
export const allCertificateCourses = schools.flatMap(s => s.certificate || []);
export const allCourses = [
  ...allUndergraduateCourses,
  ...allDiplomaCourses,
  ...allCertificateCourses
];

// For department dropdowns (for staff): use school names
export const allDepartments = schools.map(s => s.name);
