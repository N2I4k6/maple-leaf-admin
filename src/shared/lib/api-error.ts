import { AxiosError } from 'axios';

interface ApiErrorBody {
  msg?: string;
  message?: string | string[];
  errors?: { msg: string }[];
}

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Произошла ошибка',
): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorBody | undefined;

    if (data?.msg) return data.msg;
    if (Array.isArray(data?.message) && data.message[0]) return data.message[0];
    if (typeof data?.message === 'string') return data.message;
    if (data?.errors?.[0]?.msg) return data.errors[0].msg;
    if (error.message) return error.message;
  }

  if (error instanceof Error) return error.message;

  return fallback;
};

export const getApiErrorStatus = (error: unknown): number | undefined => {
  if (error instanceof AxiosError) {
    return error.response?.status;
  }
  return undefined;
};