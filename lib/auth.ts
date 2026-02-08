import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  type?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

// Gerar access token (1 hora)
export function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'access' }, 
    JWT_SECRET, 
    { expiresIn: '1h' }
  );
}

// Gerar refresh token (30 dias)
export function signRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'refresh' }, 
    JWT_SECRET, 
    { expiresIn: '30d' }
  );
}

// Verificar qualquer token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Extrair token do header
export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}