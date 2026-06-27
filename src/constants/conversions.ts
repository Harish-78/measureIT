export type LandUnit = 'acre' | 'cent' | 'hectare' | 'sqft';

export interface UnitDetail {
  id: LandUnit;
  label: string;
  symbol: string;
  sqftValue: number;
  description: string;
}

export const LAND_UNITS: Record<LandUnit, UnitDetail> = {
  acre: {
    id: 'acre',
    label: 'Acre',
    symbol: 'ac',
    sqftValue: 43560,
    description: '1 Acre = 100 Cents = 43,560 Sq. Ft.',
  },
  cent: {
    id: 'cent',
    label: 'Cent',
    symbol: 'ct',
    sqftValue: 435.6,
    description: '1 Cent = 435.6 Sq. Ft. = 0.01 Acre',
  },
  hectare: {
    id: 'hectare',
    label: 'Hectare',
    symbol: 'ha',
    sqftValue: 107639.104,
    description: '1 Hectare = 10,000 Sq. Meters ≈ 2.471 Acres',
  },
  sqft: {
    id: 'sqft',
    label: 'Square Feet',
    symbol: 'sq ft',
    sqftValue: 1,
    description: 'Base unit of measurement',
  },
};

export const UNIT_ORDER: LandUnit[] = ['acre', 'cent', 'hectare', 'sqft'];

/**
 * Converts a value from one unit to all other units.
 */
export function convertLandArea(value: number, fromUnit: LandUnit): Record<LandUnit, number> {
  if (isNaN(value) || value <= 0) {
    return {
      acre: 0,
      cent: 0,
      hectare: 0,
      sqft: 0,
    };
  }

  // Convert to base unit (Square Feet) first
  const sqft = value * LAND_UNITS[fromUnit].sqftValue;

  return {
    acre: sqft / LAND_UNITS.acre.sqftValue,
    cent: sqft / LAND_UNITS.cent.sqftValue,
    hectare: sqft / LAND_UNITS.hectare.sqftValue,
    sqft: sqft,
  };
}

/**
 * Formats a value with appropriate decimal places based on the unit.
 */
export function formatUnitValue(value: number, unit: LandUnit): string {
  if (value === 0) return '0';
  
  // Dynamic decimal places depending on the size and unit
  switch (unit) {
    case 'acre':
    case 'hectare':
      // If it's an exact integer or close to it, keep it simple. Otherwise show 4 decimals.
      return Number(value.toFixed(4)).toString();
    case 'cent':
      return Number(value.toFixed(2)).toString();
    case 'sqft':
      // Square feet is usually rounded to nearest integer or 1 decimal.
      return Math.round(value) === value ? value.toString() : Number(value.toFixed(1)).toString();
    default:
      return value.toString();
  }
}

/**
 * Parse string input safely to number.
 */
export function parseInputValue(input: string): number {
  const sanitized = input.replace(/,/g, '').trim();
  if (!sanitized) return 0;
  const num = parseFloat(sanitized);
  return isNaN(num) ? 0 : num;
}
