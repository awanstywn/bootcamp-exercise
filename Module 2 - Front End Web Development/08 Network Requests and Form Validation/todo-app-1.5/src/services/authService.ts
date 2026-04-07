import backendlessAPI from '../lib/axios';
import type { BackendlessUser, SignInFormValues, SignUpFormValues } from '../types/types';

/**
 * Objective: Provides dedicated methods for interacting with Backendless User API.
 */
const authService = {
  // 1. Register a new user
  register: async (credentials: SignUpFormValues): Promise<void> => {
    // We only send the fields Backendless actually has columns for.
    // 'confirmPassword' is a front-end only field for Formik/Yup.
    const payload = {
      name: credentials.name,
      email: credentials.email,
      password: credentials.password
    };
    await backendlessAPI.post('/users/register', payload);
  },

  // 2. Login existing user
  login: async (credentials: SignInFormValues): Promise<BackendlessUser> => {
    // Backendless specifically expects the property key to be 'login', not 'email'.
    const payload = {
      login: credentials.email,
      password: credentials.password
    };
    const response = await backendlessAPI.post<BackendlessUser>('/users/login', payload);
    return response.data;
  },

  // 3. Logout user
  logout: async (): Promise<void> => {
    await backendlessAPI.get('/users/logout');
  }
};

export default authService;
