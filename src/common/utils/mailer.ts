import nodemailer, { SendMailOptions } from "nodemailer"
import { MailOptions } from "nodemailer/lib/json-transport"

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT as string),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  }
})

export const sendMail = async (opts: Omit<SendMailOptions, "from">) => {
  try {
    const res = await transporter.sendMail({
      from: '"System" <system@sobee.com>',
      ...opts
    })
    return res
  } catch (error) {
    console.log(error)
  }
}

export default transporter
