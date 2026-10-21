import path from "node:path";
import fs from "node:fs";

export interface ImageSkuValidationResult {
  sku: string;
  category: string;
  imagePath: string;
  isValid: boolean;
  reason?: string;
  resolvedPath: string;
}

export function getCategoryFallback(category: string): string {
  const cat = (category || "").toLowerCase();
  if (cat.includes("ropa") || cat.includes("apparel") || cat.includes("remera")) {
    return "/placeholder/placeholder-ropa.svg";
  }
  if (cat.includes("pelota") || cat.includes("ball")) {
    return "/placeholder/placeholder-pelotas.svg";
  }
  if (cat.includes("accesorio") || cat.includes("accessory") || cat.includes("gear")) {
    return "/placeholder/placeholder-accesorios.svg";
  }
  return "/placeholder/placeholder-zapatillas.svg";
}

export function validateImageSku(
  sku: string,
  category: string,
  imagePath: string
): ImageSkuValidationResult {
  if (!imagePath || imagePath.trim().length === 0) {
    return {
      sku,
      category,
      imagePath: imagePath || "(empty)",
      isValid: false,
      reason: "Missing image path",
      resolvedPath: getCategoryFallback(category),
    };
  }

  // Placeholders son siempre válidos como fallback
  if (imagePath.includes("/placeholder/")) {
    return {
      sku,
      category,
      imagePath,
      isValid: true,
      resolvedPath: imagePath,
    };
  }

  // Regla estricta: El nombre del archivo o URL DEBE contener el SKU (ej: SPX-RUN-001.webp o ?sku=SPX-RUN-001)
  const cleanSku = sku.trim().toUpperCase();
  const normalizedPath = imagePath.toUpperCase();

  const containsSku = normalizedPath.includes(cleanSku);

  if (!containsSku) {
    return {
      sku,
      category,
      imagePath,
      isValid: false,
      reason: `Filename/URL does not contain SKU '${sku}'`,
      resolvedPath: getCategoryFallback(category),
    };
  }

  return {
    sku,
    category,
    imagePath,
    isValid: true,
    resolvedPath: imagePath,
  };
}

// CLI runner
if (process.argv[1]?.includes("validate-image-sku")) {
  const skuArg = process.argv[2];
  const imgArg = process.argv[3];
  const catArg = process.argv[4] || "zapatillas";

  if (skuArg && imgArg) {
    const res = validateImageSku(skuArg, catArg, imgArg);
    console.log(JSON.stringify(res, null, 2));
  } else {
    console.log("Usage: npx tsx scripts/validate-image-sku.ts <SKU> <imagePath> [category]");
  }
}
