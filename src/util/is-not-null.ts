export const isNotNull = <T>(input: T): input is Exclude<T, null> => input !== null;
