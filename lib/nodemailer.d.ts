declare module "nodemailer" {
  interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: { user: string; pass: string };
    tls?: { rejectUnauthorized?: boolean };
  }

  interface SendMailOptions {
    from?: string;
    to?: string;
    subject?: string;
    text?: string;
    html?: string;
  }

  interface Transporter {
    sendMail(options: SendMailOptions): Promise<unknown>;
  }

  function createTransport(options: TransportOptions): Transporter;

  export { createTransport, Transporter, TransportOptions, SendMailOptions };
}
