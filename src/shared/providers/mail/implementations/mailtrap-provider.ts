import { IMailProvider } from '../models/mail-provider.interface';

import nodemailer from 'nodemailer';
import fs from 'fs';
import handlebers from 'handlebars';

class MailtrapProvider implements IMailProvider {
  async send(
    to: string,
    from: string,
    subject: string,
    variables: object,
    templatePath: string
  ) {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_SERVICE_HOST,
      port: Number(process.env.MAIL_SERVICE_PORT),
      auth: {
        type: process.env.MAIL_SERVICE_TYPE as any,
        user: process.env.MAIL_SERVICE_USER,
        clientId: process.env.MAIL_SERVICE_CLIENT_ID,
        clientSecret: process.env.MAIL_SERVICE_CLIENT_SECRET,
        refreshToken: process.env.MAIL_SERVICE_REFRESH_TOKEN,
        accessToken: process.env.MAIL_SERVICE_ACCESS_TOKEN,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const templateFileContent = fs.readFileSync(templatePath).toString('utf8');

    const mailTemplateParse = handlebers.compile(templateFileContent);

    const html = mailTemplateParse(variables);

    await transporter.sendMail({
      to,
      from,
      subject,
      html,
    });
  }
}

export default MailtrapProvider;
