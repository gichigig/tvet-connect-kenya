export type Tables = {
  anonymous_feedback: {
    id: string
    feedback_text: string
    feedback_type: string
    academic_period: string | null
    rating: number | null
    sentiment: string | null
    subject_id: string | null
    created_at: string | null
  }
  
  assignment_submissions: {
    id: string
    assignment_id: string
    student_id: string
    student_name: string
    submission_text: string
    file_url: string | null
    submitted_at: string
    grade: number | null
    feedback: string | null
    ai_detection_status: string
    ai_confidence_score: number | null
    ai_detection_details: Record<string, any> | null
    final_status: string
    human_review_status: string | null
    human_review_notes: string | null
    human_reviewed_at: string | null
    human_reviewer_id: string | null
    created_at: string
    updated_at: string
  }

  attendance_sessions: {
    id: string
    unit_code: string
    unit_name: string
    lecturer_id: string
    lecturer_name: string
    session_type: string
    session_date: string
    start_time: string
    end_time: string
    location_required: boolean
    attendance_code: string | null
    latitude: number | null
    longitude: number | null
    allowed_radius: number | null
    is_active: boolean
    description: string | null
    created_at: string
    updated_at: string
  }

  calendar_events: {
    id: string
    title: string
    description: string | null
    start_time: string
    end_time: string
    event_type: string
    location: string | null
    is_recurring: boolean | null
    recurrence_pattern: string | null
    parent_event_id: string | null
    related_resource_id: string | null
    related_resource_type: string | null
    related_unit_code: string | null
    user_id: string | null
    created_at: string | null
    updated_at: string | null
  }

  certificates: {
    id: string
    title: string
    description: string | null
    certificate_type: string
    issue_date: string
    student_id: string | null
    metadata: Record<string, any> | null
    pdf_url: string | null
    qr_code: string | null
    verification_hash: string | null
    created_at: string | null
  }

  chatbot_conversations: {
    id: string
    user_id: string | null
    subject_area: string | null
    created_at: string | null
    updated_at: string | null
  }

  chatbot_messages: {
    id: string
    conversation_id: string | null
    message: string
    sender: string
    resources: Record<string, any> | null
    created_at: string | null
  }

  companies: {
    id: string
    name: string
    description: string | null
    industry: string | null
    website_url: string | null
    verified: boolean | null
    created_at: string | null
  }

  exam_attempts: {
    id: string
    exam_id: string | null
    student_id: string | null
    start_time: string | null
    end_time: string | null
    submitted_answers: Record<string, any> | null
    total_score: number | null
    status: string | null
    proctoring_flags: Record<string, any> | null
    created_at: string | null
  }

  exam_questions: {
    id: string
    exam_id: string | null
    question_id: string | null
    question_number: number
    marks: number
  }

  exam_results: {
    id: string
    student_id: string
    student_name: string
    unit_code: string
    unit_name: string
    exam_type: string
    exam_date: string
    score: number
    max_score: number
    grade: string
    status: string
    lecturer_name: string
    semester: number
    year: number
  }

  experiment_attempts: {
    id: string
    experiment_id: string | null
    student_id: string | null
    status: string | null
    score: number | null
    submission_data: Record<string, any> | null
    completed_at: string | null
  }

  experiments: {
    id: string
    title: string
    description: string | null
    lab_id: string | null
    simulation_url: string | null
    max_score: number | null
    time_limit_minutes: number | null
    created_at: string | null
  }

  job_applications: {
    id: string
    job_listing_id: string | null
    student_id: string | null
    cover_letter: string | null
    resume_url: string | null
    application_status: string | null
    created_at: string | null
  }

  job_listings: {
    id: string
    title: string
    description: string
    company_id: string | null
    job_type: JobType
    location: string | null
    salary_range: unknown | null
    minimum_gpa: number | null
    required_skills: string[] | null
    application_deadline: string | null
    status: JobStatus | null
    created_at: string | null
    updated_at: string | null
  }

  online_exams: {
    id: string
    title: string
    description: string | null
    unit_code: string
    exam_type: ExamType
    start_time: string
    end_time: string
    duration_minutes: number
    total_marks: number
    passing_marks: number
    created_by: string | null
    is_published: boolean | null
    proctoring_enabled: boolean | null
    webcam_required: boolean | null
    allow_tab_switch: boolean | null
    created_at: string | null
  }

  pending_unit_registrations: {
    id: string
    student_id: string
    student_name: string
    student_email: string
    unit_id: string
    unit_code: string
    unit_name: string
    course: string
    semester: number
    year: number
    status: string
    submitted_date: string
  }

  proctoring_events: {
    id: string
    attempt_id: string | null
    event_type: string
    severity: string
    event_data: Record<string, any> | null
    timestamp: string | null
  }

  question_bank: {
    id: string
    unit_code: string
    topic: string
    question_text: string
    answer_options: Record<string, any> | null
    correct_answer: string
    explanation: string | null
    difficulty: number | null
    created_by: string | null
    created_at: string | null
  }

  quiz_attendance: {
    id: string
    title: string
    unit_code: string
    unit_name: string
    lecturer_id: string
    questions: Record<string, any>
    time_limit: number
    is_active: boolean
    start_time: string | null
    end_time: string | null
    created_at: string
    updated_at: string
  }

  reminders: {
    id: string
    user_id: string | null
    event_id: string | null
    reminder_time: string
    notification_type: string[] | null
    is_sent: boolean | null
    created_at: string | null
  }

  student_attendance: {
    id: string
    student_id: string
    student_name: string
    unit_code: string
    unit_name: string
    attendance_type: string
    status: string
    attendance_date: string
    attendance_time: string
    session_id: string | null
    quiz_id: string | null
    quiz_answers: Record<string, any> | null
    quiz_score: number | null
    location_lat: number | null
    location_lng: number | null
    created_at: string
  }

  student_job_preferences: {
    student_id: string
    preferred_job_types: JobType[] | null
    preferred_industries: string[] | null
    desired_locations: string[] | null
    minimum_salary: number | null
  }

  transcript_grades: {
    id: string
    transcript_id: string | null
    unit_code: string
    unit_name: string
    grade: string
    credits: number
    points: number | null
    lecturer_name: string | null
  }

  transcripts: {
    id: string
    student_id: string | null
    academic_year: string
    semester: number
    gpa: number | null
    total_credits: number | null
    status: string | null
    pdf_url: string | null
    qr_code: string | null
    verification_hash: string | null
    generated_at: string | null
    created_at: string | null
  }

  users: {
    id: string
    email: string
    first_name: string
    last_name: string
    role: string
    admission_number: string | null
    course: string | null
    department: string | null
    level: string | null
    year: number | null
    semester: number | null
    intake: string | null
    phone: string | null
    approved: boolean
    blocked: boolean
    financial_status: string | null
    total_fees_owed: number | null
  }

  virtual_labs: {
    id: string
    title: string
    description: string | null
    domain: DomainType
    difficulty: ExperimentDifficulty | null
    learning_objectives: string[] | null
    is_active: boolean | null
    created_at: string | null
  }
}

export type ExamType = 'quiz' | 'midterm' | 'final' | 'practice'
export type DomainType = 'science' | 'engineering' | 'medical'
export type ExperimentDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type JobStatus = 'open' | 'closed' | 'in_review'
export type JobType = 'internship' | 'full_time' | 'part_time' | 'contract'

// Re-export the generated types from Supabase
export * from './types/generated'
