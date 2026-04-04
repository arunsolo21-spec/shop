import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendOtp(email: string, otp: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get('SMTP_FROM'),
        to: email,
        subject: 'FreshMart - Password Reset OTP',
        html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%); padding: 30px; text-align: center;">
<h1 style="color: white; margin: 0;">FreshMart</h1>
<p style="color: white; margin: 10px 0 0 0;">Password Reset Request</p>
</div>
<div style="padding: 30px; background: #f9f9f9;">
<p style="font-size: 16px; color: #333;">Hello,</p>
<p style="font-size: 16px; color: #333;">You requested a password reset. Use the OTP below to reset your password:</p>
<div style="background: #FF6B35; color: white; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; letter-spacing: 5px;">
${otp}
</div>
<p style="font-size: 14px; color: #666;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
<p style="font-size: 14px; color: #666;">If you didn't request this, please ignore this email.</p>
</div>
<div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
<p style="margin: 0;">© 2024 FreshMart. All rights reserved.</p>
</div>
</div>
`,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ OTP email sent to ${email}`);
      return true;
    } catch (error: any) {
      this.logger.error(`❌ Failed to send OTP email to ${email}: ${error.message}`);
      return false;
    }
  }

  async sendOrderConfirmation(email: string, orderId: string, totalAmount: number): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get('SMTP_FROM'),
        to: email,
        subject: 'FreshMart - Order Confirmation',
        html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center;">
<h1 style="color: white; margin: 0;">Order Confirmed!</h1>
</div>
<div style="padding: 30px; background: #f9f9f9;">
<p style="font-size: 16px; color: #333;">Thank you for your order!</p>
<div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
<p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${totalAmount.toFixed(2)}</p>
<p style="margin: 5px 0;"><strong>Status:</strong> Pending</p>
</div>
<p style="font-size: 14px; color: #666;">We will notify you when your order is shipped.</p>
</div>
<div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
<p style="margin: 0;">© 2024 FreshMart. All rights reserved.</p>
</div>
</div>
`,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Order confirmation email sent to ${email}`);
      return true;
    } catch (error: any) {
      this.logger.error(`❌ Failed to send order confirmation email: ${error.message}`);
      return false;
    }
  }

  async sendOrderNotification(
    email: string,
    orderId: string,
    status: string,
    totalAmount: number,
    type: string,
  ): Promise<boolean> {
    try {
      const subjectMap: Record<string, string> = {
        'order-created': 'Order Placed Successfully',
        'order-shipped': 'Your Order is Out for Delivery',
        'order-delivered': 'Order Delivered Successfully',
        'order-cancelled': 'Order Cancelled',
      };

      const mailOptions = {
        from: this.configService.get('SMTP_FROM'),
        to: email,
        subject: subjectMap[type] || 'Order Update',
        html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%); padding: 30px; text-align: center;">
<h1 style="color: white; margin: 0;">${subjectMap[type] || 'Order Update'}</h1>
</div>
<div style="padding: 30px; background: #f9f9f9;">
<p style="font-size: 16px; color: #333;">Your order status has been updated.</p>
<div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
<p style="margin: 5px 0;"><strong>Status:</strong> ${status}</p>
<p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${totalAmount.toFixed(2)}</p>
</div>
<p style="font-size: 14px; color: #666;">Thank you for shopping with FreshMart!</p>
</div>
<div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
<p style="margin: 0;">© 2024 FreshMart. All rights reserved.</p>
</div>
</div>
`,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Order notification email sent to ${email}`);
      return true;
    } catch (error: any) {
      this.logger.error(`❌ Failed to send order notification email: ${error.message}`);
      return false;
    }
  }
}