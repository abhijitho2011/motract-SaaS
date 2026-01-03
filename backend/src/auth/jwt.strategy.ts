import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'FALLBACK_SECRET_CHANGE_ME',
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
