import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, Info, ChevronDown, ChevronUp } from "lucide-react";

interface TaxCalculatorProps {
  onCalculate?: (result: TaxResult) => void;
}

interface TaxResult {
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  taxAmount: number;
  effectiveTaxRate: number;
  netIncome: number;
  breakdown: {
    basic: number;
    houseRent: number;
    medical: number;
    transport: number;
    festival: number;
  };
}

const TAX_BRACKETS_2024 = [
  { min: 0, max: 350000, rate: 0 },
  { min: 350000, max: 450000, rate: 0.05 },
  { min: 450000, max: 750000, rate: 0.1 },
  { min: 750000, max: 1150000, rate: 0.15 },
  { min: 1150000, max: 1650000, rate: 0.2 },
  { min: 1650000, max: Infinity, rate: 0.25 },
];

const DEDUCTION_LIMITS = {
  houseRent: 300000,
  medical: 120000,
  transport: 30000,
  festival: 20000,
};

export default function TaxCalculator({ onCalculate }: TaxCalculatorProps) {
  const [grossIncome, setGrossIncome] = useState("");
  const [houseRent, setHouseRent] = useState("");
  const [medical, setMedical] = useState("");
  const [transport, setTransport] = useState("");
  const [festival, setFestival] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  const result = useMemo((): TaxResult => {
    const gross = parseFloat(grossIncome) || 0;
    const hr = Math.min(parseFloat(houseRent) || 0, DEDUCTION_LIMITS.houseRent);
    const med = Math.min(parseFloat(medical) || 0, DEDUCTION_LIMITS.medical);
    const trans = Math.min(parseFloat(transport) || 0, DEDUCTION_LIMITS.transport);
    const fest = Math.min(parseFloat(festival) || 0, DEDUCTION_LIMITS.festival);

    const totalDeductions = hr + med + trans + fest;
    const taxableIncome = Math.max(0, gross - totalDeductions);

    let taxAmount = 0;
    for (const bracket of TAX_BRACKETS_2024) {
      if (taxableIncome > bracket.min) {
        const taxableInBracket = Math.min(
          taxableIncome - bracket.min,
          bracket.max - bracket.min,
        );
        taxAmount += taxableInBracket * bracket.rate;
      }
    }

    const effectiveTaxRate = gross > 0 ? (taxAmount / gross) * 100 : 0;
    const netIncome = gross - taxAmount;

    return {
      grossIncome: gross,
      totalDeductions,
      taxableIncome,
      taxAmount,
      effectiveTaxRate,
      netIncome,
      breakdown: {
        basic: gross - (hr + med + trans + fest),
        houseRent: hr,
        medical: med,
        transport: trans,
        festival: fest,
      },
    };
  }, [grossIncome, houseRent, medical, transport, festival]);

  const handleCalculate = () => {
    onCalculate?.(result);
  };

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Tax Calculator</h3>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 rounded-lg hover:bg-white/10"
        >
          {showInfo ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Info className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {showInfo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-muted-foreground"
        >
          <p className="font-medium text-foreground mb-2">Bangladesh Tax Brackets (2024)</p>
          <ul className="space-y-1">
            <li>Up to ৳3,50,000: 0%</li>
            <li>৳3,50,001 - ৳4,50,000: 5%</li>
            <li>৳4,50,001 - ৳7,50,000: 10%</li>
            <li>৳7,50,001 - ৳11,50,000: 15%</li>
            <li>৳11,50,001 - ৳16,50,000: 20%</li>
            <li>Above ৳16,50,000: 25%</li>
          </ul>
          <p className="mt-2 text-xs">* Deductions are capped at government limits</p>
        </motion.div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-1">
            Annual Gross Income (৳)
          </label>
          <input
            type="number"
            value={grossIncome}
            onChange={(e) => setGrossIncome(e.target.value)}
            placeholder="e.g., 800000"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              House Rent (৳) <span className="text-xs">Max: ৳3L</span>
            </label>
            <input
              type="number"
              value={houseRent}
              onChange={(e) => setHouseRent(e.target.value)}
              placeholder="0"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Medical (৳) <span className="text-xs">Max: ৳1.2L</span>
            </label>
            <input
              type="number"
              value={medical}
              onChange={(e) => setMedical(e.target.value)}
              placeholder="0"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Transport (৳) <span className="text-xs">Max: ৳30K</span>
            </label>
            <input
              type="number"
              value={transport}
              onChange={(e) => setTransport(e.target.value)}
              placeholder="0"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Festival (৳) <span className="text-xs">Max: ৳20K</span>
            </label>
            <input
              type="number"
              value={festival}
              onChange={(e) => setFestival(e.target.value)}
              placeholder="0"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {result.grossIncome > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gross Income:</span>
              <span>৳{result.grossIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Deductions:</span>
              <span className="text-green-500">-৳{result.totalDeductions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxable Income:</span>
              <span>৳{result.taxableIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-medium pt-2 border-t border-white/10">
              <span>Tax Amount:</span>
              <span className="text-red-500">৳{result.taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Effective Tax Rate:</span>
              <span>{result.effectiveTaxRate.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
              <span>Net Income:</span>
              <span className="text-primary">৳{result.netIncome.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      )}

      <button
        onClick={handleCalculate}
        disabled={!grossIncome}
        className="w-full mt-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Calculate Tax
      </button>
    </div>
  );
}
