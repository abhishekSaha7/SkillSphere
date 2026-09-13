import { UserRole } from '@/types';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      avatar?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: UserRole;
    avatar?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    avatar?: string | null;
  }
}
