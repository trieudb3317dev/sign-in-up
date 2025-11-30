
import { UseContext } from '@/context/ContextProvider';
import { useContext } from 'react';

export const useAuth = () => {
  const auth = useContext(UseContext);
  if (!auth) {
    throw new Error('seAuth must be used within an AuthProvider')
  }
  return auth;
};