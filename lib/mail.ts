import nodemailer from "nodemailer";
import { prisma } from "./prisma";

type SMTPConfig = {
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPass?: string;
};

export async function sendSystemEmail(
  to: string,
  subject: string,
  text: string,
) {
  /**
   * Reading settings from database
   */
  const settingsArray = await prisma.setting.findMany({
    where: {
      key: {
        startsWith: "smtp",
      },
    },
  });

  const config = settingsArray.reduce<SMTPConfig>(
    (acc, curr) => ({
      ...acc,
      [curr.key]: curr.value,
    }),
    {},
  );

  /**
   * check active email setting
   */
  const isEnabled = await prisma.setting.findUnique({
    where: {
      key: "emailEnabled",
    },
  });

  if (isEnabled?.value !== "true") {
    throw new Error("Email notifications are disabled.");
  }

  /**
   * validate required config
   */
  if (
    !config.smtpHost ||
    !config.smtpPort ||
    !config.smtpUser ||
    !config.smtpPass
  ) {
    throw new Error("SMTP settings are incomplete");
  }

  /**
   * create transporter
   */
  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: Number(config.smtpPort),
    secure: config.smtpPort === "465",

    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
  try {
    await transporter.verify();
  } catch (error) {
    throw new Error("SMTP authentication failed");
  }
  /**
   * send email
   */
  return await transporter.sendMail({
    from: `"Admin System" <${config.smtpUser}>`,
    to,
    subject,
    text,
  });
}
