import { SetMetadata } from '@nestjs/common';

export const SCOPED_PERMISSION_KEY = 'scopedPermission';
export const ScopedPermission = (permission: string) =>
  SetMetadata(SCOPED_PERMISSION_KEY, permission);
