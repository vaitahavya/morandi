import nodemailer from 'nodemailer';
import { supabase } from './supabase';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  type: string;
  userId?: string;
  orderId?: string;
}

export async function sendEmail(emailData: EmailData) {
  try {
    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    });

    // Save notification to database
    const { error } = await supabase
      .from('email_notifications')
      .insert({
        user_id: emailData.userId,
        order_id: emailData.orderId,
        type: emailData.type,
        subject: emailData.subject,
        content: emailData.html,
        sent: true,
        sent_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving notification to database:', error);
    }

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    
    // Save failed notification to database
    const { error: dbError } = await supabase
      .from('email_notifications')
      .insert({
        user_id: emailData.userId,
        order_id: emailData.orderId,
        type: emailData.type,
        subject: emailData.subject,
        content: emailData.html,
        sent: false,
      });

    if (dbError) {
      console.error('Error saving failed notification to database:', dbError);
    }

    return { success: false, error };
  }
}

// Email templates
export function getOrderConfirmationEmail(order: any, user: any) {
  return {
    subject: `Order Confirmation - Order #${order.id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Confirmation</h2>
        <p>Hi ${user.name || user.email},</p>
        <p>Thank you for your order! Here are your order details:</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3>Order #${order.id}</h3>
          <p><strong>Total:</strong> $${order.total}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        
        <p>We'll send you updates as your order progresses.</p>
        <p>Best regards,<br>Your Store Team</p>
      </div>
    `,
  };
}

export function getOrderShippedEmail(order: any, user: any) {
  return {
    subject: `Your Order Has Been Shipped - Order #${order.id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Order Has Been Shipped!</h2>
        <p>Hi ${user.name || user.email},</p>
        <p>Great news! Your order has been shipped and is on its way to you.</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3>Order #${order.id}</h3>
          <p><strong>Status:</strong> Shipped</p>
          <p><strong>Shipped Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <p>You'll receive another email when your order is delivered.</p>
        <p>Best regards,<br>Your Store Team</p>
      </div>
    `,
  };
}

export function getProductRecommendationEmail(user: any, recommendations: any[]) {
  return {
    subject: 'Recommended Products Just for You',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Recommended Products</h2>
        <p>Hi ${user.name || user.email},</p>
        <p>Based on your browsing history, we think you might like these products:</p>
        
        <div style="margin: 20px 0;">
          ${recommendations.map(product => `
            <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0;">
              <h3>${product.name}</h3>
              <p><strong>Price:</strong> $${product.price}</p>
              <p>${product.description || ''}</p>
            </div>
          `).join('')}
        </div>
        
        <p>Happy shopping!</p>
        <p>Best regards,<br>Your Store Team</p>
      </div>
    `,
  };
} 