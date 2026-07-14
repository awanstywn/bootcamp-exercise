/**
 * @fileoverview Email Service
 * @objective Centralize the logic for sending transactional emails (like welcome emails).
 * @risk Hardcoding credentials or failing to handle SMTP connection errors gracefully can crash the server. (Errors are caught and logged here).
 * @relations Called asynchronously by `auth.service.ts`. Uses `nodemailer` and `env` config.
 * @logic
 * - Configures a Nodemailer transport using the SMTP settings from environment variables.
 * - `sendWelcome`: Skips sending if SMTP is not configured. Otherwise, constructs and sends a welcome email payload.
 * - Exceptions are caught and logged so they don't interrupt the main application flow (e.g. failing to send an email shouldn't abort user registration).
 */
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    pool: true,
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          }
        : undefined,
  });

  static async sendWelcome(email: string) {
    if (!env.SMTP_USER) {
      console.log(`[Email] Skipping welcome email for ${email} (SMTP not configured)`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"Blog App" <${env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to Blog App!',
        text: 'Thank you for registering. We hope you enjoy reading and writing posts!',
        html: '<p>Thank you for registering. We hope you enjoy reading and writing posts!</p>',
      });
      console.log(`[Email] Sent welcome email to ${email}`);
    } catch (error) {
      console.error(`[Email Error] Failed to send welcome email to ${email}:`, error);
    }
  }

  static async sendResetPassword(email: string, token: string) {
    if (!env.SMTP_USER) {
      console.log(`[Email] Skipping reset password email for ${email} (SMTP not configured)`);
      return;
    }

    const resetLink = `${env.CLIENT_URL}/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: `"Blog App" <${env.SMTP_USER}>`,
        to: email,
        subject: 'Reset Your Password - Blog App',
        text: `You requested a password reset. Click the link to reset your password: ${resetLink} \nThis link is valid for 15 minutes.`,
        html: `<p>You requested a password reset.</p><p><a href="${resetLink}">Click here to reset your password</a></p><p>This link is valid for 15 minutes. If you did not request this, please ignore this email.</p>`,
      });
      console.log(`[Email] Sent reset password email to ${email}`);
    } catch (error) {
      console.error(`[Email Error] Failed to send reset password email to ${email}:`, error);
    }
  }
  static async sendVerificationEmail(email: string, token: string) {
    if (!env.SMTP_USER) {
      console.log(`[Email] Skipping verification email for ${email} (SMTP not configured)`);
      return;
    }

    const verifyLink = `${env.CLIENT_URL}/verify-email?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: `"Blog App" <${env.SMTP_USER}>`,
        to: email,
        subject: 'Verify Your Email - Blog App',
        text: `Welcome! Please click the link to verify your email and complete your registration: ${verifyLink} \nThis link is valid for 15 minutes.`,
        html: `<p>Welcome to Blog App!</p><p><a href="${verifyLink}">Click here to verify your email address</a></p><p>This link is valid for 15 minutes. If you did not request this, please ignore this email.</p>`,
      });
      console.log(`[Email] Sent verification email to ${email}`);
    } catch (error) {
      console.error(`[Email Error] Failed to send verification email to ${email}:`, error);
    }
  }
}
