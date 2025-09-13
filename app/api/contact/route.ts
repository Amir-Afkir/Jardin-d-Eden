// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

type Payload = {
  name: string;
  phone: string;
  city: string;
  service: string;
};

function isPayload(x: unknown): x is Payload {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.name === "string" &&
    typeof o.phone === "string" &&
    typeof o.city === "string" &&
    typeof o.service === "string"
  );
}

export async function POST(req: Request) {
  try {
    const bodyUnknown: unknown = await req.json();
    if (!isPayload(bodyUnknown)) {
      return NextResponse.json({ error: "missing_or_invalid_fields" }, { status: 400 });
    }
    const body = bodyUnknown;

    const apiKey = process.env.RESEND_API_KEY;
    const emailTo = process.env.EMAIL_TO;
    const emailFrom = process.env.EMAIL_FROM;

    if (!apiKey || !emailTo || !emailFrom) {
      return NextResponse.json({ error: "missing_email_env" }, { status: 500 });
    }

    // ✅ Instanciation *dans* le handler, quand la clé est dispo à l’exécution
    const resend = new Resend(apiKey);

    const emailHtml = `
      <h2>Nouvelle demande de devis</h2>
      <p><strong>Nom:</strong> ${body.name}</p>
      <p><strong>Téléphone:</strong> ${body.phone}</p>
      <p><strong>Ville:</strong> ${body.city}</p>
      <p><strong>Prestation:</strong> ${body.service}</p>
    `;

    const { error } = await resend.emails.send({
      from: emailFrom as string,
      to: emailTo as string,
      subject: "Demande de devis - Jardin d’Eden",
      html: emailHtml,
    });

    if (error) {
    const message = (error as any)?.message || (error as Error)?.toString?.() || "email provider error";
    console.error("[contact] Resend error:", error);
    return NextResponse.json(
        { error: "email_send_failed", detail: message },
        { status: 502 }
    );
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "server_error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}