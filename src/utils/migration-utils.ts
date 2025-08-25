import { supabase } from '@/integrations/supabase/config'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { auth } from '@/integrations/firebase/config'
import { Tables } from '@/lib/supabase-schema'

export async function migrateUsers() {
  const firestore = getFirestore()
  const usersCollection = collection(firestore, 'users')
  const usersSnapshot = await getDocs(usersCollection)

  for (const doc of usersSnapshot.docs) {
    const userData = doc.data()
    
    // Create auth user in Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      email_confirm: true,
      user_metadata: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role
      }
    })

    if (authError) {
      console.error(`Failed to create auth user for ${userData.email}:`, authError)
      continue
    }

    // Create user profile in Supabase
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        admission_number: userData.admission_number,
        course: userData.course,
        department: userData.department,
        level: userData.level,
        approved: userData.approved,
        blocked: userData.blocked || false
      })

    if (profileError) {
      console.error(`Failed to create profile for ${userData.email}:`, profileError)
      // Rollback auth user creation
      await supabase.auth.admin.deleteUser(authData.user.id)
    }
  }
}

export async function migrateUnits() {
  const firestore = getFirestore()
  const unitsCollection = collection(firestore, 'units')
  const unitsSnapshot = await getDocs(unitsCollection)

  for (const doc of unitsSnapshot.docs) {
    const unitData = doc.data()
    
    const { error } = await supabase
      .from('units')
      .insert({
        id: doc.id,
        code: unitData.code,
        name: unitData.name,
        description: unitData.description,
        course: unitData.course,
        year: unitData.year,
        semester: unitData.semester,
        lecturer_id: unitData.lecturer_id,
        lecturer_name: unitData.lecturer_name,
        department: unitData.department,
        credits: unitData.credits,
        status: unitData.status || 'active'
      })

    if (error) {
      console.error(`Failed to migrate unit ${unitData.code}:`, error)
    }
  }
}

export async function migrateContent() {
  const firestore = getFirestore()
  const contentCollection = collection(firestore, 'content')
  const contentSnapshot = await getDocs(contentCollection)

  for (const doc of contentSnapshot.docs) {
    const contentData = doc.data()
    
    const { error } = await supabase
      .from('content')
      .insert({
        id: doc.id,
        type: contentData.type,
        title: contentData.title,
        description: contentData.description,
        unit_id: contentData.unit_id,
        unit_code: contentData.unit_code,
        unit_name: contentData.unit_name,
        lecturer_id: contentData.lecturer_id,
        files: contentData.files,
        is_visible: contentData.is_visible,
        topic: contentData.topic,
        due_date: contentData.due_date,
        assignment_type: contentData.assignment_type,
        accepted_formats: contentData.accepted_formats,
        questions: contentData.questions
      })

    if (error) {
      console.error(`Failed to migrate content ${contentData.title}:`, error)
    }
  }
}

export async function migrateSubmissions() {
  const firestore = getFirestore()
  const submissionsCollection = collection(firestore, 'assignment_submissions')
  const submissionsSnapshot = await getDocs(submissionsCollection)

  for (const doc of submissionsSnapshot.docs) {
    const submissionData = doc.data()
    
    const { error } = await supabase
      .from('assignment_submissions')
      .insert({
        id: doc.id,
        assignment_id: submissionData.assignment_id,
        student_id: submissionData.student_id,
        student_name: submissionData.student_name,
        submission_text: submissionData.submission_text,
        file_url: submissionData.file_url,
        submitted_at: submissionData.submitted_at,
        grade: submissionData.grade,
        feedback: submissionData.feedback,
        ai_detection_status: submissionData.ai_detection_status,
        final_status: submissionData.final_status || 'pending',
        created_at: submissionData.created_at,
        updated_at: submissionData.updated_at
      })

    if (error) {
      console.error(`Failed to migrate submission ${doc.id}:`, error)
    }
  }
}

export async function migrateStudentUnits() {
  const firestore = getFirestore()
  const studentUnitsCollection = collection(firestore, 'student_units')
  const studentUnitsSnapshot = await getDocs(studentUnitsCollection)

  for (const doc of studentUnitsSnapshot.docs) {
    const studentUnitData = doc.data()
    
    const { error } = await supabase
      .from('student_units')
      .insert({
        id: doc.id,
        student_id: studentUnitData.student_id,
        unit_id: studentUnitData.unit_id,
        unit_code: studentUnitData.unit_code,
        unit_name: studentUnitData.unit_name,
        status: studentUnitData.status,
        grade: studentUnitData.grade,
        semester: studentUnitData.semester,
        year: studentUnitData.year
      })

    if (error) {
      console.error(`Failed to migrate student unit ${doc.id}:`, error)
    }
  }
}
