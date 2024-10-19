import { createTransport } from "nodemailer"
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } from '$env/static/private';

const transport = createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === '465',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

export async function sendEmail(receivers: {url: string, host: string, email: string}[]) {
  for (const rcv of receivers) {
    const result = await transport.sendMail({
      to: rcv.email,
      from: SMTP_FROM,
      subject: `Anfrage zum Ausfüllen eines Fragebogens`,
      text: text({ url: rcv.url, host: rcv.host }),
      html: html({ url: rcv.url, host: rcv.host }),
    })
    const failed = result.rejected.concat(result.pending).filter(Boolean)
    if (failed.length) {
      throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`)
    }
  }
}
 
function html(params: { url: string; host: string }) {
  const { url, host } = params
 
  const escapedHost = host.replace(/\./g, "&#8203;.")
 
  const brandColor = "#346df1"
  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText: "#fff",
  }
 
  return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Sie wurden eingeladen, einen Fragebogen auf ${escapedHost} auszufüllen.
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Zum Fragebogen</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Falls Sie diese Mail nicht erwartet haben, können Sie sie gefahrlos ignorieren.
      </td>
    </tr>
  </table>
</body>
`
}
 
// Email Text body (fallback for email clients that don't render HTML, e.g. feature phones)
function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${host}\n${url}\n\n`
}