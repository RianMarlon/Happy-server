import nodemailer, { Transporter } from 'nodemailer';
import fs from 'fs';
import handlebers from 'handlebars';

class SendMailService {
  private client: Transporter
  constructor() {
    nodemailer.createTestAccount().then(account => {
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
          rejectUnauthorized: false
        }
      });

      this.client = transporter;
    });
  }

  async execute(
    to: string, 
    from: string, 
    subject: string, 
    variables: object, 
    path: string,
  ) {
    const templateFileContent = fs.readFileSync(path).toString('utf8');

    const mailTemplateParse = handlebers.compile(templateFileContent);

    const html = mailTemplateParse(variables);

    await this.client.sendMail({
      to,
      from,
      subject,
      html
    });
  }
}

export default new SendMailService();
