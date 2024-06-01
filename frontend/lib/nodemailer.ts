import { createTransport } from "nodemailer";

const mailTransport = createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmailLinkVerify(email: string, otp: string) {
  await mailTransport.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Celium - Guardian Link",
    text: `Your one time password is ${otp}. Please verify your email address to start creating Celium accounts.`,
    html: `<p>Your one time password is <b>${otp}</b>. Please verify your email address to start creating Celium accounts.</p>`,
  });
}

export async function send2FARequestedEmail(
  email: string,
  twoFactorCode: string,
  approvalLink: string
) {}
