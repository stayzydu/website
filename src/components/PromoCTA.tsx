"use client";

import { useEffect, useState } from "react";
import PromoMarquee from "./PromoMarquee";
import PromoPopup from "./PromoPopup";
import PromoGiftButton from "./PromoGiftButton";

export default function PromoCTA() {
  const [open, setOpen] = useState(false);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!triggered) { setOpen(true); setTriggered(true); }
    }, 30000);
    return () => clearTimeout(t);
  }, [triggered]);

  const openPopup = () => { setOpen(true); setTriggered(true); };

  return (
    <>
      <PromoMarquee onOpenPopup={openPopup} />
      <PromoPopup open={open} onClose={() => setOpen(false)} />
      <PromoGiftButton onOpen={openPopup} />
    </>
  );
}
