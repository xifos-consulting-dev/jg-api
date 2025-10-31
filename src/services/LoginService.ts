import { HttpException } from '../utils/HttpError';
import { signJwt, verifyJwt } from '../middlewares/JwtAuth';
//import { UserCredentialModel as User } from '../models/user';
import { db } from '../middlewares/db';

type UserCredential = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  active: boolean;
};

class LoginService {
  private readonly credentials: Map<string, UserCredential>;

  constructor() {
    this.credentials = new Map<string, UserCredential>();
  }

  public async findUserByEmail(email: string): Promise<UserCredential | null> {
    const collection = (await db()).collection('usercredentials');
    if (!collection) {
      throw new HttpException(500, 'Database collection not found');
    }
    const user = (await collection.findOne({ email: email.toLowerCase() })) as UserCredential | null;
    if (!user) {
      throw new HttpException(404, "User with given email doesn't exist.");
    }
    console.log('Looking up user by email:', user);
    return user;
  }

  public async getAllUsers(): Promise<void> {
    const collection = (await db()).collection('usercredentials');
    if (!collection) {
      throw new HttpException(500, 'Database collection not found');
    }
    const users = (await collection.find({}).toArray()) as unknown[];
    console.log('Retrieved all users from database ', users);
  }

  public async LoginVerification(email: string, password: string): Promise<string> {
    if (!email || !password) {
      throw new HttpException(400, 'Email and password are required');
    }
    const record = await this.findUserByEmail(email);
    console.log('Verifying login for email:', email);
    console.log('Found user record:', record);

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

export const loginService = new LoginService();
export const LoginVerification = (email: string, password: string) => loginService.LoginVerification(email, password);
export const verifyToken = (token: string) => loginService.verifyToken(token);
