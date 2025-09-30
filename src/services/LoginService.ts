import { HttpException } from '../utils/HttpError';
import { signJwt, verifyJwt } from '../middlewares/JwtAuth';
type UserCredential = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  active: boolean;
};

const credentialDump: ReadonlyArray<UserCredential> = [
  {
    id: 'U001',
    email: 'admin',
    password: 'admin123',
    name: 'System Administrator',
    role: 'admin',
    active: true,
  },
  {
    id: 'U002',
    email: 'manager',
    password: 'manager123',
    name: 'Operations Manager',
    role: 'manager',
    active: true,
  },
  {
    id: 'U003',
    email: 'analyst',
    password: 'analyst123',
    name: 'Data Analyst',
    role: 'analyst',
    active: true,
  },
  {
    id: 'U004',
    email: 'suspended',
    password: 'suspended123',
    name: 'Suspended Email',
    role: 'viewer',
    active: false,
  },
];

class LoginService {
  private readonly credentials: Map<string, UserCredential>;

  constructor(users: ReadonlyArray<UserCredential>) {
    this.credentials = new Map(users.map((email) => [email.email.toLowerCase(), email]));
  }

  public async LoginVerification(email: string, password: string): Promise<string> {
    if (!email || !password) {
      throw new HttpException(400, 'Email and password are required');
    }

    const record = this.credentials.get(email.toLowerCase());

    if (!record || record.password !== password) {
      throw new HttpException(401, 'Invalid email or password');
    }

    if (!record.active) {
      throw new HttpException(403, 'Email is inactive');
    }

    return this.createToken(record);
  }

  private createToken(record: UserCredential): string {
    console.log('Creating token for email:', record.email);
    const token = signJwt(
      {
        id: record.id,
        email: record.email,
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

    const { id, email } = payload;

    if (!id || typeof email !== 'string') {
      console.log('Invalid token payload:', payload);
      throw new HttpException(401, 'Invalid token payload');
    }

    const record = this.credentials.get(email.toLowerCase());

    if (!record || record.id !== id) {
      throw new HttpException(401, 'Invalid token');
    }

    if (!record.active) {
      throw new HttpException(403, 'Email is inactive');
    }
    console.log('Token verified for email:', record.email);
    return record;
  }
}

export const loginService = new LoginService(credentialDump);
export const LoginVerification = (email: string, password: string) => loginService.LoginVerification(email, password);
export const verifyToken = (token: string) => loginService.verifyToken(token);
