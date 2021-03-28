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
          user: process.env.MAIL_SERVICE_USER,
          pass: process.env.MAIL_SERVICE_PASS
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
