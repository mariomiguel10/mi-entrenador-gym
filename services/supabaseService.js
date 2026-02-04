
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jdygrsniwdctvzqdaoob.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'TU_SUPABASE_ANON_KEY';

// Inicialización del cliente con control de errores silencioso para el arranque
let supabase;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.error("Error inicializando Supabase:", e);
}

export const db = {
  async saveHistory(historyItem) {
    if (!supabase) return null;
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
    if (!supabase) return [];
    try {
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
    } catch (e) {
      console.warn("Fallo al obtener historial de Supabase, devolviendo vacío.");
      return [];
    }
  },

  async deleteHistory(id) {
    if (!supabase) return;
    const { error } = await supabase
      .from('workout_history')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async saveActiveSession(sessionData) {
    if (!supabase) return;
    const { error } = await supabase
      .from('active_sessions')
      .upsert({
        id: 'default_user_session',
        routine: sessionData.routine,
        exercise_idx: sessionData.exerciseIdx,
        set_count: sessionData.set,
        config: sessionData.config,
        updated_at: new Date().toISOString()
      });
    if (error) console.error("Error saving active session to DB:", error);
  },

  async getActiveSession() {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('id', 'default_user_session')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        return {
          routine: data.routine,
          exerciseIdx: data.exercise_idx,
          set: data.set_count,
          config: data.config,
          timestamp: new Date(data.updated_at).getTime()
        };
      }
    } catch (e) {
      return null;
    }
    return null;
  },

  async clearActiveSession() {
    if (!supabase) return;
    await supabase
      .from('active_sessions')
      .delete()
      .eq('id', 'default_user_session');
  }
};
