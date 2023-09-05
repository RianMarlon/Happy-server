export interface IMailProvider {
  send(
    to: string,
    from: string,
    subject: string,
    variables: object,
    templatePath: string
  ): Promise<void>;
}
