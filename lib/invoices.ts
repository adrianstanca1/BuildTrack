export interface InvoiceTotals {
  gross: number;
  vatTotal: number;
  cisDeduction: number;
  netTotal: number;
}

export interface LineItemInput {
  quantity: number;
  unitPrice: number;
  vatRate?: number;
  cisRate?: number;
  cisDeduction?: number;
}

export function calculateInvoiceTotals(lineItems: LineItemInput[]): InvoiceTotals {
  let gross = 0;
  let vatTotal = 0;
  let cisDeduction = 0;

  for (const item of lineItems) {
    const qty = Number(item.quantity) || 0;
    const up = Number(item.unitPrice) || 0;
    const vatRate = Number(item.vatRate) || 20;
    const cisRate = Number(item.cisRate) || 20;
    const lineGross = qty * up;
    const lineCIS = item.cisDeduction ?? lineGross * (cisRate / 100);
    const lineVAT = (lineGross - lineCIS) * (vatRate / 100);

    gross += lineGross;
    vatTotal += lineVAT;
    cisDeduction += lineCIS;
  }

  const netTotal = gross + vatTotal - cisDeduction;

  return {
    gross: round2(gross),
    vatTotal: round2(vatTotal),
    cisDeduction: round2(cisDeduction),
    netTotal: round2(netTotal),
  };
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
