
import { createClient } from '@supabase/supabase-js';

// Basado en el project ID extraído de tu connection string: jdygrsniwdctvzqdaoob
const SUPABASE_URL = 'https://jdygrsniwdctvzqdaoob.supabase.co';
// La anon key debe ser obtenida del dashboard de Supabase y configurada en el entorno
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'TU_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * IMPORTANTE: Ejecuta el siguiente SQL en tu editor de Supabase para crear las tablas:
 * 
 * CREATE TABLE IF NOT EXISTS workout_history (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   objective TEXT,
 *   difficulty TEXT,
 *   duration INTEGER,
 *   routine JSONB,
 *   config JSONB
 * );
 * 
 * CREATE TABLE IF NOT EXISTS active_sessions (
 *   id TEXT PRIMARY KEY,
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   routine JSONB,
 *   exercise_idx INTEGER,
 *   set_count INTEGER,
 *   config JSONB
 * );
 */

export const db = {
  async saveHistory(historyItem) {
    const { data, error } = await supabase
      .from('workout_history')
      .insert([{
        objective: historyItem.config.objective,
        difficulty: historyItem.config.difficulty,
        duration: historyItem.config.duration,
        routine: historyItem.routine,
        config: historyItem.config
      }])
      .select();
    if (error) throw error;
    return data[0];
  },

  async getHistory() {
    const { data, error } = await supabase
      .from('workout_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw error;
    return data.map(item => ({
      id: item.id,
      date: new Date(item.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      config: item.config,
      routine: item.routine
    }));
  },

  async deleteHistory(id) {
    const { error } = await supabase
      .from('workout_history')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async saveActiveSession(sessionData) {
    const { error } = await supabase
      .from('active_sessions')
      .upsert({
        id: 'default_user_session', // Simplificado para una sola sesión por "dispositivo"
        routine: sessionData.routine,
        exercise_idx: sessionData.exerciseIdx,
        set_count: sessionData.set,
        config: sessionData.config,
        updated_at: new Date().toISOString()
      });
    if (error) console.error("Error saving active session to DB:", error);
  },

  async getActiveSession() {
    const { data, error } = await supabase
      .from('active_sessions')
      .select('*')
      .eq('id', 'default_user_session')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 es "no rows found"
    
    if (data) {
      return {
        routine: data.routine,
        exerciseIdx: data.exercise_idx,
        set: data.set_count,
        config: data.config,
        timestamp: new Date(data.updated_at).getTime()
      };
    }
    return null;
  },

  async clearActiveSession() {
    await supabase
      .from('active_sessions')
      .delete()
      .eq('id', 'default_user_session');
  }
};
