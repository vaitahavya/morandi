export interface IEmailService {
  sendEmail(emailData: EmailData): Promise<EmailResult>;
  sendWelcomeEmail(user: User): Promise<EmailResult>;
  sendOrderConfirmation(order: Order): Promise<EmailResult>;
  sendPasswordResetEmail(user: User, resetToken: string): Promise<EmailResult>;
  sendOrderStatusUpdate(order: Order, newStatus: string): Promise<EmailResult>;
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  template?: string;
  templateData?: Record<string, any>;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  total: number;
  currency: string;
  status: string;
  trackingNumber?: string;
}
