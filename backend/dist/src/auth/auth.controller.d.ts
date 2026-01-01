import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: any): Promise<{
        access_token: string;
        user: any;
    } | {
        message: string;
    }>;
    register(userData: any): Promise<{
        id: string;
        name: string | null;
        email: string | null;
        mobile: string;
        password: string | null;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
        workshopId: string | null;
    }>;
}
