import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleSignInDto } from './dto/google-signin.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      data: result,
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return {
      success: true,
      data: result,
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    await this.authService.forgotPassword(email);
    return {
      success: true,
      message: 'Password reset email sent',
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body('email') email: string,
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    await this.authService.resetPassword(email, token, password);
    return {
      success: true,
      message: 'Password reset successful',
    };
  }
  @Post('google-signin')
@HttpCode(HttpStatus.OK)
async googleSignIn(@Body() googleSignInDto: GoogleSignInDto) {
  const result = await this.authService.googleSignIn(googleSignInDto);
  return {
    success: true,
    data: result,
  };
}

}