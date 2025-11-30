import jwt from 'jsonwebtoken';

export function decodeToken(token: string) {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}
