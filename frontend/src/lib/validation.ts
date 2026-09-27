const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const validateEmail = (email: string) => {
  const value = email.trim();
  if (!value) {
    return "Email is required.";
  }
  if (!emailPattern.test(value)) {
    return "Enter a valid email address.";
  }
  return "";
};

export const validatePassword = (password: string, minimum = 6) => {
  if (!password) {
    return "Password is required.";
  }
  if (password.length < minimum) {
    return `Password must be at least ${minimum} characters.`;
  }
  return "";
};

export const validateFullName = (fullName: string) => {
  if (!fullName.trim()) {
    return "Full name is required.";
  }
  return "";
};

export const validateRequiredText = (value: string, label: string, maxLength?: number) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return `${label} is required.`;
  }
  if (maxLength && trimmed.length > maxLength) {
    return `${label} must be ${maxLength} characters or fewer.`;
  }
  return "";
};

export const splitSkillTokens = (value: string) =>
  value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

export const mergeSkills = (current: string[], incoming: string[]) => {
  const next = [...current];
  for (const skill of incoming) {
    const exists = next.some(
      (item) => item.toLowerCase() === skill.toLowerCase(),
    );
    if (!exists) {
      next.push(skill);
    }
  }
  return next;
};

export const validateConfirmPassword = (password: string, confirmPassword: string) => {
  if (!confirmPassword) {
    return "Confirm your password.";
  }
  if (confirmPassword !== password) {
    return "Passwords do not match.";
  }
  return "";
};
