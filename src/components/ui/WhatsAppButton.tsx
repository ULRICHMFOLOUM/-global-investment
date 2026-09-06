"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  // Numéro de support WhatsApp configuré (Cameroun +237 par défaut)
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "237676607225";
  const defaultMessage = encodeURIComponent(
    "Bonjour GlobalInvest Africa, j'ai besoin d'une assistance concernant mon compte."
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;

  if (isClosed) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex items-end gap-3 pointer-events-auto select-none">
      {/* Tooltip / Message Pop-up */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="hidden sm:flex flex-col bg-slate-900/95 text-white border border-emerald-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-xl max-w-[220px]"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                Support En Ligne 24/7
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-200 leading-tight">
              Une question ou un souci ? Discutez directement avec un conseiller sur WhatsApp.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main WhatsApp Floating Button */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-[0_8px_25px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_35px_rgba(37,211,102,0.6)] transition-all duration-300"
        aria-label="Contacter le support WhatsApp"
      >
        {/* Pulsing ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" />

        {/* Official WhatsApp SVG Icon */}
        <svg
          className="w-7 h-7 fill-current relative z-10 drop-shadow-md"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.031 0C5.396 0 .029 5.367.029 12.002c0 2.12.552 4.188 1.602 6.009L.001 24l6.168-1.619a11.96 11.96 0 0 0 5.862 1.528h.005c6.633 0 12-5.367 12-12.004C24.036 5.367 18.666 0 12.031 0zm.005 21.905h-.004a9.92 9.92 0 0 1-5.064-1.39l-.363-.216-3.762.986 1.004-3.667-.237-.377a9.932 9.932 0 0 1-1.524-5.239c0-5.485 4.464-9.949 9.953-9.949 2.658 0 5.157 1.035 7.034 2.915a9.88 9.88 0 0 1 2.91 7.034c0 5.487-4.465 9.952-9.947 9.952zm5.454-7.447c-.299-.149-1.77-.874-2.044-.974-.274-.099-.473-.149-.672.15-.199.299-.771.973-.946 1.173-.174.199-.349.224-.648.075-.299-.15-1.263-.465-2.406-1.485-.89-.794-1.49-1.776-1.665-2.075-.174-.299-.019-.461.13-.61.135-.134.299-.348.448-.523.15-.174.199-.299.299-.498.1-.199.05-.373-.025-.523-.075-.149-.673-1.623-.922-2.222-.242-.583-.488-.504-.672-.513l-.573-.01c-.199 0-.523.075-.796.373-.274.299-1.045 1.022-1.045 2.493 0 1.471 1.071 2.891 1.22 3.09 1.15 1.536 2.628 2.873 4.296 3.666 2.673 1.272 2.673.848 3.17.798.498-.05 1.77-.723 2.02-1.42.249-.698.249-1.296.174-1.42-.075-.124-.274-.199-.573-.348z" />
        </svg>

        {/* Online Indicator Badge */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-full flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-white rounded-full" />
        </span>
      </motion.a>
    </div>
  );
}
