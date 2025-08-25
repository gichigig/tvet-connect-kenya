import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/config'
import { Tables } from '@/lib/supabase-schema'

export function useProfile() {
  const [profile, setProfile] = useState<Tables['users'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('No user found')

        const { data, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load profile'))
      } finally {
        setLoading(false)
      }
    }

    getProfile()

    // Subscribe to profile changes
    const { data: subscription } = supabase
      .channel('public:users')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'users',
        filter: `id=eq.${profile?.id}`
      }, payload => {
        setProfile(payload.new as Tables['users'])
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const updateProfile = async (updates: Partial<Tables['users']>) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', profile?.id)

      if (error) throw error
      setProfile(prev => prev ? { ...prev, ...updates } : null)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update profile')
    }
  }

  return { profile, loading, error, updateProfile }
}

export function useUnits() {
  const [units, setUnits] = useState<Tables['units'][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const getUnits = async () => {
      try {
        const { data, error: unitsError } = await supabase
          .from('units')
          .select('*')
        
        if (unitsError) throw unitsError
        setUnits(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load units'))
      } finally {
        setLoading(false)
      }
    }

    getUnits()

    // Subscribe to units changes
    const { data: subscription } = supabase
      .channel('public:units')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'units'
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setUnits(prev => [...prev, payload.new as Tables['units']])
        } else if (payload.eventType === 'UPDATE') {
          setUnits(prev => prev.map(unit => 
            unit.id === payload.new.id ? payload.new as Tables['units'] : unit
          ))
        } else if (payload.eventType === 'DELETE') {
          setUnits(prev => prev.filter(unit => unit.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const addUnit = async (unit: Omit<Tables['units'], 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('units')
        .insert(unit)
        .select()
        .single()

      if (error) throw error
      setUnits(prev => [...prev, data])
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add unit')
    }
  }

  const updateUnit = async (id: string, updates: Partial<Tables['units']>) => {
    try {
      const { data, error } = await supabase
        .from('units')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setUnits(prev => prev.map(unit => unit.id === id ? data : unit))
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update unit')
    }
  }

  const deleteUnit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id)

      if (error) throw error
      setUnits(prev => prev.filter(unit => unit.id !== id))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete unit')
    }
  }

  return { units, loading, error, addUnit, updateUnit, deleteUnit }
}

export function useStudentUnits(studentId: string) {
  const [units, setUnits] = useState<Tables['student_units'][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const getStudentUnits = async () => {
      try {
        const { data, error: unitsError } = await supabase
          .from('student_units')
          .select('*')
          .eq('student_id', studentId)

        if (unitsError) throw unitsError
        setUnits(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load student units'))
      } finally {
        setLoading(false)
      }
    }

    getStudentUnits()

    // Subscribe to student_units changes
    const { data: subscription } = supabase
      .channel('public:student_units')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'student_units',
        filter: `student_id=eq.${studentId}`
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setUnits(prev => [...prev, payload.new as Tables['student_units']])
        } else if (payload.eventType === 'UPDATE') {
          setUnits(prev => prev.map(unit => 
            unit.id === payload.new.id ? payload.new as Tables['student_units'] : unit
          ))
        } else if (payload.eventType === 'DELETE') {
          setUnits(prev => prev.filter(unit => unit.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [studentId])

  return { units, loading, error }
}
