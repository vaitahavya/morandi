import type nodemailer from 'nodemailer';
import { IEmailService, EmailData, EmailResult, User, Order } from '@/interfaces/IEmailService';

export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Only initialize nodemailer on server side
    if (typeof window === 'undefined') {
      const nodemailer = require('nodemailer');
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    } else {
      // Mock transporter for client side
      this.transporter = {} as nodemailer.Transporter;
    }
  }

  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    try {
      // Only send emails on server side
      if (typeof window !== 'undefined') {
        console.log('Email sending skipped on client side:', emailData.subject);
        return {
          success: true,
          messageId: 'client-side-mock'
        };
      }

      const result = await this.transporter.sendMail({
        from: emailData.from || process.env.EMAIL_FROM || 'noreply@morandi.com',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        replyTo: emailData.replyTo,
        attachments: emailData.attachments
      });

      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendWelcomeEmail(user: User): Promise<EmailResult> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Morandi Lifestyle!</h2>
        <p>Hi ${user.name || 'there'},</p>
        <p>Thank you for joining our community! We're excited to have you on board.</p>
        <p>Explore our collection of premium maternity wear and lifestyle products.</p>
        <a href="${process.env.NEXTAUTH_URL}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Shopping</a>
        <p>Best regards,<br>The Morandi Team</p>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to Morandi Lifestyle!',
      html
    });
  }

  async sendOrderConfirmation(order: Order): Promise<EmailResult> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Confirmation - ${order.orderNumber}</h2>
        <p>Hi there,</p>
        <p>Thank you for your order! We've received your order and will process it shortly.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Total:</strong> ${order.currency} ${order.total.toFixed(2)}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>

        <p>We'll send you another email once your order ships.</p>
        <p>Best regards,<br>The Morandi Team</p>
      </div>
    `;

    return this.sendEmail({
      to: order.customerEmail,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html
    });
  }

  async sendPasswordResetEmail(user: User, resetToken: string): Promise<EmailResult> {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${user.name || 'there'},</p>
        <p>You requested a password reset for your Morandi Lifestyle account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Morandi Team</p>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request - Morandi Lifestyle',
      html
    });
  }

  async sendOrderStatusUpdate(order: Order, newStatus: string): Promise<EmailResult> {
    const statusMessages: Record<string, string> = {
      confirmed: 'Your order has been confirmed and is being prepared.',
      processing: 'Your order is being processed and will be shipped soon.',
      shipped: 'Your order has been shipped! You can track it using the tracking number provided.',
      delivered: 'Your order has been delivered. We hope you love your purchase!',
      cancelled: 'Your order has been cancelled as requested.',
      refunded: 'Your refund has been processed and will appear in your account within 3-5 business days.'
    };

    const message = statusMessages[newStatus] || 'Your order status has been updated.';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Status Update - ${order.orderNumber}</h2>
        <p>Hi there,</p>
        <p>${message}</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Status:</strong> ${newStatus}</p>
          ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
        </div>

        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>The Morandi Team</p>
      </div>
    `;

    return this.sendEmail({
      to: order.customerEmail,
      subject: `Order Status Update - ${order.orderNumber}`,
      html
    });
  }
}
