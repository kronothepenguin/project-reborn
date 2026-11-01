// The rules of Holo's registration.js, kept apart from the island so that they
// can be read on their own. The server checks the same limits again.

export const ageLimit = 6;
export const parentEmailAgeLimit = 12;

const emailFormat =
  /^[A-Za-z0-9_.-]+@([A-Za-z0-9]+(-+[A-Za-z0-9]+)*\.)+[A-Za-z]{2,7}$/;

// looksLikeEmail is Holo's quick check while typing; isEmail is its full rule,
// which matches auth.ValidateEmail.
export function looksLikeEmail(value: string) {
  return /[^@]+@[^@]+/.test(value);
}

export function isEmail(value: string) {
  return value.length >= 6 && emailFormat.test(value);
}

// ageOn returns -1 for an empty or impossible date, or one in the future.
export function ageOn(
  year: string,
  month: string,
  day: string,
  today = new Date(),
) {
  if (!year || !month || !day) {
    return -1;
  }
  const born = new Date(Number(year), Number(month) - 1, Number(day));
  let age = today.getFullYear() - born.getFullYear();
  if (
    born.getMonth() > today.getMonth() ||
    (born.getMonth() === today.getMonth() && born.getDate() > today.getDate())
  ) {
    age--;
  }
  return age >= 0 ? age : -1;
}

export function isInTheFuture(year: string, month: string, day: string) {
  return new Date(Number(year), Number(month) - 1, Number(day)) > new Date();
}
