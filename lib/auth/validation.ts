import { z } from "zod";

const email = z.string().trim().email("Enter a valid email address.").max(320).transform((value) => value.toLowerCase());
const password = z.string().min(8, "Password must contain at least 8 characters.").max(128);

export const signInSchema = z.object({
  email,
  password,
});

export const createAccountSchema = z
  .object({
    name: z.string().trim().min(2, "Enter the account holder's name.").max(150),
    email,
    hrbpId: z.coerce.number().int("Enter a whole-number HRBP ID.").positive("Enter a valid HRBP ID."),
    password,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export function formValues(formData: FormData) {
  return Object.fromEntries(formData.entries());
}