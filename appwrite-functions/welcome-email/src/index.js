export default async ({ req, res, log, error }) => {
  try {
    log("welcome-email triggered");
    log(`method=${req.method}`);
    log(`body=${req.body}`);

    return res.json({ ok: true });
  } catch (e) {
    error(String(e));
    return res.json({ ok: false }, 500);
  }
};
