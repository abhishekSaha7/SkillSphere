import { UserRole } from '@/types';

export const ROLE_PERMISSIONS = {
  STUDENT: [
    'course:view',
    'course:enroll',
    'progress:update',
    'assessment:take',
    'certificate:view',
    'mentor:book',
    'product:buy',
    'discussion:create',
  ],
  INSTRUCTOR: [
    'course:view',
    'course:create',
    'course:edit',
    'course:delete',
    'module:manage',
    'lesson:manage',
    'assessment:manage',
    'students:view',
    'kyc:submit',
  ],
  MENTOR: [
    'mentor:availability',
    'mentor:bookings',
    'kyc:submit',
  ],
  ORGANIZATION: [
    'organization:manage',
    'instructors:manage',
    'courses:view',
  ],
  SUPER_ADMIN: [
    '*',
  ],
};

export function hasPermission(userRole: UserRole, permission: string): boolean {
  if (userRole === 'SUPER_ADMIN') return true;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

export function isRouteAllowed(role: UserRole, path: string): boolean {
  if (role === 'SUPER_ADMIN') return true;

  if (path.startsWith('/student') && role === 'STUDENT') return true;
  if (path.startsWith('/instructor') && role === 'INSTRUCTOR') return true;
  if (path.startsWith('/mentor') && role === 'MENTOR') return true;
  if (path.startsWith('/organization') && role === 'ORGANIZATION') return true;
  if (path.startsWith('/admin')) return true;

  // Public/Shared routes
  if (path === '/' || path.startsWith('/courses') || path.startsWith('/mentors') || path.startsWith('/marketplace') || path.startsWith('/discussions') || path.startsWith('/certificates/verify')) {
    return true;
  }

  return false;
}
