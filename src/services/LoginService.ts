import { HttpException } from '../utils/HttpError';
import { signJwt } from '../middlewares/JwtAuth';

type UserCredential = {
  id: string;
  user: string;
  password: string;
  name: string;
  role: string;
  active: boolean;
};

const credentialDump: ReadonlyArray<UserCredential> = [
  {
    id: 'U001',
    user: 'admin',
    password: 'admin123',
    name: 'System Administrator',
    role: 'admin',
    active: true,
  },
  {
    id: 'U002',
    user: 'manager',
    password: 'manager123',
    name: 'Operations Manager',
    role: 'manager',
    active: true,
  },
  {
    id: 'U003',
    user: 'analyst',
    password: 'analyst123',
    name: 'Data Analyst',
    role: 'analyst',
    active: true,
  },
  {
    id: 'U004',
    user: 'suspended',
    password: 'suspended123',
    name: 'Suspended User',
    role: 'viewer',
    active: false,
  },
];

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

class LoginService {
  private readonly credentials: Map<string, UserCredential>;

  constructor(users: ReadonlyArray<UserCredential>) {
    this.credentials = new Map(users.map((user) => [user.user.toLowerCase(), user]));
  }

  public async LoginVerification(user: string, password: string): Promise<string> {
    if (!user || !password) {
      throw new HttpException(400, 'User and password are required');
    }

    const record = this.credentials.get(user.toLowerCase());

    if (!record || record.password !== password) {
      throw new HttpException(401, 'Invalid user or password');
    }

    if (!record.active) {
      throw new HttpException(403, 'User is inactive');
    }

    return this.createToken(record);
  }

  private createToken(record: UserCredential): string {
    console.log('Creating token for user:', record);
    const token = signJwt(
      {
        id: record.id,
        user: record.user,
        name: record.name,
        role: record.role,
      },
      '10m'
    );
    return token;
  }

  public verifyToken(token: string): UserCredential {
    if (!token) {
      throw new HttpException(401, 'Authorization token required');
    }

    let payload: string;
    try {
      payload = Buffer.from(token, 'base64').toString('utf-8');
    } catch {
      throw new HttpException(401, 'Invalid token');
    }

    const [id, user, issuedAt] = payload.split(':');

    if (!id || !user || !issuedAt) {
      throw new HttpException(401, 'Invalid token payload');
    }

    const issuedAtMs = Number.parseInt(issuedAt, 10);
    if (Number.isNaN(issuedAtMs)) {
      throw new HttpException(401, 'Invalid token payload');
    }

    if (Date.now() - issuedAtMs > TOKEN_TTL_MS) {
      throw new HttpException(401, 'Token expired');
    }

    const record = this.credentials.get(user.toLowerCase());

    if (!record || record.id !== id) {
      throw new HttpException(401, 'Invalid token');
    }

    if (!record.active) {
      throw new HttpException(403, 'User is inactive');
    }

    return record;
  }
}

export const loginService = new LoginService(credentialDump);
export const LoginVerification = (user: string, password: string) => loginService.LoginVerification(user, password);
export const verifyToken = (token: string) => loginService.verifyToken(token);
