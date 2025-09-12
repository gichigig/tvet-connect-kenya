// Helper functions to handle Promise-based operations that components are incorrectly trying to use synchronously

export const filterUsersAsync = async <T>(usersPromise: Promise<T[]>, filterFn: (user: T) => boolean): Promise<T[]> => {
  const users = await usersPromise;
  return users.filter(filterFn);
};

export const mapUsersAsync = async <T, U>(usersPromise: Promise<T[]>, mapFn: (user: T) => U): Promise<U[]> => {
  const users = await usersPromise;
  return users.map(mapFn);
};

export const getUsersLength = async <T>(usersPromise: Promise<T[]>): Promise<number> => {
  const users = await usersPromise;
  return users.length;
};

// Synchronous version for when we know we have the data
export const safeFilter = <T>(data: T[] | Promise<T[]>, filterFn: (item: T) => boolean): T[] => {
  if (Array.isArray(data)) {
    return data.filter(filterFn);
  }
  console.warn('Attempting to filter a Promise. Use filterUsersAsync instead.');
  return [];
};