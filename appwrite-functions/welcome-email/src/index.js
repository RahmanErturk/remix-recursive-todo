import nodemailer from "nodemailer";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function extractUserEmail(payload) {
  // possible payload shapes
  return (
    payload?.email ||
    payload?.user?.email ||
    payload?.payload?.email ||
    payload?.data?.email ||
    null
  );
}

export default async ({ req, res, log, error }) => {
  try {
    log("welcome-email triggered");

    // In Appwrite docs recommended to use req.bodyJson for JSON payloads
    const payload = req.bodyJson ?? {};

    const toEmail = extractUserEmail(payload);
    if (!toEmail) {
      log(`No email found in payload. keys=${Object.keys(payload).join(",")}`);
      return res.json({ ok: true, skipped: true });
    }

    const host = requireEnv("SMTP_HOST");
    const port = Number(requireEnv("SMTP_PORT"));
    const user = requireEnv("SMTP_USER");
    const pass = requireEnv("SMTP_PASS");
    const from = requireEnv("SMTP_FROM");

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to: toEmail,
      subject: "Welcome to Recursive Todo",
      text: `Welcome!\n\nYour account is ready. You can now manage your todos.\n\n— Recursive Todo`,
    });

    log(`Welcome email sent to ${toEmail}`);
    return res.json({ ok: true });
  } catch (e) {
    error(String(e));
    return res.json({ ok: false, error: String(e) }, 500);
  }
};
