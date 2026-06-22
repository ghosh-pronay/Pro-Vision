export interface Wallet {
  _id: string;
  name: string;
  nameBn?: string;
  type: "cash" | "bank" | "credit" | "savings" | "digital" | "other";
  balance: number;
  currency: string;
  color: string;
  icon: string;
  isDefault: boolean;
  isHidden?: boolean;
  presetId?: string;
  createdAt?: number;
}
