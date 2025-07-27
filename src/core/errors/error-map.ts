// error-map.ts
export interface ErrorMeta {
  type: string;
  defaultMsg: string;
}

// Only include the codes you care about explicitly; group 5xx under a wildcard
export const RESPONSE_ERROR_MAP: Record<number, ErrorMeta> = {
  400: {
    type: 'BadRequest',
    defaultMsg: 'Invalid request sent to file service.',
  },
  401: {
    type: 'Unauthorized',
    defaultMsg: 'Authentication required by file service.',
  },
  403: { type: 'Forbidden', defaultMsg: 'Permission denied by file service.' },
  404: {
    type: 'NotFound',
    defaultMsg: 'Requested resource not found in file service.',
  },
  409: {
    type: 'Conflict',
    defaultMsg: 'A conflict occurred with the file service.',
  },
};

// Fallback for any 5xx status
export const SERVER_ERROR_META: ErrorMeta = {
  type: 'ServiceUnavailable',
  defaultMsg: 'The file service is unavailable or encountered an error.',
};
