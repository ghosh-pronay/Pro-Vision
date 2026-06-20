export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .trim()
    .normalize("NFC");
}

export function validateEmail(email: string): boolean {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
}

export function validatePhone(phone: string): boolean {
  const pattern = /^(?:\+8801[3-9]\d{8}|01[3-9]\d{8})$/;
  return pattern.test(phone.replace(/[\s-]/g, ""));
}

export function validateBangladeshiNID(nid: string): boolean {
  const cleaned = nid.replace(/[\s-]/g, "");
  return /^\d{10,17}$/.test(cleaned);
}
