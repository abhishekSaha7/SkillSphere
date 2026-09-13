import { z } from 'zod';

export const courseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(2, 'Please select or enter a category'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  thumbnail: z.string().optional(),
});

export const moduleSchema = z.object({
  title: z.string().min(3, 'Module title is required'),
  order: z.coerce.number().min(1),
});

export const lessonSchema = z.object({
  title: z.string().min(3, 'Lesson title is required'),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  duration: z.coerce.number().min(1, 'Duration in minutes'),
  isFree: z.boolean().default(false),
});

export type CourseInput = z.infer<typeof courseSchema>;
export type ModuleInput = z.infer<typeof moduleSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
