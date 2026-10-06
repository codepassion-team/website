export const CONTACT_CHANNELS = ["phone", "email", "line"] as const;
export const DEMO_TOPICS = ["status", "documents", "request", "other"] as const;

export type ContactChannel = (typeof CONTACT_CHANNELS)[number];
export type DemoTopic = (typeof DEMO_TOPICS)[number];
export type DemoField = "name" | "company" | "channel" | "contact" | "topic";

export interface DemoRequest {
  name: string;
  company: string;
  channel: ContactChannel;
  contact: string;
  topic: DemoTopic | "";
}

export type DemoRequestInput = Record<DemoField, string>;

export type DemoValidation =
  | { ok: true; value: DemoRequest }
  | { ok: false; errors: Partial<Record<DemoField, string>> };

export type SubmitOutcome = "success" | "unconfigured" | "error";

const MAX_LENGTH = 120;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINE_ID = /^@?[A-Za-z0-9._-]{1,50}$/;

const CONTACT_ERRORS: Record<ContactChannel, string> = {
  phone: "กรุณากรอกเบอร์โทรที่ติดต่อได้",
  email: "กรุณากรอกอีเมลให้ถูกต้อง",
  line: "กรุณากรอก LINE ID ให้ถูกต้อง",
};

const isChannel = (value: string): value is ContactChannel =>
  (CONTACT_CHANNELS as readonly string[]).includes(value);

const isTopic = (value: string): value is DemoTopic =>
  (DEMO_TOPICS as readonly string[]).includes(value);

function normalizeContact(channel: ContactChannel, raw: string): string | null {
  if (channel === "phone") {
    const digits = raw.replace(/[\s-]/g, "");
    if (!/^\+?\d+$/.test(digits)) return null;
    const local = digits.replace(/^\+66/, "0");
    return /^0\d{8,9}$/.test(local) ? digits : null;
  }
  if (channel === "email") return EMAIL.test(raw) ? raw.toLowerCase() : null;
  return LINE_ID.test(raw) ? raw : null;
}

export function validateDemoRequest(input: DemoRequestInput): DemoValidation {
  const errors: Partial<Record<DemoField, string>> = {};
  const name = input.name.trim();
  const company = input.company.trim();
  const channel = input.channel.trim();
  const contact = input.contact.trim();
  const topic = input.topic.trim();

  if (!name) errors.name = "กรุณากรอกชื่อที่ให้เรียก";
  else if (name.length > MAX_LENGTH) errors.name = "ชื่อยาวเกินไป";

  if (!company) errors.company = "กรุณากรอกบริษัทหรือประเภทธุรกิจ";
  else if (company.length > MAX_LENGTH)
    errors.company = "ข้อมูลบริษัทยาวเกินไป";

  let normalizedContact: string | null = null;
  if (!isChannel(channel)) {
    errors.channel = "กรุณาเลือกช่องทางให้ติดต่อกลับ";
    if (!contact) errors.contact = "กรุณากรอกข้อมูลติดต่อ";
  } else {
    normalizedContact = normalizeContact(channel, contact);
    if (!normalizedContact) errors.contact = CONTACT_ERRORS[channel];
  }

  if (topic && !isTopic(topic)) errors.topic = "กรุณาเลือกเรื่องจากรายการ";

  if (Object.keys(errors).length || !isChannel(channel) || !normalizedContact)
    return { ok: false, errors };

  return {
    ok: true,
    value: {
      name,
      company,
      channel,
      contact: normalizedContact,
      topic: topic as DemoTopic | "",
    },
  };
}

export async function submitDemoRequest(
  endpoint: string,
  request: DemoRequest,
  fetchImpl: typeof fetch = fetch,
): Promise<SubmitOutcome> {
  if (!endpoint) return "unconfigured";
  try {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...request, source: "line-oa-customer-portal" }),
    });
    return response.ok ? "success" : "error";
  } catch {
    return "error";
  }
}
