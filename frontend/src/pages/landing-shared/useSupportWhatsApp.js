import { useEffect, useState } from "react";
import {
  fetchSupportWhatsAppNumber,
  getSupportWhatsAppUrl,
} from "./supportWhatsApp";

export default function useSupportWhatsApp() {
  const [number, setNumber] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchSupportWhatsAppNumber()
      .then((digits) => {
        if (!cancelled) {
          setNumber(digits);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    number,
    ready,
    url: getSupportWhatsAppUrl(number),
  };
}
