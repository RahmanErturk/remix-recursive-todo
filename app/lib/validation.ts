export type FieldErrors = {
  email?: string;
  password?: string;
};

export function validateEmail(email: string): string | undefined {
  const v = email.trim();
  if (!v) return "Email is required.";

  // a simple email regex check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? undefined : "Please enter a valid email.";
}

export function validatePassword(
  password: string,
  mode: "signup" | "login"
): string | undefined {
  if (!password) return "Password is required.";

  // No need to re-validate password policy on login;
  // the user is trying to enter their existing password.
  if (mode === "login") return undefined;

  // For signup, Appwrite requires minimum 8 characters.
  if (password.length < 8) return "Password must be at least 8 characters.";

  return undefined;
}

export function validateAuthCredentials(
  email: string,
  password: string,
  mode: "signup" | "login"
): FieldErrors {
  const errors: FieldErrors = {};
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password, mode);

  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;

  return errors;
}
