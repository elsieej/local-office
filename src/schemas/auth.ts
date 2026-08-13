import { z } from 'zod'

export const SIGN_IN_SCHEMA = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const SIGN_UP_SCHEMA = SIGN_IN_SCHEMA.extend({
  name: z.string().trim().min(1, 'Name is required'),
})
