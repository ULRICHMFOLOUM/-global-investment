"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Share2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  X,
  FileText,
  TrendingUp,
  MessageCircle,
  Sparkles,
  Award,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";

export interface InvoiceData {
  invoiceNumber: string;
  investmentId?: string;
  createdAt: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userCountry?: string;
  planId?: string;
  planName: string;
  planCategory?: string;
  amount: number;
  duration: number;
  totalReturn: number;
  dailyGain: number;
  dailyReturnRate?: number;
  status: string;
}

interface SubscriptionInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData | null;
}

export default function SubscriptionInvoiceModal({
  isOpen,
  onClose,
  invoice,
}: SubscriptionInvoiceModalProps) {
  const [downloading, setDownloading] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !invoice) return null;

  const formattedDate = new Date(invoice.createdAt).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Génération de l'image de la facture en ultra-haute résolution via Canvas HTML5 natif
  const handleDownloadInvoiceImage = () => {
    try {
      setDownloading(true);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Impossible d'initialiser le rendu graphique");

      // Dimensions HD (1200 x 1600 pour impression et partage haute qualité)
      canvas.width = 1200;
      canvas.height = 1600;

      // 1. Fond Cyber Premium
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 1600);
      bgGrad.addColorStop(0, "#080d1a");
      bgGrad.addColorStop(0.5, "#0d1527");
      bgGrad.addColorStop(1, "#060913");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 1600);

      // Cercles lumineux en arrière-plan
      const radial1 = ctx.createRadialGradient(200, 200, 10, 200, 200, 500);
      radial1.addColorStop(0, "rgba(16, 185, 129, 0.15)");
      radial1.addColorStop(1, "rgba(16, 185, 129, 0)");
      ctx.fillStyle = radial1;
      ctx.fillRect(0, 0, 1200, 1600);

      const radial2 = ctx.createRadialGradient(1000, 400, 10, 1000, 400, 600);
      radial2.addColorStop(0, "rgba(6, 182, 212, 0.18)");
      radial2.addColorStop(1, "rgba(6, 182, 212, 0)");
      ctx.fillStyle = radial2;
      ctx.fillRect(0, 0, 1200, 1600);

      // Bordure dorée / cyan élégante
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 6;
      ctx.strokeRect(40, 40, 1120, 1520);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 2;
      ctx.strokeRect(55, 55, 1090, 1490);

      // 2. En-tête : Logo & Marque
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("GLOBAL INVEST AFRICA", 80, 130);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 22px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("PLATEFORME PANAFRICAINE D'INVESTISSEMENT", 80, 170);

      // Badge Facture Officielle
      ctx.fillStyle = "#06b6d4";
      ctx.beginPath();
      ctx.roundRect(850, 95, 280, 55, 12);
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.font = "bold 20px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("FACTURE OFFICIELLE", 880, 130);

      // Séparateur
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 210);
      ctx.lineTo(1120, 210);
      ctx.stroke();

      // 3. Référence & Date
      ctx.fillStyle = "#94a3b8";
      ctx.font = "18px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("RÉFÉRENCE FACTURE :", 80, 260);
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 28px 'Courier New', monospace";
      ctx.fillText(invoice.invoiceNumber, 80, 300);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "18px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("DATE D'ÉMISSION :", 750, 260);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(formattedDate, 750, 300);

      // 4. Cadre Informations Investisseur
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.beginPath();
      ctx.roundRect(80, 350, 1040, 170, 20);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.stroke();

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 20px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("INFORMATIONS DU CLIENT SOUSCRIPTEUR", 110, 390);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "18px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("Nom complet :", 110, 435);
      ctx.fillText("Téléphone :", 110, 475);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(invoice.userName, 260, 435);
      ctx.fillText(invoice.userPhone, 260, 475);

      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Email :", 650, 435);
      ctx.fillText("Statut compte :", 650, 475);

      ctx.fillStyle = "#ffffff";
      ctx.fillText(invoice.userEmail || "Non renseigné", 780, 435);
      ctx.fillStyle = "#10b981";
      ctx.fillText("VÉRIFIÉ & ACTIF", 780, 475);

      // 5. Cadre Plan d'Investissement & Gains
      ctx.fillStyle = "rgba(16, 185, 129, 0.05)";
      ctx.beginPath();
      ctx.roundRect(80, 560, 1040, 440, 24);
      ctx.fill();
      ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
      ctx.stroke();

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 22px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("DÉTAILS DU CONTRAT D'INVESTISSEMENT BANCAIRE", 110, 610);

      // Nom du Plan
      ctx.fillStyle = "#94a3b8";
      ctx.font = "18px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("Plan souscrit :", 110, 670);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(invoice.planName, 110, 715);

      // Montant Souscrit
      ctx.fillStyle = "#94a3b8";
      ctx.font = "18px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("Montant souscrit :", 700, 670);
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 34px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(`${invoice.amount.toLocaleString()} XAF`, 700, 715);

      // Ligne séparatrice
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      ctx.moveTo(110, 760);
      ctx.lineTo(1090, 760);
      ctx.stroke();

      // Métriques clefs : Gain Journalier, Total, Durée
      ctx.fillStyle = "#94a3b8";
      ctx.font = "18px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("GAIN JOURNALIER (DIVIDENDE VIRTUEL) :", 110, 810);
      ctx.fillStyle = "#10b981";
      ctx.font = "bold 34px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(`+${invoice.dailyGain.toLocaleString()} XAF / jour`, 110, 855);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "18px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("MONTANT TOTAL À GAGNER :", 700, 810);
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 38px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(`${invoice.totalReturn.toLocaleString()} XAF`, 700, 855);

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "18px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(`Durée du contrat : ${invoice.duration} Jours  •  Dividende quotidien calculé sur 30 jours`, 110, 930);
      ctx.fillText(`Mode de paiement : Dépôt Mobile Money (Orange Money / MTN Mobile Money)`, 110, 965);

      // 6. Statut de validation
      ctx.fillStyle = "rgba(245, 158, 11, 0.1)";
      ctx.beginPath();
      ctx.roundRect(80, 1030, 1040, 120, 20);
      ctx.fill();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 26px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("STATUT : EN ATTENTE DE VALIDATION PAR L'ADMINISTRATEUR", 120, 1080);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "17px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("Vos gains quotidiens démarreront immédiatement dès confirmation de votre versement.", 120, 1115);

      // 7. Instructions pour le Groupe
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.beginPath();
      ctx.roundRect(80, 1180, 1040, 160, 20);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.stroke();

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 20px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("INSTRUCTIONS DE TRANSMISSION DE SOUSCRIPTION", 110, 1220);

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "18px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("1. Téléchargez cette facture officielle en couleur à l'aide du bouton ci-dessous.", 110, 1260);
      ctx.fillText("2. Partagez-la dans le groupe officiel WhatsApp / Telegram pour signaler votre souscription.", 110, 1295);
      ctx.fillText("3. L'administrateur validera votre paiement pour activer vos dividendes journaliers.", 110, 1330);

      // 8. Sceau officiel / Signature
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(950, 1440, 55, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#06b6d4";
      ctx.font = "bold 13px 'Segoe UI', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("GLOBAL INVEST", 950, 1430);
      ctx.fillText("AFRICA", 950, 1448);
      ctx.fillText("OFFICIAL SEAL", 950, 1464);
      ctx.textAlign = "left";

      ctx.fillStyle = "#64748b";
      ctx.font = "15px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("Document électronique certifié généré par Global Invest Africa.", 80, 1440);
      ctx.fillText("Tous droits réservés • Reproduction certifiée pour validation administrative.", 80, 1465);

      // Téléchargement
      const imageUri = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Facture_${invoice.invoiceNumber}_GlobalInvest.png`;
      link.href = imageUri;
      link.click();

      toast.success("Facture téléchargée en Haute Définition ! 🎉");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la génération de l'image");
    } finally {
      setDownloading(false);
    }
  };

  // Partage WhatsApp
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Bonjour l'équipe Global Invest Africa !\n\nJe viens de souscrire au plan *${invoice.planName}* pour un montant de *${invoice.amount.toLocaleString()} XAF*.\n\n📄 Référence Facture : *${invoice.invoiceNumber}*\n👤 Client : *${invoice.userName}* (${invoice.userPhone})\n💰 Gain attendu : *${invoice.totalReturn.toLocaleString()} XAF* (+${invoice.dailyGain.toLocaleString()} XAF/jour)\n\nMerci de valider mon paiement afin que mes gains journaliers débutent !`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  // Partage Telegram
  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      `Souscription Global Invest : Plan ${invoice.planName} (${invoice.amount.toLocaleString()} XAF). Facture ${invoice.invoiceNumber}. Merci de valider !`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent("https://globalinvest-africa2.netlify.app")}&text=${text}`, "_blank");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-[#0b1324] border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-7 w-full max-w-xl shadow-[0_0_50px_rgba(6,182,212,0.25)] relative overflow-hidden my-auto space-y-6"
        >
          {/* Lueur décorative */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Bouton Fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* En-tête de la facture */}
          <div className="flex items-start justify-between border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="text-xl font-black text-white tracking-tight">
                  GLOBAL<span className="text-cyan-400">INVEST</span>
                </h3>
                <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-cyan-500/30">
                  RÉCÉPISSÉ
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Facture N° : <span className="text-cyan-300 font-bold">{invoice.invoiceNumber}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">{formattedDate}</p>
            </div>
            <div className="hidden sm:block text-right">
              <div className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                Validation Requise
              </div>
            </div>
          </div>

          {/* Corps de la facture */}
          <div className="space-y-4">
            {/* Données Client */}
            <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/5 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold">Investisseur</p>
                <p className="text-white font-bold">{invoice.userName}</p>
                <p className="text-slate-400 font-mono text-[11px]">{invoice.userPhone}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-[10px] uppercase font-bold">Statut Inscription</p>
                <p className="text-emerald-400 font-bold flex items-center justify-end gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Compte Validé
                </p>
                <p className="text-slate-400 text-[11px]">{invoice.userCountry || "Cameroun"}</p>
              </div>
            </div>

            {/* Carte du Plan souscrit */}
            <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-emerald-950/30 p-5 rounded-2xl border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                    {invoice.planCategory || "BANQUE"}
                  </span>
                  <h4 className="text-lg font-black text-white mt-1">{invoice.planName}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Montant Souscrit</span>
                  <p className="text-xl font-black text-white tracking-tight">
                    {invoice.amount.toLocaleString()} <span className="text-cyan-400 text-xs">XAF</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                    Gain Quotidien (30j)
                  </span>
                  <span className="text-emerald-400 font-black text-base">
                    +{invoice.dailyGain.toLocaleString()} XAF
                  </span>
                  <span className="text-[10px] text-slate-500 block">versé chaque jour</span>
                </div>
                <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-right">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                    Total Garanti
                  </span>
                  <span className="text-yellow-400 font-black text-base">
                    {invoice.totalReturn.toLocaleString()} XAF
                  </span>
                  <span className="text-[10px] text-slate-500 block">durée fixe 30 jours</span>
                </div>
              </div>
            </div>

            {/* Statut d'attente */}
            <div className="bg-amber-500/15 border border-amber-500/30 p-3.5 rounded-2xl flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="text-amber-200 font-bold">En attente de validation administrateur</p>
                <p className="text-amber-300/80 text-[11px] mt-0.5">
                  Téléchargez cette facture et partagez-la dans le groupe officiel pour que l'admin confirme votre paiement et active vos gains journaliers.
                </p>
              </div>
            </div>
          </div>

          {/* Boutons d'Action */}
          <div className="space-y-2.5 pt-2">
            {/* Bouton Téléchargement HD */}
            <button
              onClick={handleDownloadInvoiceImage}
              disabled={downloading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-black font-black text-xs uppercase tracking-widest shadow-xl shadow-cyan-500/20 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {downloading ? "Génération de l'image..." : "Télécharger la Facture (Image HD)"}
            </button>

            <div className="grid grid-cols-2 gap-2">
              {/* Partager WhatsApp */}
              <button
                onClick={handleShareWhatsApp}
                className="py-3 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                Partager WhatsApp
              </button>

              {/* Partager Telegram */}
              <button
                onClick={handleShareTelegram}
                className="py-3 px-4 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                Partager Telegram
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
