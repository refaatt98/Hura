// r2-upload: returns a short-lived presigned URL so the browser can upload an
// image or video straight to Cloudflare R2. The R2 keys stay on the server
// (stored in Supabase Vault, read with the service role).
// Deployed with verify_jwt = false (the site calls it with the publishable key).
import { createClient } from "npm:@supabase/supabase-js@2";
import { AwsClient } from "npm:aws4fetch@1.0.20";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_BYTES = 500 * 1024 * 1024; // 500 MB
const ALLOWED = /^(image\/(jpeg|png|webp|gif|avif|svg\+xml)|video\/(mp4|webm|quicktime|ogg))$/;

interface R2Config {
  r2_access_key_id: string;
  r2_secret_access_key: string;
  r2_endpoint: string;
  r2_bucket: string;
  r2_public_url: string;
}

let cached: R2Config | null = null;

async function config(): Promise<R2Config> {
  if (cached) return cached;
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data, error } = await admin.rpc("get_r2_config");
  if (error || !data) throw new Error("R2 config unavailable");
  cached = data as R2Config;
  return cached;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  let body: { name?: string; type?: string; size?: number };
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad request" }, 400);
  }

  const type = String(body.type ?? "");
  const size = Number(body.size ?? 0);
  if (!ALLOWED.test(type)) return json({ error: "نوع الملف غير مدعوم. صور أو فيديو بس." }, 400);
  if (!(size > 0) || size > MAX_BYTES) return json({ error: "الملف أكبر من 500MB." }, 400);

  const ext = (String(body.name ?? "").split(".").pop() || type.split("/")[1] || "bin")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 8) || "bin";
  const now = new Date();
  const key = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${ext}`;

  try {
    const c = await config();
    const aws = new AwsClient({
      accessKeyId: c.r2_access_key_id,
      secretAccessKey: c.r2_secret_access_key,
      service: "s3",
      region: "auto",
    });
    const target = new URL(`${c.r2_endpoint.replace(/\/$/, "")}/${c.r2_bucket}/${key}`);
    target.searchParams.set("X-Amz-Expires", "900");
    const signed = await aws.sign(new Request(target, { method: "PUT", headers: { "Content-Type": type } }), {
      aws: { signQuery: true },
    });
    return json({ uploadUrl: signed.url, publicUrl: `${c.r2_public_url.replace(/\/$/, "")}/${key}`, key });
  } catch (e) {
    console.error(e);
    return json({ error: "ما قدرنا نجهّز الرفع، جرّب مرة ثانية." }, 500);
  }
});
