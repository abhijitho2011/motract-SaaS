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
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return {
      message: 'JWT authentication working',
      user: req.user,
    };
  }

  // RSA-specific login endpoint (phone + password)
  @Post('rsa-login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  async rsaLogin(@Body() body: { phone: string; password: string }) {
    const user = await this.authService.validateRSA(body.phone, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials or not an RSA account');
    }
    return this.authService.loginRSA(user);
  }
}
