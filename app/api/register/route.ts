import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { registerSchema } from '@/lib/validations/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    if ((validatedData.role as string) === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Public registration as Super Admin is not permitted.' },
        { status: 403 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    const newUser = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        passwordHash,
        role: validatedData.role,
        ...(validatedData.role === 'STUDENT' && {
          studentProfile: {
            create: {
              bio: 'New student on SkillSphere',
            },
          },
        }),
        ...(validatedData.role === 'INSTRUCTOR' && {
          instructorProfile: {
            create: {
              title: validatedData.title || 'Instructor',
              bio: 'Course instructor on SkillSphere',
            },
          },
        }),
        ...(validatedData.role === 'MENTOR' && {
          mentorProfile: {
            create: {
              title: validatedData.title || 'Mentor',
              bio: 'Professional mentor on SkillSphere',
              expertise: 'General Technology & Career Guidance',
              hourlyRate: 50.0,
            },
          },
        }),
        ...(validatedData.role === 'ORGANIZATION' && {
          organizationProfile: {
            create: {
              companyName: validatedData.companyName || validatedData.name,
            },
          },
        }),
      },
    });

    return NextResponse.json(
      {
        message: 'Registration successful! You can now log in.',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong during registration.' },
      { status: 500 }
    );
  }
}
