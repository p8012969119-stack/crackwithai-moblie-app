import { authApi } from '../api/authApi';
import { storage } from './storage';

export async function clearSession() {
  await Promise.all([storage.removeToken(), storage.removeUser()]);
}

export async function restoreValidatedSession() {
  const token = await storage.getToken();
  if (!token || token === 'demo_session_token') {
    await clearSession();
    return null;
  }

  try {
    const response = await authApi.getProfile();
    if (!response.success || !response.data?._id) {
      throw new Error('Unable to verify your session. Please try again.');
    }
    await storage.saveUser(response.data);
    return {token, user: response.data};
  } catch (error: any) {
    if (error.status === 401) {
      await clearSession();
      return null;
    }
    // A network outage must not erase a real session or open protected screens.
    throw error;
  }
}
