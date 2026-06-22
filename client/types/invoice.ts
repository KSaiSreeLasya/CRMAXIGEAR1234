import { SplitPayment } from "@/components/SplitPaymentForm";

export interface ProductRow {
  id?: string;
  product: string;
  productDescription: string;
  amount: number;
  unit: number;
  gstRate: number;
}

export interface InvoiceForm {
  dealerInvoiceNo: string;
  dealerName: string;
  contactNo: string;
  location: string;
  invoiceDate: string;
  dueDate: string;
  poNumber: string;
  sentTo: string;
  shipTo: string;
  labourCharges: number;
  gstEnabled: boolean;
  modeOfPayment: string;
  leadSource: string;
  products: ProductRow[];
  splitPayments: SplitPayment[];
}

export interface DealerInvoiceRecord {
  id: string;
  dealerInvoiceNo: string;
  dealerName: string;
  dealerId?: string;
  contactNo: string;
  location: string;
  invoiceDate: string;
  dueDate: string;
  poNumber: string;
  sentTo: string;
  shipTo: string;
  products: ProductRow[];
  total: number;
  labourCharges: number;
  gstEnabled: boolean;
  gstAmount: number;
  modeOfPayment: string;
  leadSource: string;
  createdAt: string;
}

export interface SparesInvoiceRecord {
  id: string;
  sparesInvoiceNo: string;
  dealerName: string;
  dealerId?: string;
  contactNo: string;
  location: string;
  invoiceDate: string;
  dueDate: string;
  poNumber: string;
  sentTo: string;
  shipTo: string;
  products: ProductRow[];
  total: number;
  labourCharges: number;
  gstEnabled: boolean;
  gstAmount: number;
  modeOfPayment: string;
  leadSource: string;
  createdAt: string;
}
