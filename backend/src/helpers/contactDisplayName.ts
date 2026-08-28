export type ContactNameFields = {
  name?: string | null;
  contactName?: string | null;
  number?: string | null;
};

const isBlank = (value?: string | null): boolean =>
  !value || !String(value).trim();

export const isGenericContactName = (
  name?: string | null,
  number?: string | null
): boolean => {
  const trimmed = (name || "").trim();
  if (isBlank(trimmed)) {
    return true;
  }
  const lower = trimmed.toLowerCase();
  if (lower === "undefined" || lower === "null") {
    return true;
  }
  const nameDigits = trimmed.replace(/\D/g, "");
  const numberDigits = String(number || "").replace(/\D/g, "");
  if (nameDigits && numberDigits && nameDigits === numberDigits) {
    return true;
  }
  if (/^\d+$/.test(trimmed)) {
    return true;
  }
  return false;
};

export const pickWhatsAppProfileName = (
  incoming?: string | null,
  number?: string | null
): string => {
  const trimmed = (incoming || "").trim();
  if (isGenericContactName(trimmed, number)) {
    return "";
  }
  return trimmed;
};

export const extractContactFromTicketOrContact = (
  ticketOrContact?: { contact?: ContactNameFields } & ContactNameFields | null
): ContactNameFields | null => {
  if (!ticketOrContact) {
    return null;
  }
  if (ticketOrContact.contact) {
    return ticketOrContact.contact;
  }
  if (
    typeof ticketOrContact.name === "string" ||
    typeof ticketOrContact.contactName === "string" ||
    typeof ticketOrContact.number === "string"
  ) {
    return ticketOrContact;
  }
  return null;
};

export const resolveContactDisplayName = (
  ticketOrContact?: { contact?: ContactNameFields } & ContactNameFields | null
): string => {
  const contact = extractContactFromTicketOrContact(ticketOrContact);
  if (!contact) {
    return "";
  }
  if (!isGenericContactName(contact.name, contact.number)) {
    return String(contact.name).trim();
  }
  if (!isGenericContactName(contact.contactName, contact.number)) {
    return String(contact.contactName).trim();
  }
  return String(contact.name || contact.number || "").trim();
};
