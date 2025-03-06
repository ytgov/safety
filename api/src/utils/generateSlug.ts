export function generateSlug() {
  // return 8 random characters and numbers with a dash after 4 characters
  return (
    Math.random().toString(36).substring(2, 6).toUpperCase() +
    "-" +
    Math.random().toString(36).substring(2, 6).toUpperCase()
  );
}
