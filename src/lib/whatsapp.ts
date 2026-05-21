export const WHATSAPP_NUMBER = "5521966879813"; // (21) 9 9999-9999
export const PHONE_DISPLAY = "5521966879813";

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}