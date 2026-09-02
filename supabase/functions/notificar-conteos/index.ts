// supabase/functions/notificar-conteos/index.ts
// Se dispara vía Database Webhook cada vez que se inserta una fila en "conteos".
// Si ya están los 3 tipos (fisico, sistema, verduleria) del día de hoy,
// manda un mail al admin — una sola vez por día.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL")!;

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const nuevaFila = payload.record; // la fila que se acaba de insertar en "conteos"

    if (!nuevaFila?.fecha) {
      return new Response("Sin fecha en el payload", { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Rango del día de hoy (según la fecha del registro recién insertado)
    const fecha = new Date(nuevaFila.fecha);
    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);
    const fechaSolo = inicioDia.toISOString().slice(0, 10); // YYYY-MM-DD

    // Traer todos los conteos de hoy
    const { data: conteosHoy, error: errConteos } = await supabase
      .from("conteos")
      .select("tipo")
      .gte("fecha", inicioDia.toISOString())
      .lte("fecha", finDia.toISOString());

    if (errConteos) throw errConteos;

    const tiposHoy = new Set(conteosHoy.map((c) => c.tipo));
    const completo =
      tiposHoy.has("fisico") && tiposHoy.has("sistema") && tiposHoy.has("verduleria");

    if (!completo) {
      return new Response("Todavía no están los 3 conteos", { status: 200 });
    }

    // Marcar el día como notificado (si ya existe, esto falla y cortamos acá:
    // así garantizamos que el mail se mande una sola vez por día)
    const { error: errInsert } = await supabase
      .from("notificaciones_admin")
      .insert({ fecha: fechaSolo });

    if (errInsert) {
      // Código 23505 = violación de unique constraint → ya se había notificado hoy
      if (errInsert.code === "23505") {
        return new Response("Ya se había notificado hoy", { status: 200 });
      }
      throw errInsert;
    }

    // Enviar el mail vía Resend
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Jualmal Stock <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `✅ Stock del día completo — ${fechaSolo}`,
        html: `
          <p>Se completaron los 3 conteos de stock del día <b>${fechaSolo}</b>:</p>
          <ul>
            <li>Físico ✓</li>
            <li>Sistema ✓</li>
            <li>Verdulería ✓</li>
          </ul>
          <p>Ya podés revisar las diferencias en la página de Admin de la app.</p>
        `,
      }),
    });

    if (!resp.ok) {
      const texto = await resp.text();
      throw new Error(`Error al enviar mail: ${texto}`);
    }

    return new Response("Mail enviado", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(String(err), { status: 500 });
  }
});