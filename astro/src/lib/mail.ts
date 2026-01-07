import { Resend } from 'resend'

export async function sendVerificationEmail(env: App.Locals['runtime']['env'], email: string, code: string) {
  const resend = new Resend(env.RESEND_API_KEY)
  const from = env.EMAIL_FROM || 'onboarding@resend.dev'
  const subject = '验证码'
  const html = `<p>你的验证码是 <strong>${code}</strong>，10 分钟内有效。</p>`

  await resend.emails.send({
    from,
    to: email,
    subject,
    html,
  })
}
