export type LogisticsZone =
  | "AMBA"
  | "Centro"
  | "Litoral"
  | "Cuyo"
  | "NOA"
  | "NEA"
  | "Patagonia Norte"
  | "Patagonia Sur";

export type ShippingMethodId = "standard" | "express" | "pickup";

export interface ProvinceData {
  id: string;
  name: string;
  defaultPostalCode: string;
  zone: LogisticsZone;
  distanceKm: number;
  baseCost: number;
  costPerKg: number;
  etaStandard: string;
  etaExpress: string;
  carrier: string;
}

export const ARGENTINE_PROVINCES: ProvinceData[] = [
  {
    id: "caba",
    name: "Ciudad Autónoma de Buenos Aires (CABA)",
    defaultPostalCode: "1425",
    zone: "AMBA",
    distanceKm: 12,
    baseCost: 5.5,
    costPerKg: 1.2,
    etaStandard: "24 a 48 hs hábiles",
    etaExpress: "Mismo día (Moto Flash 24h)",
    carrier: "SportX Flota Propia",
  },
  {
    id: "buenos-aires",
    name: "Buenos Aires",
    defaultPostalCode: "1900",
    zone: "AMBA",
    distanceKm: 65,
    baseCost: 7.0,
    costPerKg: 1.5,
    etaStandard: "24 a 72 hs hábiles",
    etaExpress: "24 hs hábiles",
    carrier: "Andreani Urbano",
  },
  {
    id: "santa-fe",
    name: "Santa Fe",
    defaultPostalCode: "3000",
    zone: "Centro",
    distanceKm: 475,
    baseCost: 9.5,
    costPerKg: 2.0,
    etaStandard: "2 a 4 días hábiles",
    etaExpress: "24 a 48 hs hábiles",
    carrier: "Andreani Prioritario",
  },
  {
    id: "entre-rios",
    name: "Entre Ríos",
    defaultPostalCode: "3100",
    zone: "Litoral",
    distanceKm: 480,
    baseCost: 9.8,
    costPerKg: 2.1,
    etaStandard: "2 a 4 días hábiles",
    etaExpress: "48 hs hábiles",
    carrier: "Andreani / Correo Argentino",
  },
  {
    id: "cordoba",
    name: "Córdoba",
    defaultPostalCode: "5000",
    zone: "Centro",
    distanceKm: 700,
    baseCost: 10.5,
    costPerKg: 2.2,
    etaStandard: "2 a 4 días hábiles",
    etaExpress: "24 a 48 hs hábiles",
    carrier: "Andreani Prioritario",
  },
  {
    id: "la-pampa",
    name: "La Pampa",
    defaultPostalCode: "6300",
    zone: "Centro",
    distanceKm: 610,
    baseCost: 11.0,
    costPerKg: 2.3,
    etaStandard: "3 a 5 días hábiles",
    etaExpress: "48 hs hábiles",
    carrier: "Correo Argentino Expreso",
  },
  {
    id: "san-luis",
    name: "San Luis",
    defaultPostalCode: "5700",
    zone: "Cuyo",
    distanceKm: 790,
    baseCost: 12.0,
    costPerKg: 2.5,
    etaStandard: "3 a 5 días hábiles",
    etaExpress: "48 hs hábiles",
    carrier: "Andreani Cuyo",
  },
  {
    id: "corrientes",
    name: "Corrientes",
    defaultPostalCode: "3400",
    zone: "Litoral",
    distanceKm: 910,
    baseCost: 12.5,
    costPerKg: 2.6,
    etaStandard: "3 a 5 días hábiles",
    etaExpress: "48 a 72 hs hábiles",
    carrier: "Andreani / Correo Argentino",
  },
  {
    id: "mendoza",
    name: "Mendoza",
    defaultPostalCode: "5500",
    zone: "Cuyo",
    distanceKm: 1050,
    baseCost: 13.0,
    costPerKg: 2.7,
    etaStandard: "3 a 5 días hábiles",
    etaExpress: "48 hs Aéreo",
    carrier: "Andreani Cuyo",
  },
  {
    id: "chaco",
    name: "Chaco",
    defaultPostalCode: "3500",
    zone: "NEA",
    distanceKm: 930,
    baseCost: 13.2,
    costPerKg: 2.7,
    etaStandard: "4 a 6 días hábiles",
    etaExpress: "48 a 72 hs hábiles",
    carrier: "Correo Argentino / Urbano",
  },
  {
    id: "santiago-del-estero",
    name: "Santiago del Estero",
    defaultPostalCode: "4200",
    zone: "NOA",
    distanceKm: 1040,
    baseCost: 13.5,
    costPerKg: 2.8,
    etaStandard: "4 a 6 días hábiles",
    etaExpress: "48 a 72 hs hábiles",
    carrier: "Andreani Norte",
  },
  {
    id: "misiones",
    name: "Misiones",
    defaultPostalCode: "3300",
    zone: "NEA",
    distanceKm: 1010,
    baseCost: 13.8,
    costPerKg: 2.8,
    etaStandard: "4 a 6 días hábiles",
    etaExpress: "48 a 72 hs hábiles",
    carrier: "Andreani / Crucero Express",
  },
  {
    id: "san-juan",
    name: "San Juan",
    defaultPostalCode: "5400",
    zone: "Cuyo",
    distanceKm: 1110,
    baseCost: 13.5,
    costPerKg: 2.8,
    etaStandard: "4 a 6 días hábiles",
    etaExpress: "48 a 72 hs hábiles",
    carrier: "Andreani Cuyo",
  },
  {
    id: "la-rioja",
    name: "La Rioja",
    defaultPostalCode: "5300",
    zone: "NOA",
    distanceKm: 1150,
    baseCost: 14.0,
    costPerKg: 2.9,
    etaStandard: "4 a 6 días hábiles",
    etaExpress: "48 a 72 hs hábiles",
    carrier: "Correo Argentino Expreso",
  },
  {
    id: "catamarca",
    name: "Catamarca",
    defaultPostalCode: "4700",
    zone: "NOA",
    distanceKm: 1130,
    baseCost: 14.0,
    costPerKg: 2.9,
    etaStandard: "4 a 6 días hábiles",
    etaExpress: "48 a 72 hs hábiles",
    carrier: "Correo Argentino Expreso",
  },
  {
    id: "formosa",
    name: "Formosa",
    defaultPostalCode: "3600",
    zone: "NEA",
    distanceKm: 1120,
    baseCost: 14.2,
    costPerKg: 3.0,
    etaStandard: "4 a 6 días hábiles",
    etaExpress: "72 hs hábiles",
    carrier: "Correo Argentino / Andreani",
  },
  {
    id: "tucuman",
    name: "Tucumán",
    defaultPostalCode: "4000",
    zone: "NOA",
    distanceKm: 1200,
    baseCost: 14.2,
    costPerKg: 2.9,
    etaStandard: "3 a 5 días hábiles",
    etaExpress: "48 hs Aéreo",
    carrier: "Andreani Norte",
  },
  {
    id: "neuquen",
    name: "Neuquén",
    defaultPostalCode: "8300",
    zone: "Patagonia Norte",
    distanceKm: 1140,
    baseCost: 15.5,
    costPerKg: 3.2,
    etaStandard: "4 a 6 días hábiles",
    etaExpress: "48 hs Aéreo",
    carrier: "Andreani Patagonia",
  },
  {
    id: "rio-negro",
    name: "Río Negro",
    defaultPostalCode: "8500",
    zone: "Patagonia Norte",
    distanceKm: 1080,
    baseCost: 15.5,
    costPerKg: 3.2,
    etaStandard: "4 a 6 días hábiles",
    etaExpress: "48 a 72 hs Aéreo",
    carrier: "Andreani Patagonia",
  },
  {
    id: "salta",
    name: "Salta",
    defaultPostalCode: "4400",
    zone: "NOA",
    distanceKm: 1450,
    baseCost: 15.0,
    costPerKg: 3.1,
    etaStandard: "4 a 6 días hábiles",
    etaExpress: "48 a 72 hs Aéreo",
    carrier: "Andreani Norte",
  },
  {
    id: "jujuy",
    name: "Jujuy",
    defaultPostalCode: "4600",
    zone: "NOA",
    distanceKm: 1520,
    baseCost: 15.5,
    costPerKg: 3.2,
    etaStandard: "4 a 6 días hábiles",
    etaExpress: "48 a 72 hs Aéreo",
    carrier: "Andreani Norte",
  },
  {
    id: "chubut",
    name: "Chubut",
    defaultPostalCode: "9100",
    zone: "Patagonia Sur",
    distanceKm: 1450,
    baseCost: 18.0,
    costPerKg: 3.8,
    etaStandard: "5 a 7 días hábiles",
    etaExpress: "72 hs Aéreo",
    carrier: "Aerolíneas Cargo + Correo",
  },
  {
    id: "santa-cruz",
    name: "Santa Cruz",
    defaultPostalCode: "9400",
    zone: "Patagonia Sur",
    distanceKm: 2550,
    baseCost: 21.0,
    costPerKg: 4.2,
    etaStandard: "6 a 8 días hábiles",
    etaExpress: "72 hs Aéreo",
    carrier: "Aerolíneas Cargo + Andreani",
  },
  {
    id: "tierra-del-fuego",
    name: "Tierra del Fuego",
    defaultPostalCode: "9410",
    zone: "Patagonia Sur",
    distanceKm: 3080,
    baseCost: 24.5,
    costPerKg: 4.8,
    etaStandard: "6 a 9 días hábiles (Aéreo/Insular)",
    etaExpress: "72 a 96 hs Aéreo Prioritario",
    carrier: "Aerolíneas Cargo Insular",
  },
];

export const PICKUP_STORES = [
  {
    id: "palermo",
    name: "SportX Flagship Palermo Soho",
    address: "Honduras 4900, CABA (CP 1414)",
    hours: "Lun a Sáb 10:00 a 20:00 hs",
    eta: "Listo para retirar en 2 horas",
  },
  {
    id: "unicenter",
    name: "SportX Unicenter Shopping",
    address: "Paraná 3745, Nivel 2, Martínez (CP 1640)",
    hours: "Lun a Dom 10:00 a 22:00 hs",
    eta: "Listo para retirar en 3 horas",
  },
  {
    id: "altopalermo",
    name: "SportX Alto Palermo Mall",
    address: "Av. Santa Fe 3253, Nivel 1, CABA (CP 1425)",
    hours: "Lun a Dom 10:00 a 22:00 hs",
    eta: "Listo para retirar en 2 horas",
  },
];

/** Peso volumétrico estimado en kg según categoría de producto */
export function getCategoryWeightKg(category: string): number {
  const c = category.toLowerCase();
  if (["running", "basketball", "training", "lifestyle", "zapatillas"].includes(c)) {
    return 0.95; // Calzado + caja rígida
  }
  if (c === "pelotas") return 0.65; // Balón inflado / caja volumétrica
  if (c === "accesorios") return 0.4;
  if (c === "ropa") return 0.35;
  return 0.6;
}

export interface ShippingQuote {
  province: ProvinceData;
  method: ShippingMethodId;
  zone: LogisticsZone;
  distanceKm: number;
  carrier: string;
  eta: string;
  totalWeightKg: number;
  totalItems: number;
  baseCost: number;
  weightCost: number;
  postalAdjustment: number;
  expressSurcharge: number;
  rawCost: number;
  discountAmount: number;
  finalCost: number;
  isFree: boolean;
  freeThreshold: number;
  formulaSummary: string;
}

export function calculateShippingQuote(params: {
  provinceName?: string;
  postalCode?: string;
  method?: ShippingMethodId;
  subtotal: number;
  items: { category: string; quantity: number }[];
}): ShippingQuote {
  const freeThreshold = 200;
  const method: ShippingMethodId = params.method || "standard";

  const province =
    ARGENTINE_PROVINCES.find(
      (p) => p.name === params.provinceName || p.id === params.provinceName
    ) || ARGENTINE_PROVINCES[0]; // Default CABA para estimación inicial

  const totalItems = params.items.reduce((acc, it) => acc + it.quantity, 0);
  const totalWeightKg = Number(
    Math.max(
      0.35,
      params.items.reduce((acc, it) => acc + getCategoryWeightKg(it.category) * it.quantity, 0)
    ).toFixed(2)
  );

  // Si es Retiro en Sucursal (Pick-Up), el costo logístico es $0
  if (method === "pickup") {
    return {
      province,
      method,
      zone: "AMBA",
      distanceKm: 0,
      carrier: "Retiro Presencial en Sucursal SportX",
      eta: "Listo en 2 horas hábiles",
      totalWeightKg,
      totalItems,
      baseCost: 0,
      weightCost: 0,
      postalAdjustment: 0,
      expressSurcharge: 0,
      rawCost: 0,
      discountAmount: 0,
      finalCost: 0,
      isFree: true,
      freeThreshold,
      formulaSummary: "Pick-Up en Flagship Store Oficial ($0 sin cargo)",
    };
  }

  const baseCost = province.baseCost;
  const weightCost = Number((totalWeightKg * province.costPerKg).toFixed(2));

  // Si el código postal difiere del código de capital provincial, aplica recargo de distribución interior
  const cleanCp = (params.postalCode || "").trim();
  const postalAdjustment =
    cleanCp && cleanCp !== province.defaultPostalCode && cleanCp.length >= 4 ? 1.5 : 0;

  const subtotalBeforeMethod = baseCost + weightCost + postalAdjustment;
  const expressSurcharge =
    method === "express" ? Number((subtotalBeforeMethod * 0.45).toFixed(2)) : 0;

  const rawCost = Number((subtotalBeforeMethod + expressSurcharge).toFixed(2));

  // Bonificación por compra mayor a $200:
  // - En Envío Estándar: 100% gratis en todo el país (excepto Patagonia Sur que bonifica 65% por flete aéreo)
  // - En Envío Express: bonifica el costo base estándar si supera $200
  let discountAmount = 0;
  if (params.subtotal >= freeThreshold) {
    if (method === "standard") {
      discountAmount =
        province.zone === "Patagonia Sur"
          ? Number((rawCost * 0.65).toFixed(2))
          : rawCost;
    } else if (method === "express") {
      discountAmount = Number((baseCost + weightCost).toFixed(2));
    }
  }

  const finalCost = Number(Math.max(0, rawCost - discountAmount).toFixed(2));
  const isFree = finalCost === 0;

  return {
    province,
    method,
    zone: province.zone,
    distanceKm: province.distanceKm,
    carrier: method === "express" ? `${province.carrier} (Prioridad Aérea/Flash)` : province.carrier,
    eta: method === "express" ? province.etaExpress : province.etaStandard,
    totalWeightKg,
    totalItems,
    baseCost,
    weightCost,
    postalAdjustment,
    expressSurcharge,
    rawCost,
    discountAmount,
    finalCost,
    isFree,
    freeThreshold,
    formulaSummary: `Zona ${province.zone} (~${province.distanceKm} km) · Base $${baseCost.toFixed(2)} + Peso ${totalWeightKg}kg ($${weightCost.toFixed(2)})`,
  };
}
