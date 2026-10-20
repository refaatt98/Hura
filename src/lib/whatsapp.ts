import type { CartItem } from "../types";
import { money } from "./format";

/** wa.me link that opens WhatsApp with a ready-written message. */
export function whatsappLink(phone: string, text: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

interface OrderMessage {
  header: string;
  footer: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  items: CartItem[];
  total: number;
}

/** The order as a tidy WhatsApp message. */
export function orderMessage(o: OrderMessage): string {
  const lines = [
    `🧾 *${o.header}*`,
    `رقم الطلب: *${o.code}*`,
    "",
    `👤 الاسم: ${o.name}`,
    `📞 الرقم: ${o.phone}`,
    `📍 العنوان: ${o.address}`,
    "",
    "*الملفات المطلوبة:*",
    ...o.items.map((it, i) => `${i + 1}. ${it.title}${it.code ? ` (${it.code})` : ""} — ${money(it.price)}`),
    "",
    `💰 *المجموع: ${money(o.total)}*`,
  ];
  if (o.notes?.trim()) lines.push("", `📝 ملاحظات: ${o.notes.trim()}`);
  if (o.footer) lines.push("", o.footer);
  return lines.join("\n");
}
