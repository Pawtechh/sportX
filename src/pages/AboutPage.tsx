import React from "react";
import { Link } from "react-router-dom";
import { 
  Flame, 
  Award, 
  Recycle, 
  Globe, 
  ArrowLeft, 
  Users, 
  Mail, 
  Sparkles,
  Zap
} from "lucide-react";

export default function AboutPage() {
  const athletes = [
    { name: "Lucía Benítez", sport: "Maratón & Trail Running", achievement: "Récord Nacional 21K 2025" },
    { name: "Mateo Rossi", sport: "Básquetbol Profesional", achievement: "MVP Liga Nacional" },
    { name: "Camila Duarte", sport: "CrossFit Elite", achievement: "Top 10 Sudamérica Games" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 pt-28 pb-32">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-accent transition mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver a la tienda</span>
      </Link>

      <div className="mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-4">
          <Flame className="h-3.5 w-3.5" />
          <span>Ingeniería Deportiva de Élite</span>
        </div>
        <h1 className="text-4xl sm:text-7xl font-black italic uppercase tracking-tighter text-white">
          INNOVACIÓN & <span className="text-accent">RENDIMIENTO</span>
        </h1>
        <p className="mt-4 text-base sm:text-xl text-zinc-400 max-w-3xl leading-relaxed">
          En SportX fusionamos la ciencia del movimiento humano con el diseño vanguardista. Creamos y distribuimos calzado e indumentaria que rompen tus propios límites.
        </p>
      </div>

      {/* Filosofía & Laboratorio */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 sm:p-12 mb-16 relative overflow-hidden">
        <div className="max-w-3xl space-y-5">
          <h2 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tight text-white">
            FILOSOFÍA & SPORTX LAB
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
            Nacimos con una convicción clara: cada gramo, cada costura y cada respuesta de amortiguación impactan en tu desempeño final. En nuestro laboratorio biomecánico testeamos materiales bajo condiciones de estrés extremo, calibrando el retorno de energía de las espumas y la respirabilidad de los tejidos sintéticos de última generación.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-zinc-800">
            <div>
              <span className="text-3xl sm:text-4xl font-black italic text-accent font-mono block">+10.000</span>
              <span className="text-xs uppercase font-bold text-zinc-400">Horas de Testeo</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black italic text-accent font-mono block">100%</span>
              <span className="text-xs uppercase font-bold text-zinc-400">Autenticidad Certificada</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black italic text-accent font-mono block">24 Provincias</span>
              <span className="text-xs uppercase font-bold text-zinc-400">Alcance Federal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sostenibilidad Circular (#sostenibilidad) */}
      <div id="sostenibilidad" className="scroll-mt-28 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 sm:p-12 mb-16">
        <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Recycle className="h-4 w-4" />
          <span>Compromiso Ambiental</span>
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-tight text-white mb-4">
          SOSTENIBILIDAD CIRCULAR
        </h2>
        <p className="text-zinc-300 text-sm sm:text-base max-w-3xl leading-relaxed mb-6">
          El planeta es nuestro campo de juego y protegerlo es innegociable. Integramos procesos de reciclaje textil en nuestras líneas principales y todos nuestros envíos se entregan en cajas de cartón 100% reciclado y compostable con tintas al agua.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h4 className="text-base font-bold text-white mb-1">EcoKnit Yarn</h4>
            <p className="text-xs text-zinc-400">Capelladas tejidas con botellas PET recuperadas del océano.</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h4 className="text-base font-bold text-white mb-1">Cero Plásticos de Envío</h4>
            <p className="text-xs text-zinc-400">Bolsas interiores 100% biodegradables hechas con almidón vegetal.</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h4 className="text-base font-bold text-white mb-1">Energía Limpia</h4>
            <p className="text-xs text-zinc-400">Nuestros centros logísticos operan con paneles fotovoltaicos.</p>
          </div>
        </div>
      </div>

      {/* Atletas SportX Pro (#atletas) */}
      <div id="atletas" className="scroll-mt-28 mb-16">
        <div className="inline-flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider mb-2">
          <Users className="h-4 w-4" />
          <span>Equipo Oficial</span>
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-tight text-white mb-8">
          ATLETAS SPORTX PRO
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {athletes.map((ath, i) => (
            <div key={i} className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-accent font-black text-xl italic">
                {ath.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{ath.name}</h3>
                <span className="text-xs font-bold text-accent uppercase tracking-wider block">{ath.sport}</span>
              </div>
              <p className="text-xs text-zinc-400 pt-2 border-t border-zinc-800">{ath.achievement}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Canal Corporativo & Prensa (#prensa) */}
      <div id="prensa" className="scroll-mt-28 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <Mail className="h-4 w-4 text-accent" />
            <span>Prensa & Partnerships</span>
          </div>
          <h3 className="text-3xl font-black italic uppercase tracking-tight text-white">
            CANAL CORPORATIVO & PRENSA
          </h3>
          <p className="text-sm text-zinc-400">
            ¿Representas a un club, medio de comunicación, atleta o deseas una alianza B2B? Escríbenos a nuestro canal institucional.
          </p>
        </div>

        <a 
          href="mailto:prensa@sportx.com" 
          className="btn-primary flex-shrink-0"
        >
          prensa@sportx.com →
        </a>
      </div>
    </div>
  );
}
