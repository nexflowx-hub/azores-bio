import { CartItem, ShippingOption, ShippingCalculation, ShippingZone } from './types';

// ─── Zone Detection ────────────────────────────────────────────────────────

const PT_CONTINENTAL = 'PT_CONTINENTAL';
const AZORES_MADEIRA = 'AZORES_MADEIRA';

const EU_COUNTRIES = ['DE', 'FR', 'ES', 'BE', 'DK', 'NL', 'LU', 'PL', 'CZ', 'IT'];

const COUNTRY_CODE_MAP: Record<string, string> = {
  'portugal': 'PT', 'espanha': 'ES', 'frança': 'FR', 'franca': 'FR',
  'alemanha': 'DE', 'reino unido': 'GB', 'itália': 'IT', 'italia': 'IT',
  'países baixos': 'NL', 'paises baixos': 'NL', 'bélgica': 'BE', 'belgica': 'BE',
  'suíça': 'CH', 'suica': 'CH', 'áustria': 'AT', 'austria': 'AT',
  'estados unidos': 'US', 'canadá': 'CA', 'canada': 'CA',
  'brasil': 'BR', 'austrália': 'AU', 'australia': 'AU',
  'polónia': 'PL', 'polonia': 'PL', 'luxemburgo': 'LU',
  'dinamarca': 'DK', 'república checa': 'CZ', 'republica checa': 'CZ',
  'madeira': 'MADEIRA', 'açores': 'AZORES', 'azores': 'AZORES',
};

/** Detect shipping zone from country name and postal code */
export function detectShippingZone(country: string, postalCode?: string): ShippingZone {
  const normalized = country.trim().toLowerCase();
  const code = COUNTRY_CODE_MAP[normalized] || normalized.toUpperCase();

  // Check for Azores/Madeira
  if (code === 'AZORES' || code === 'MADEIRA') return 'AZORES_MADEIRA';
  
  // Portugal — check postal code for Azores/Madeira
  if (code === 'PT') {
    if (postalCode) {
      const prefix = postalCode.substring(0, 4);
      // Azores: 9xxx, Madeira: 9xxx (9060-9125 Madeira, 9500-9940 Azores)
      if (/^9[0-9]{3}/.test(prefix)) return 'AZORES_MADEIRA';
    }
    return 'PT_CONTINENTAL';
  }

  // EU allowed countries
  if (EU_COUNTRIES.includes(code)) return 'EU';

  // Default to EU for unknown countries
  return 'EU';
}

/** Get country code from country name */
export function getCountryCode(country: string): string {
  const normalized = country.trim().toLowerCase();
  return COUNTRY_CODE_MAP[normalized] || normalized.toUpperCase();
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Calculate the number of additional 10kg increments (rounded up) beyond a threshold.
 * e.g. extraWeightIncrements(23, 20) = 1 (one additional 10kg increment for the 3kg over)
 * e.g. extraWeightIncrements(31, 20) = 2 (two increments: 11kg over → ceil(1.1) = 2)
 */
function extraWeightIncrements(weight: number, threshold: number): number {
  if (weight <= threshold) return 0;
  const excess = weight - threshold;
  return Math.ceil(excess / 10);
}

// ─── Shipping Calculator ───────────────────────────────────────────────────

export function calculateShipping(
  items: CartItem[],
  zone: ShippingZone
): ShippingCalculation {
  const totalWeight = items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  const hasColdItems = items.some((item) => item.requiresColdTransport);
  const options: ShippingOption[] = [];

  if (zone === 'PT_CONTINENTAL') {
    options.push(...calculatePTContinental(totalWeight, hasColdItems));
  } else if (zone === 'AZORES_MADEIRA') {
    options.push(...calculateIlhas(totalWeight, hasColdItems));
  } else if (zone === 'EU') {
    options.push(...calculateEU(totalWeight, hasColdItems));
  }

  return { options, totalWeight, hasColdItems };
}

function calculatePTContinental(weight: number, hasCold: boolean): ShippingOption[] {
  const opts: ShippingOption[] = [];

  if (hasCold) {
    if (weight <= 10) {
      opts.push({
        method: 'PT_CONT_COLD',
        label: 'Portugal Continental — Transporte Refrigerado',
        cost: 15.0,
        zone: 'PT_CONTINENTAL',
        estimatedDays: '24-48h',
      });
    } else {
      // Over 10kg with cold: extrapolate price
      const increments = extraWeightIncrements(weight, 10);
      const cost = 15.0 + increments * 5.0;
      opts.push({
        method: 'PT_CONT_COLD',
        label: `Portugal Continental — Transporte Refrigerado (${weight.toFixed(1)} kg)`,
        cost,
        zone: 'PT_CONTINENTAL',
        estimatedDays: '24-48h',
        warning: `Peso total (${weight.toFixed(1)} kg) excede o limite de 10 kg para transporte refrigerado. Custo adicional calculado automaticamente.`,
      });
    }
  }

  if (!hasCold) {
    let cost = 5.50;
    let label = 'Portugal Continental — Até 5 kg';

    if (weight > 20) {
      // Over 20kg normal: extrapolate price — 9.50€ base + 5.00€ per additional 10kg (or fraction)
      const increments = extraWeightIncrements(weight, 20);
      cost = 9.50 + increments * 5.0;
      label = `Portugal Continental (${weight.toFixed(1)} kg)`;
      opts.push({
        method: 'PT_CONT_NORMAL',
        label,
        cost,
        zone: 'PT_CONTINENTAL',
        estimatedDays: '24-48h',
        warning: `Peso total (${weight.toFixed(1)} kg) excede o limite padrão de 20 kg. Custo adicional calculado automaticamente.`,
      });
    } else if (weight > 10) {
      cost = 9.50;
      label = 'Portugal Continental — 10.01-20 kg';
      opts.push({
        method: 'PT_CONT_NORMAL',
        label,
        cost,
        zone: 'PT_CONTINENTAL',
        estimatedDays: '24-48h',
      });
    } else if (weight > 5) {
      cost = 7.99;
      label = 'Portugal Continental — 5.01-10 kg';
      opts.push({
        method: 'PT_CONT_NORMAL',
        label,
        cost,
        zone: 'PT_CONTINENTAL',
        estimatedDays: '24-48h',
      });
    } else {
      opts.push({
        method: 'PT_CONT_NORMAL',
        label,
        cost,
        zone: 'PT_CONTINENTAL',
        estimatedDays: '24-48h',
      });
    }
  }

  return opts;
}

function calculateIlhas(weight: number, hasCold: boolean): ShippingOption[] {
  const opts: ShippingOption[] = [];

  if (hasCold) {
    // Instead of blocking, offer the special cold consultation option
    opts.push({
      method: 'ILHAS_COLD_SPECIAL',
      label: 'Envio Especial — Sob Consulta (info@azores.bio)',
      cost: 0,
      zone: 'AZORES_MADEIRA',
      warning: 'Produtos refrigerados serão enviados por transporte normal. O cliente assume o risco de deterioração. Para transporte refrigerado, contacte info@azores.bio.',
    });
  }

  // Always offer normal shipping to islands (even with cold items, they can still
  // choose normal shipping at their own risk via the warning above)
  if (weight > 18) {
    // Over 18kg: extrapolate price — 20.00€ base + 5.00€ per additional 10kg
    const increments = extraWeightIncrements(weight, 18);
    const cost = 20.0 + increments * 5.0;
    opts.push({
      method: 'ILHAS_NORMAL',
      label: `Açores e Madeira (${weight.toFixed(1)} kg)`,
      cost,
      zone: 'AZORES_MADEIRA',
      estimatedDays: '3-7 dias úteis',
      warning: `Peso total (${weight.toFixed(1)} kg) excede o limite padrão de 18 kg. Custo adicional calculado automaticamente.`,
    });
  } else {
    let cost = 9.0;
    let label = 'Açores e Madeira — Até 4.5 kg';

    if (weight > 9) {
      cost = 20.0;
      label = 'Açores e Madeira — 9.01-18 kg';
    } else if (weight > 4.5) {
      cost = 12.0;
      label = 'Açores e Madeira — 4.51-9 kg';
    }

    opts.push({
      method: 'ILHAS_NORMAL',
      label,
      cost,
      zone: 'AZORES_MADEIRA',
      estimatedDays: '3-7 dias úteis',
    });
  }

  return opts;
}

function calculateEU(weight: number, hasCold: boolean): ShippingOption[] {
  const opts: ShippingOption[] = [];

  if (hasCold) {
    // Instead of blocking, offer the special cold consultation option
    opts.push({
      method: 'EU_COLD_SPECIAL',
      label: 'Envio Especial — Sob Consulta (info@azores.bio)',
      cost: 0,
      zone: 'EU',
      warning: 'Produtos refrigerados serão enviados por transporte normal. O cliente assume o risco de deterioração. Para transporte refrigerado, contacte info@azores.bio.',
    });
  }

  if (weight > 18) {
    // Over 18kg: extrapolate price — 27.50€ base + 5.00€ per additional 10kg
    const increments = extraWeightIncrements(weight, 18);
    const cost = 27.5 + increments * 5.0;
    opts.push({
      method: 'EU_NORMAL',
      label: `União Europeia (${weight.toFixed(1)} kg)`,
      cost,
      zone: 'EU',
      estimatedDays: '5-10 dias úteis',
      warning: `Peso total (${weight.toFixed(1)} kg) excede o limite padrão de 18 kg. Custo adicional calculado automaticamente.`,
    });
  } else {
    opts.push({
      method: 'EU_NORMAL',
      label: 'União Europeia — Até 18 kg',
      cost: 27.5,
      zone: 'EU',
      estimatedDays: '5-10 dias úteis',
    });
  }

  return opts;
}
