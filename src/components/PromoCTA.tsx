"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import PromoMarquee from "./PromoMarquee";
import PromoPopup from "./PromoPopup";
import PromoGiftButton from "./PromoGiftButton";

export default function PromoCTA() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [triggered, setTriggered] = useState(false);

  const hidden = pathname?.startsWith("/admin");

  useEffect(() => {
    if (hidden) return;
    const t = setTimeout(() => {
      if (!triggered) { setOpen(true); setTriggered(true); }
    }, 30000);
    return () => clearTimeout(t);
  }, [triggered, hidden]);

  const openPopup = () => { setOpen(true); setTriggered(true); };

  // No promo marquee / popup / gift button on admin pages.
  if (hidden) return null;

  return (
    <>
      <PromoMarquee onOpenPopup={openPopup} />
      <PromoPopup open={open} onClose={() => setOpen(false)} />
      <PromoGiftButton onOpen={openPopup} />
    </>
  );
}
