const isBlank = (value) => !value || !String(value).trim();

export const isGenericContactName = (name, number) => {
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

export const resolveContactDisplayName = (ticketOrContact) => {
  if (!ticketOrContact) {
    return "";
  }
  const contact = ticketOrContact.contact || ticketOrContact;
  if (!isGenericContactName(contact.name, contact.number)) {
    return String(contact.name).trim();
  }
  if (!isGenericContactName(contact.contactName, contact.number)) {
    return String(contact.contactName).trim();
  }
  return String(contact.name || contact.number || "").trim();
};
