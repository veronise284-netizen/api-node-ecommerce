import { transporter } from '../config/email.config';
import { 
  welcomeEmailTemplate, 
  passwordResetTemplate,
  passwordChangedTemplate,
  orderConfirmationTemplate,
  orderStatusUpdateTemplate
} from '../templates/email.templates';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: `"E-Commerce API" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
  } catch (error) {
    // Silently fail - email is optional and shouldn't break the application
  }
};

export const sendWelcomeEmail = async (
  email: string, 
  firstName: string
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Welcome to Our Platform!',
    html: welcomeEmailTemplate(firstName, email),
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  firstName: string,
  resetToken: string
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html: passwordResetTemplate(firstName, resetToken),
  });
};

export const sendPasswordChangedEmail = async (
  email: string,
  firstName: string
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Password Changed Successfully',
    html: passwordChangedTemplate(firstName),
  });
};

export const sendOrderConfirmationEmail = async (
  email: string,
  firstName: string,
  orderId: string,
  total: number
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: `Order Confirmation - ${orderId}`,
    html: orderConfirmationTemplate(firstName, orderId, total),
  });
};

export const sendOrderStatusUpdateEmail = async (
  email: string,
  firstName: string,
  orderId: string,
  status: string
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: `Order Status Update - ${orderId}`,
    html: orderStatusUpdateTemplate(firstName, orderId, status),
  });
};
