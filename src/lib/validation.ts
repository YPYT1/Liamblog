import { z } from 'zod'

export const emailSchema = z.string().email()

export const passwordSchema = z
  .string()
  .min(6)
  .regex(/[a-zA-Z]/, 'must include letters')
  .regex(/[0-9]/, 'must include numbers')

export const codeSchema = z.string().length(6).regex(/^[0-9]{6}$/)
