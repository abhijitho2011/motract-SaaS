import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class WorkshopTenantGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Super Admin bypasses all tenant checks
        if (user.role === 'SUPER_ADMIN') {
            return true;
        }

        // Workshop roles MUST have workshopId
        const workshopRoles = [
            'WORKSHOP_ADMIN',
            'WORKSHOP_MANAGER',
            'TECHNICIAN',
            'WORKSHOP_OWNER',
            'WORKSHOP_STAFF'
        ];

        if (workshopRoles.includes(user.role)) {
            if (!user.workshopId) {
                throw new ForbiddenException('Workshop ID is required for this role');
            }
        }

        return true;
    }
}
