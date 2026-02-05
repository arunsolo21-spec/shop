import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Built-in support for Gmail
      auth: {
        // ⚠️ REPLACE THIS WITH YOUR REAL EMAIL
        user: process.env.MAIL_USER,
        
        // ⚠️ REPLACE THIS WITH YOUR 16-CHAR APP PASSWORD (NO SPACES)
        pass: process.env.MAIL_PASS, 
      },
    });
  }

  async sendOtp(to: string, otp: string) {
    try {
      await this.transporter.sendMail({
        from: '"FreshMart Security" <dexterni800@gmail.com>',
        to: to,
        subject: 'Your FreshMart Password Reset Code',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #1B5E20;">FreshMart Password Reset</h2>
            <p>You requested to reset your password. Use the code below to proceed:</p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #000;">
              ${otp}
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">If you did not request this, please ignore this email.</p>
          </div>
        `,
      });
      console.log(`[SUCCESS] Email sent to ${to}`);
    } catch (error) {
      console.error('[ERROR] Email failed:', error);
      // We log it but don't throw error so the app doesn't crash
    }
  }
}