export function getUserToken(): string | null {
  try { return localStorage.getItem('novari_user_token'); } catch { return null; }
}
export function setUserToken(token: string): void {
  try { localStorage.setItem('novari_user_token', token); } catch {}
}
export function removeUserToken(): void {
  try { localStorage.removeItem('novari_user_token'); } catch {}
}
export function isLoggedIn(): boolean {
  return !!getUserToken();
}
export function getStoredUser(): any {
  try { const u = localStorage.getItem('novari_user'); return u ? JSON.parse(u) : null; } catch { return null; }
}
export function setStoredUser(user: any): void {
  try { localStorage.setItem('novari_user', JSON.stringify(user)); } catch {}
}
export function logout(): void {
  removeUserToken();
  try { localStorage.removeItem('novari_user'); } catch {}
}
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getUserToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
