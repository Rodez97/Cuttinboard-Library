export type RealtimeDatabaseData<T> = {
  [K in keyof T]: T[K] | null;
};
