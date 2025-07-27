import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  } as nodemailer.TransportOptions);

  async sendFolderSharedEmail(
    to: string,
    folderName: string,
    password?: string,
    link?: string,
  ) {
    const html = `
      <!DOCTYPE html>
      <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" />
        <title>Folder Access Granted</title>
        <style>
        body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
        table { border-collapse:collapse !important; }
        body { margin:0; padding:0; width:100% !important; background-color:#f4f4f4; font-family:'Helvetica Neue',Arial,sans-serif; }
        .email-container { max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:8px; overflow:hidden; }
        .email-header { background-color:#37848c; padding:20px; text-align:center; color:#ffffff; font-size:24px; }
        .email-body { padding:30px; color:#333333; line-height:1.5; }
        .email-body h1 { font-size:20px; margin-bottom:15px; }
        .email-body p { margin-bottom:15px; }
        .button { display:inline-block; padding:12px 24px; margin:20px 0; background-color:#37848c; color:#ffffff !important; text-decoration:none; border-radius:4px; font-weight:bold; }
        .email-footer { background-color:#f4f4f4; text-align:center; padding:20px; font-size:12px; color:#777777; }
        @media screen and (max-width:480px) {
          .email-body { padding:20px; }
          .email-header { font-size:20px; padding:15px; }
        }
        </style>
      </head>
      <body>
        <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
          <table class="email-container" cellpadding="0" cellspacing="0">
            <tr>
            <td class="email-header">Hotel Ralf Notification</td>
            </tr>
            <tr>
            <td class="email-body">
              <h1>Hello,</h1>
              <p>You've been granted access to the folder: <strong>${folderName}</strong>.</p>
              ${
                password
                  ? `<p>This folder is password protected. Use the password below:</p>
                 <p style="background:#f0f0f0;padding:12px;border-radius:4px;font-family:monospace;">${password}</p>`
                  : ''
              }
              <p>You can view your folder directly through your <a href="https://hotelralf.com/dashboard">dashboard</a>.</p>
              ${
                link
                  ? `<p style="text-align:center;"><a href="${link}" class="button">View Folder Now</a></p>`
                  : ''
              }
              <p>If you have any questions, reply to this email or visit our <a href="https://hotelralf.com/support">support center</a>.</p>
              <p>Thanks,<br/>The Hotel Ralf Team</p>
            </td>
            </tr>
            <tr>
            <td class="email-footer">
              © ${new Date().getFullYear()} Hotel Ralf. All rights reserved.<br/>
              84 Bd Colonel krim Belkacem, Alger centre 16000, Algerie<br/>
              <a href="mailto:contact@hotelralf.com">contact@hotelralf.com</a>
            </td>
            </tr>
          </table>
          </td>
        </tr>
        </table>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: `Folder Shared: ${folderName}`,
      html,
    });
  }
}
