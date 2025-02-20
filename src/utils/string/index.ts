const characters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const normalizeString = (str: string | undefined | null) => {
  if (str) return str.trim().toLowerCase();
  return null;
};

export const generateRandomString = (length: number = 6) => {
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
};
