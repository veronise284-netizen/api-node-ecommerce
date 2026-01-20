import nodemailer from "nodemailer";

const port = parseInt(process.env.EMAIL_PORT || "465");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port,
  secure: port === 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const emailTemplates = {
  welcome: (firstName: string) => ({
    subject: "Welcome to E-Commerce API",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome ${firstName}! 🎉</h2>
        <p>Thank you for registering with our E-Commerce platform.</p>
        <p>You can now start shopping and enjoy our services.</p>
        <p>If you have any questions, feel free to contact our support team.</p>
        <br>
        <p>Best regards,<br>E-Commerce Team</p>
      </div>
    `,
  }),

  passwordReset: (firstName: string, resetToken: string, resetUrl: string) => ({
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hi ${firstName},</p>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">Reset Password</a>
        <p>Or copy this link: ${resetUrl}</p>
        <p><strong>This link will expire in 10 minutes.</strong></p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>E-Commerce Team</p>
      </div>
    `,
  }),

  passwordChanged: (firstName: string) => ({
    subject: "Password Changed Successfully",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Changed ✓</h2>
        <p>Hi ${firstName},</p>
        <p>Your password has been successfully changed.</p>
        <p>If you didn't make this change, please contact our support team immediately.</p>
        <br>
        <p>Best regards,<br>E-Commerce Team</p>
      </div>
    `,
  }),

  orderPlaced: (firstName: string, orderId: string, totalAmount: number, items: any[]) => ({
    subject: `Order Confirmation - #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Placed Successfully! 🛍️</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for your order. Your order has been received and is being processed.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
          <p><strong>Items:</strong> ${items.length}</p>
        </div>
        <p>We'll notify you when your order status changes.</p>
        <br>
        <p>Best regards,<br>E-Commerce Team</p>
      </div>
    `,
  }),

  orderStatusUpdate: (firstName: string, orderId: string, status: string) => ({
    subject: `Order Update - #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Status Updated 📦</h2>
        <p>Hi ${firstName},</p>
        <p>Your order status has been updated.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>New Status:</strong> <span style="color: #007bff; font-weight: bold;">${status.toUpperCase()}</span></p>
        </div>
        ${status === "shipped" ? "<p>Your order is on its way! 🚚</p>" : ""}
        ${status === "delivered" ? "<p>Your order has been delivered! Enjoy your purchase! 🎉</p>" : ""}
        ${status === "cancelled" ? "<p>Your order has been cancelled. If you have questions, please contact support.</p>" : ""}
        <br>
        <p>Best regards,<br>E-Commerce Team</p>
      </div>
    `,
  }),
};

export const sendEmail = async (
  to: string,
  template: { subject: string; html: string }
): Promise<boolean> => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("📧 Email not sent (credentials not configured):", template.subject);
      return false;
    }

    const info = await transporter.sendMail({
      from: `"E-Commerce API" <${process.env.EMAIL_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    });

    console.log("📧 Email sent successfully:", info.messageId);
    return true;
  } catch (error: any) {
    console.error("Email sending failed:", error.message);
    return false;
  }
};
