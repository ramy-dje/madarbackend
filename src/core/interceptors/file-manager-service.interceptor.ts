// file-service.interceptor.ts
import { AxiosError } from 'axios';
import { throwError } from 'rxjs';
import {
  mapResponseError,
  mapNetworkError,
  mapSetupError,
} from '../errors/error-helpers';
import { HttpException } from '@nestjs/common';

export function handleRequestError() {
  return (error: AxiosError) => {
    let exception: HttpException;
    if (error.response) {
      exception = mapResponseError(error);
    } else if (error.request) {
      exception = mapNetworkError();
    } else {
      exception = mapSetupError();
    }

    return throwError(() => exception);
  };
}
