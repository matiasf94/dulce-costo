export const IVA = 0.19;

export const UNITS = [
  { value: 'kg', label: 'Kilogramo (kg)', base: 'g', factor: 1000 },
  { value: 'g', label: 'Gramo (g)', base: 'g', factor: 1 },
  { value: 'lt', label: 'Litro (lt)', base: 'ml', factor: 1000 },
  { value: 'ml', label: 'Mililitro (ml)', base: 'ml', factor: 1 },
  { value: 'unidad', label: 'Unidad', base: 'unidad', factor: 1 },
];

export const RECIPE_UNITS = [
  { value: 'g', label: 'g' },
  { value: 'ml', label: 'ml' },
  { value: 'unidad', label: 'und' },
  { value: 'taza', label: 'taza' },
  { value: 'cda', label: 'cda' },
  { value: 'cdita', label: 'cdita' },
];

export const UNIT_CONVERSIONS = {
  g: 1,
  kg: 1000,
  ml: 1,
  lt: 1000,
  unidad: 1,
  taza: 240,
  cda: 15,
  cdita: 5,
};

/**
 * Get cost per base unit (g, ml, or unidad) for an ingredient
 * @param {object} ingredient - { purchasePrice, purchaseQty, purchaseUnit, merma }
 * @returns {number} cost per 1g / 1ml / 1unidad after merma
 */
export function costPerBaseUnit(ingredient) {
  const { purchasePrice, purchaseQty, purchaseUnit, merma = 0 } = ingredient;
  if (!purchasePrice || !purchaseQty || purchaseQty === 0) return 0;

  const unitDef = UNITS.find(u => u.value === purchaseUnit);
  if (!unitDef) return 0;

  // Total base units purchased (g or ml or unidad)
  const totalBaseUnits = purchaseQty * unitDef.factor;

  // Apply merma (loss %)
  const usableUnits = totalBaseUnits * (1 - merma / 100);
  if (usableUnits === 0) return 0;

  return purchasePrice / usableUnits;
}

/**
 * Convert recipe ingredient amount to base units
 * @param {number} amount
 * @param {string} unit
 * @returns {number} in base units
 */
export function toBaseUnits(amount, unit) {
  const factor = UNIT_CONVERSIONS[unit] || 1;
  return amount * factor;
}

/**
 * Calculate cost of a single recipe ingredient
 * @param {object} recipeIng - { ingredientId, amount, unit }
 * @param {array} ingredients - master ingredient list
 * @returns {number} cost in CLP
 */
export function ingredientLineCost(recipeIng, ingredients) {
  const ing = ingredients.find(i => i.id === recipeIng.ingredientId);
  if (!ing) return 0;

  const cpbu = costPerBaseUnit(ing);
  const baseAmount = toBaseUnits(recipeIng.amount, recipeIng.unit);
  return cpbu * baseAmount;
}

/**
 * Full recipe cost calculation
 * @param {object} recipe
 * @param {array} ingredients
 * @returns {object} cost breakdown
 */
export function calculateRecipeCost(recipe, ingredients) {
  if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
    return null;
  }

  // Raw material cost
  const materiaPrima = recipe.ingredients.reduce((sum, ri) => {
    return sum + ingredientLineCost(ri, ingredients);
  }, 0);

  // Indirect costs
  const gasElec = materiaPrima * ((recipe.gasPercent || 0) / 100);
  const packaging = recipe.packagingCost || 0;
  const laborHours = recipe.laborHours || 0;
  const laborRate = recipe.laborRate || 0;
  const manoObra = laborHours * laborRate;
  const arriendoPercent = recipe.arriendoPercent || 0;
  const arriendo = materiaPrima * (arriendoPercent / 100);

  const costoTotal = materiaPrima + gasElec + packaging + manoObra + arriendo;

  // Por porción
  const porciones = recipe.portions || 1;
  const costoPorcion = costoTotal / porciones;

  // Precio de venta
  const margen = recipe.margin || 0;
  const precioVentaNeto = costoPorcion * (1 + margen / 100);
  const precioVentaConIVA = precioVentaNeto * (1 + IVA);

  // Precio venta total receta
  const precioTotalNeto = precioVentaNeto * porciones;
  const precioTotalConIVA = precioVentaConIVA * porciones;

  return {
    materiaPrima,
    gasElec,
    packaging,
    manoObra,
    arriendo,
    costoTotal,
    costoPorcion,
    precioVentaNeto,
    precioVentaConIVA,
    precioTotalNeto,
    precioTotalConIVA,
    porciones,
    ivaAmount: precioVentaConIVA - precioVentaNeto,
    margen,
  };
}

/**
 * Format as Chilean peso
 */
export function formatCLP(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) return '$0';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/**
 * Format percent
 */
export function formatPct(value) {
  return `${(value || 0).toFixed(1)}%`;
}

/**
 * Generate a unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
