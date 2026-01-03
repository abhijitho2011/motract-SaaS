import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: any): Promise<{
        access_token: string;
        user: any;
    }>;
    register(userData: any): Promise<{
        id: string;
        name: string | null;
        createdAt: string;
        updatedAt: string;
        email: string | null;
        mobile: string;
        password: string | null;
        role: "SUPER_ADMIN" | "WORKSHOP_ADMIN" | "WORKSHOP_MANAGER" | "TECHNICIAN" | "CLIENT" | "RSA_PROVIDER" | "SUPPLIER";
        workshopId: string | null;
    }>;
    getProfile(req: any): Promise<{
        message: string;
        user: any;
    }>;
}
