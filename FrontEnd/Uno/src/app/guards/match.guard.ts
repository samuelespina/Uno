import { CanActivateFn } from '@angular/router';

export const matchGuard: CanActivateFn = (route, state) => {
  return true;
};
