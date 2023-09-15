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
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
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
