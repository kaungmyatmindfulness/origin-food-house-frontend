/**
 * Generates initials from a user's name.
 * Takes the first letter of each word (up to 2 words).
 *
 * @param name - The user's full name
 * @returns Uppercase initials (max 2 characters)
 *
 * @example
 * getInitials('John Doe') // Returns 'JD'
 * getInitials('Alice') // Returns 'A'
 * getInitials('Mary Jane Watson') // Returns 'MJ'
 */
export function getInitials(name: string): string {
  if (!name || name.trim().length === 0) {
    return '';
  }

  return name
    .trim()
    .split(' ')
    .filter((part) => part.length > 0)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
