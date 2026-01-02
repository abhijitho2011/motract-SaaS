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
        password: string | null;
        id: string;
        name: string | null;
        createdAt: string;
        updatedAt: string;
        email: string | null;
        mobile: string;
        role: "SUPER_ADMIN" | "WORKSHOP_ADMIN" | "WORKSHOP_MANAGER" | "TECHNICIAN" | "CLIENT" | "RSA_PROVIDER" | "SUPPLIER";
        workshopId: string | null;
    }>;
}
