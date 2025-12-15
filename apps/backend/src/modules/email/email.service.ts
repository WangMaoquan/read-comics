import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class EmailService {
  transporter: Transporter;
  constructor(private configSevice: ConfigService) {
    this.transporter = createTransport({
      host: this.configSevice.get<string>('EMAIL_HOST'),
      port: this.configSevice.get<string>('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.configSevice.get<string>('EMAIL_USER'),
        pass: this.configSevice.get<string>('EMAIL_PASSWORD'),
      },
    } as SMTPTransport.Options);
  }

  async sendMail({ to, subject, html }: Mail.Options) {
    this.transporter.sendMail(
      {
        from: {
          name: this.configSevice.get<string>('EMAIL_FROM', '默认'),
          address: this.configSevice.get<string>('EMAIL_PASSWORD')!,
        },
        to,
        subject,
        html,
      },
      (error) => {
        console.log(error?.message, 'sendMail error');
      },
    );
  }
}
