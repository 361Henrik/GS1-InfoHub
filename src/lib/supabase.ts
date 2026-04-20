// DEMO MODE — all Supabase calls are intercepted by the in-memory mock store.
// Switch back to the real client by restoring this file from the main branch.
import { mockSupabase } from './demo-store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = mockSupabase as any;
