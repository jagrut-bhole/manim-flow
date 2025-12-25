import nodemailer from "nodemailer";
import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;

export class EmailServices {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = this.createTransporter();
    this.verifyConnection();
  }

  private createTransporter() {
    const oauthClient = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground",
    );

    oauthClient.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_ADDRESS,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      },
    });
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("Email server is ready to take messages");
    } catch (error) {
      console.error("Error verifying email server connection: ", error);
    }
  }

  private async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `ManinFlow <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: html,
      });
      console.log("Email sent: ", info.messageId);
      return {
        success: true,
        message: info.messageId,
      };
    } catch (error: any) {
      console.error("Error sending email: ", error.message);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async sendVerificationCode(email: string, verificationCode: string) {
    const html = `
            <p>Your verification code is: <strong>${verificationCode}</strong></p>
            <p>This code will expire in 10 minutes.</p>
            `;

    return this.sendEmail(email, "Your Verification Code", html);
  }
}
