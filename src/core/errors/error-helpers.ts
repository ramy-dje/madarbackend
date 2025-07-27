// error-helpers.ts
import { AxiosError } from 'axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RESPONSE_ERROR_MAP, SERVER_ERROR_META } from './error-map';

function extractApiMessage(data: any): string | undefined {
  return data?.message || data?.error?.message || data?.error;
}

export function mapResponseError(error: AxiosError): HttpException {
  const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
  const body = error.response?.data;
  const apiMsg = extractApiMessage(body);
  const meta =
    RESPONSE_ERROR_MAP[status] ??
    (status >= 500
      ? SERVER_ERROR_META
      : {
          type: 'InternalServerError',
          defaultMsg: `Unexpected error (${status}).`,
        });
  const message = apiMsg
    ? `${meta.defaultMsg.replace(/\.$/, '')}: ${apiMsg}`
    : meta.defaultMsg;

  return new HttpException(
    { statusCode: status, error: meta.type, message },
    status,
  );
}

export function mapNetworkError(): HttpException {
  // Network error, no response received

  return new HttpException(
    {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'InternalServerError',
      message:
        'Failed to send request to the file service due to a network error.',
    },
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

export function mapSetupError(): HttpException {
  // Something went wrong setting up the request itself
  return new HttpException(
    {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'InternalServerError',
      message:
        'Failed to send request to the file service due to a setup error.',
    },
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}
