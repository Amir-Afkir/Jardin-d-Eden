// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name: string;
      phone: string;
      city: string;
      service: string;
    };

    if (!body.name || !body.phone || !body.city || !body.service) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const emailHtml = `
      <h2>Nouvelle demande de devis</h2>
      <p><strong>Nom:</strong> ${body.name}</p>
      <p><strong>Téléphone:</strong> ${body.phone}</p>
      <p><strong>Ville:</strong> ${body.city}</p>
      <p><strong>Prestation:</strong> ${body.service}</p>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "site@jardin-eden.fr",
      to: process.env.EMAIL_TO ?? "lejardindeden.orleans@gmail.com",
      subject: "Demande de devis - Jardin d’Eden",
      html: emailHtml,
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "server_error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}