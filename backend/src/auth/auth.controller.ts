import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() body: any) {
    // Basic validation before calling login
    // In real app, use DTOs and ValidationPipe
    const user = await this.authService.validateUser(
      body.mobile,
      body.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user); // Returns access_token
  }

  @Post('register')
  async register(@Body() userData: any) {
    return this.authService.register(userData);
  }
}
