// Type helpers to fix Promise.filter() and other async issues

export const resolveUsers = async (usersPromise: Promise<any[]>): Promise<any[]> => {
  try {
    const users = await usersPromise;
    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error('Error resolving users:', error);
    return [];
  }
};

export const filterUsers = async (usersPromise: Promise<any[]>, filterFn: (user: any) => boolean): Promise<any[]> => {
  const users = await resolveUsers(usersPromise);
  return users.filter(filterFn);
};

export const mapUsers = async (usersPromise: Promise<any[]>, mapFn: (user: any) => any): Promise<any[]> => {
  const users = await resolveUsers(usersPromise);
  return users.map(mapFn);
};

// Helper for promise-based operations
export const asyncFilter = async <T>(array: T[], predicate: (value: T) => Promise<boolean>): Promise<T[]> => {
  const results = await Promise.all(array.map(predicate));
  return array.filter((_, index) => results[index]);
};