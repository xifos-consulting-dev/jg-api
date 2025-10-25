import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
type JwtPayload = {
  iat?: number;
  exp?: number;
  [key: string]: unknown;
};

declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}

const JWT_SECRET = ENV.JWT_SECRET;
const DEFAULT_EXPIRES = '1h';
const ALGORITHMS: jwt.Algorithm[] = ['HS256'];

/**
 * Create (sign) a JWS token.
 * @param payload - object to include in token (avoid secrets/passwords)
 * @param expiresIn - e.g. '1h', '15m', seconds as number
 */
export function signJwt(payload: object, expires?: string): string {
  console.log('JWT_SECRET:', JWT_SECRET);
  if (!JWT_SECRET) {
    return '';
  }
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: DEFAULT_EXPIRES });

  console.log('Generated JWT:', token);
  return token;
}

/**
 * Verify and decode a JWS token. Throws if invalid/expired.
 * @param token - raw token (no "Bearer " prefix)
 */
export function verifyJwt(token: string): JwtPayload {
  if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET environment variable');
  }
  return jwt.verify(token, JWT_SECRET, { algorithms: ALGORITHMS }) as JwtPayload;
}

/**
 * Express middleware to authenticate incoming requests using Authorization: Bearer <token>
 * Attaches decoded payload to req.user on success.
 */
export default function JwtAuth(receivedToken: string): { error?: string; status?: number; payload?: JwtPayload } {
  const auth = receivedToken.split(' ');
  if (auth.length !== 2 || auth[0] !== 'Bearer') {
    return { error: 'Malformed authorization header', status: 401 };
  }

  const token = auth[1];
  try {
    if (!token) {
      return { error: 'Missing token', status: 401 };
    }
    const payload = verifyJwt(token);
    return { payload, status: 200 };
  } catch (err) {
    return { error: 'Invalid or expired token', status: 401 };
  }
}
