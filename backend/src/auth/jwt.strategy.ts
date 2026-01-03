import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'FALLBACK_SECRET_CHANGE_ME',
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      mobile: payload.mobile,
      role: payload.role,
      workshopId: payload.workshopId,
    };
  }
}
