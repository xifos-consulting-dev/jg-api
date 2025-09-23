import { HttpException } from '../utils/HttpError';
import { signJwt, verifyJwt } from '../middlewares/JwtAuth';
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
    console.log('Creating token for user:', record.user);
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

    let payload: ReturnType<typeof verifyJwt>;
    try {
      payload = verifyJwt(token);
    } catch {
      throw new HttpException(401, 'Invalid or expired token');
    }

    const { id, user } = payload;

    if (!id || typeof user !== 'string') {
      console.log('Invalid token payload:', payload);
      throw new HttpException(401, 'Invalid token payload');
    }

    const record = this.credentials.get(user.toLowerCase());

    if (!record || record.id !== id) {
      throw new HttpException(401, 'Invalid token');
    }

    if (!record.active) {
      throw new HttpException(403, 'User is inactive');
    }
    console.log('Token verified for user:', record.user);
    return record;
  }
}

export const loginService = new LoginService(credentialDump);
export const LoginVerification = (user: string, password: string) => loginService.LoginVerification(user, password);
export const verifyToken = (token: string) => loginService.verifyToken(token);
