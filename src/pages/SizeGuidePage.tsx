import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Ruler, ArrowLeft, Footprints, Shirt, CheckCircle2 } from "lucide-react";

export default function SizeGuidePage() {
  const [tab, setTab] = useState<"footwear" | "tops" | "bottoms">("footwear");

  const footwearSizes = [
    { ar: "38", cm: "24.5 cm", us: "6.5 US", eur: "39 EUR", uk: "6.0 UK" },
    { ar: "39", cm: "25.0 cm", us: "7.0 US", eur: "40 EUR", uk: "6.5 UK" },
    { ar: "40", cm: "25.5 cm", us: "8.0 US", eur: "41 EUR", uk: "7.5 UK" },
    { ar: "41", cm: "26.5 cm", us: "9.0 US", eur: "42 EUR", uk: "8.5 UK" },
    { ar: "42", cm: "27.0 cm", us: "9.5 US", eur: "43 EUR", uk: "9.0 UK" },
    { ar: "43", cm: "28.0 cm", us: "10.5 US", eur: "44 EUR", uk: "10.0 UK" },
    { ar: "44", cm: "28.5 cm", us: "11.0 US", eur: "45 EUR", uk: "10.5 UK" },
    { ar: "45", cm: "29.5 cm", us: "12.0 US", eur: "46 EUR", uk: "11.5 UK" },
  ];

  const topsSizes = [
    { size: "S", chest: "88 - 94 cm", waist: "76 - 82 cm", hip: "88 - 94 cm" },
    { size: "M", chest: "95 - 102 cm", waist: "83 - 90 cm", hip: "95 - 102 cm" },
    { size: "L", chest: "103 - 110 cm", waist: "91 - 98 cm", hip: "103 - 110 cm" },
    { size: "XL", chest: "111 - 118 cm", waist: "99 - 106 cm", hip: "111 - 118 cm" },
    { size: "XXL", chest: "119 - 128 cm", waist: "107 - 116 cm", hip: "119 - 128 cm" },
  ];

  const bottomsSizes = [
    { size: "S (28-30)", waist: "74 - 80 cm", hip: "88 - 94 cm", length: "98 cm" },
    { size: "M (32-34)", waist: "81 - 88 cm", hip: "95 - 102 cm", length: "100 cm" },
    { size: "L (36)", waist: "89 - 96 cm", hip: "103 - 110 cm", length: "102 cm" },
    { size: "XL (38)", waist: "97 - 104 cm", hip: "111 - 118 cm", length: "104 cm" },
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

      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-4">
          <Ruler className="h-3.5 w-3.5" />
          <span>Equivalencias & Medidas Oficiales</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-white">
          GUÍA DE <span className="text-accent">TALLES</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-zinc-400 max-w-2xl">
          Encuentra tu calce exacto para un rendimiento superior. Todas nuestras marcas se ajustan a estándares anatómicos de alta competencia.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => setTab("footwear")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition ${
            tab === "footwear"
              ? "bg-accent text-black"
              : "border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700"
          }`}
        >
          <Footprints className="h-4 w-4" />
          <span>Calzado (Zapatillas)</span>
        </button>

        <button
          onClick={() => setTab("tops")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition ${
            tab === "tops"
              ? "bg-accent text-black"
              : "border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700"
          }`}
        >
          <Shirt className="h-4 w-4" />
          <span>Remeras & Buzos</span>
        </button>

        <button
          onClick={() => setTab("bottoms")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition ${
            tab === "bottoms"
              ? "bg-accent text-black"
              : "border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700"
          }`}
        >
          <Ruler className="h-4 w-4" />
          <span>Pantalones & Shorts</span>
        </button>
      </div>

      {/* Tablas */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 overflow-x-auto mb-16 no-scrollbar">
        {tab === "footwear" && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-xs font-black uppercase tracking-widest text-zinc-400">
                <th className="py-4 px-4 text-white">Talle AR</th>
                <th className="py-4 px-4 text-accent">Largo (CM)</th>
                <th className="py-4 px-4">US (Hombre/Unisex)</th>
                <th className="py-4 px-4">EUR</th>
                <th className="py-4 px-4">UK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-sm">
              {footwearSizes.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-800/30 transition">
                  <td className="py-4 px-4 font-black text-white">{row.ar} AR</td>
                  <td className="py-4 px-4 font-mono font-bold text-accent">{row.cm}</td>
                  <td className="py-4 px-4 text-zinc-300">{row.us}</td>
                  <td className="py-4 px-4 text-zinc-400">{row.eur}</td>
                  <td className="py-4 px-4 text-zinc-400">{row.uk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "tops" && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-xs font-black uppercase tracking-widest text-zinc-400">
                <th className="py-4 px-4 text-white">Talle</th>
                <th className="py-4 px-4 text-accent">Contorno de Pecho</th>
                <th className="py-4 px-4">Cintura</th>
                <th className="py-4 px-4">Cadera</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-sm">
              {topsSizes.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-800/30 transition">
                  <td className="py-4 px-4 font-black text-white">{row.size}</td>
                  <td className="py-4 px-4 font-mono font-bold text-accent">{row.chest}</td>
                  <td className="py-4 px-4 text-zinc-300">{row.waist}</td>
                  <td className="py-4 px-4 text-zinc-400">{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "bottoms" && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-xs font-black uppercase tracking-widest text-zinc-400">
                <th className="py-4 px-4 text-white">Talle</th>
                <th className="py-4 px-4 text-accent">Cintura</th>
                <th className="py-4 px-4">Cadera</th>
                <th className="py-4 px-4">Largo de Pierna</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-sm">
              {bottomsSizes.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-800/30 transition">
                  <td className="py-4 px-4 font-black text-white">{row.size}</td>
                  <td className="py-4 px-4 font-mono font-bold text-accent">{row.waist}</td>
                  <td className="py-4 px-4 text-zinc-300">{row.hip}</td>
                  <td className="py-4 px-4 text-zinc-400">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Guía para medirte */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-10">
        <h3 className="text-2xl font-black italic uppercase tracking-tight text-white mb-6">
          ¿CÓMO MEDIRTE EN CASA?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-zinc-300 leading-relaxed">
          <div className="space-y-3">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <Footprints className="h-4 w-4 text-accent" /> Para Calzado:
            </h4>
            <p>1. Coloca una hoja de papel en el suelo pegada a la pared.</p>
            <p>2. Apoya tu talón contra la pared y marca con lápiz la punta de tu dedo más largo.</p>
            <p>3. Mide con una regla la distancia en centímetros y compárala con nuestra columna de <strong>Largo (CM)</strong>.</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <Shirt className="h-4 w-4 text-accent" /> Para Indumentaria:
            </h4>
            <p>1. <strong>Pecho:</strong> Mide el contorno en la parte más ancha con los brazos relajados.</p>
            <p>2. <strong>Cintura:</strong> Pasa la cinta métrica por la parte más estrecha del abdomen.</p>
            <p>3. Si tus medidas se encuentran entre dos talles, te sugerimos optar por el mayor para mayor holgura de movimiento.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
