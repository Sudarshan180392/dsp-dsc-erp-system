export const DEMO_COOKIE_NAME = 'dsp_demo_mode';

/**
 * Checks whether the current request is operating in isolated Demo/Preview mode.
 * In Demo mode, mock showcase data is served for sales demonstrations.
 * In Live mode, only actual Supabase database data is served.
 */
export function checkIsDemoMode(cookieStore: { get: (name: string) => { value: string } | undefined }): boolean {
  const demoCookie = cookieStore.get(DEMO_COOKIE_NAME);
  return demoCookie?.value === 'true';
}
