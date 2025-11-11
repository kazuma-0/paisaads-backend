import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true; // No roles required, allow access.
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    console.log(user.role);

    console.log(requiredRoles.includes(user.role));

    if (!user || !user.role || !requiredRoles.includes(user.role)) {
      throw new UnauthorizedException('Insufficient role permissions');
    }

    return true;
  }
}
