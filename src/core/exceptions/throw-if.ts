import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

export function throwIf(condition: boolean, message: string): void {
  if (condition) {
    throw new BadRequestException(message);
  }
}

export function throwIfNotFound(
  entity: any,
  message = 'Resource not found',
): void {
  if (!entity) {
    throw new NotFoundException(message);
  }
}

export function throwUnauthorized(message = 'Unauthorized'): never {
  throw new UnauthorizedException(message);
}

export function throwForbidden(message = 'Forbidden'): never {
  throw new ForbiddenException(message);
}

export function throwConflict(message = 'Conflict'): never {
  throw new ConflictException(message);
}
