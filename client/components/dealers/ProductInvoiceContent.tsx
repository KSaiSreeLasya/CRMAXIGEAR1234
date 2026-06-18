interface ProductInvoiceContentProps {
  product: {
    id?: string;
    model_no: string;
    dealer_name: string;
    dealer_code: string;
    contact_no: string;
    location: string;
    product_description: string;
    hsn_no: string;
    no_of_vehicles: number;
    chassis_no: string;
    motor_no: string;
    battery_no: string;
    battery_vehicle_specs: string;
    battery_warranty: string;
    battery_capacity: string;
    vehicle_warranty: string;
    invoice_date: string;
    amount: number;
    mode_of_payment: string;
  };
  gstType: "igst" | "cgst-sgst";
  forPrint?: boolean;
}

const COMPANY_INFO = {
  name: "AXIGEAR ELECTRIC LOUNGE",
  address: "SY 02, PLOT NO.148, MYTHRI NAGAR, MADINAGUDA",
  city: "HYDERABAD, TELANGANA, INDIA 500049",
  gstin: "36ACJFA4386L1ZW",
  bank: {
    name: "IDFC FIRST BANK",
    accountNo: "69392193637",
    ifscCode: "IDFB0080205",
    location: "Gachibowli",
  },
};

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export default function ProductInvoiceContent({
  product,
  gstType,
  forPrint = false,
}: ProductInvoiceContentProps) {
  const amount = product.amount || 0;
  const gstAmount = roundCurrency(amount * 0.18);
  const totalAmount = roundCurrency(amount + gstAmount);
  const igstAmount = gstType === "igst" ? gstAmount : 0;
  const cgstAmount = gstType === "cgst-sgst" ? roundCurrency(gstAmount / 2) : 0;
  const sgstAmount = gstType === "cgst-sgst" ? roundCurrency(gstAmount - cgstAmount) : 0;

  const containerClass = forPrint
    ? "bg-white text-black p-12 w-full print:p-12"
    : "bg-white text-black p-8 md:p-12 max-w-5xl mx-auto rounded-lg border-2 border-gray-300 shadow-lg";

  const invoiceHeaderBlock = (
    <div className="grid grid-cols-3 gap-6 mb-6 pb-6 border-b-2 border-gray-400">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F59bf3e928fc9473a97d5e87470c824bb%2F8b737424d5b445559a46780e8d2b4449?format=webp&width=800&height=1200"
            alt="AXIGEAR Logo"
            className="w-16 h-16 object-contain flex-shrink-0"
          />
          <h1 className="text-lg font-bold leading-tight">{COMPANY_INFO.name}</h1>
        </div>
        <div className="text-xs space-y-0.5 text-gray-700">
          <p className="font-medium text-xs">{COMPANY_INFO.address}</p>
          <p className="font-medium text-xs">{COMPANY_INFO.city}</p>
          <p className="mt-3">
            <span className="font-bold">GSTIN/UIN:</span> {COMPANY_INFO.gstin}
          </p>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-bold text-blue-700 mb-2">PRODUCT INVOICE</h2>
        <p className="text-xs text-gray-600 font-semibold leading-snug">
          Issued u/s 31(1) of CGST Act, 2017 r.w.t Rule 46 of CGST Rules, 2017
        </p>
        <div className="mt-6 p-3 border-2 border-gray-400 rounded bg-gray-50">
          <p className="text-xs text-gray-700 italic font-semibold">Original for Recipient</p>
        </div>
      </div>

      <div className="text-sm space-y-3 text-right border-l-2 border-gray-300 pl-6">
        <div>
          <p className="text-xs text-gray-600 font-bold">Model No:</p>
          <p className="font-bold text-lg">{product.model_no}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 font-bold">Invoice Date:</p>
          <p className="font-semibold">{product.invoice_date || new Date().toISOString().split("T")[0]}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 font-bold">Place of Supply:</p>
          <p className="font-semibold">36-TG</p>
        </div>
      </div>
    </div>
  );

  const billToBlock = (
    <div className="grid grid-cols-2 gap-8 mb-6 pb-6 border-b-2 border-gray-400">
      <div>
        <p className="text-xs font-bold text-gray-700 mb-2">BILL TO:</p>
        <div className="space-y-1 text-sm">
          <p className="font-bold text-gray-900">{product.dealer_name}</p>
          <p className="text-gray-700">{product.contact_no}</p>
          <p className="text-gray-700">{product.location}</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-gray-700 mb-2">BANK DETAILS:</p>
        <div className="space-y-0.5 text-xs text-gray-700">
          <p>
            <span className="font-bold">Bank Name:</span> {COMPANY_INFO.bank.name}
          </p>
          <p>
            <span className="font-bold">A/C No:</span> {COMPANY_INFO.bank.accountNo}
          </p>
          <p>
            <span className="font-bold">IFSC:</span> {COMPANY_INFO.bank.ifscCode}
          </p>
          <p>
            <span className="font-bold">Location:</span> {COMPANY_INFO.bank.location}
          </p>
        </div>
      </div>
    </div>
  );

  const productDetailsBlock = (
    <div className="mb-6 pb-6 border-b-2 border-gray-400">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Product Details</h3>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <p className="font-medium text-gray-700">Model No:</p>
          <p className="text-gray-900">{product.model_no}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Dealer Code:</p>
          <p className="text-gray-900">{product.dealer_code}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">HSN No:</p>
          <p className="text-gray-900">{product.hsn_no}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">No. of Vehicles:</p>
          <p className="text-gray-900">{product.no_of_vehicles}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Chassis No:</p>
          <p className="text-gray-900">{product.chassis_no}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Motor No:</p>
          <p className="text-gray-900">{product.motor_no}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Battery No:</p>
          <p className="text-gray-900">{product.battery_no}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Battery Capacity:</p>
          <p className="text-gray-900">{product.battery_capacity}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Battery & Vehicle Specs:</p>
          <p className="text-gray-900">{product.battery_vehicle_specs}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Battery Warranty:</p>
          <p className="text-gray-900">{product.battery_warranty}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Vehicle Warranty:</p>
          <p className="text-gray-900">{product.vehicle_warranty}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Description:</p>
          <p className="text-gray-900">{product.product_description}</p>
        </div>
      </div>
    </div>
  );

  const amountBlock = (
    <div className="grid grid-cols-3 gap-6 mb-6">
      <div></div>
      <div></div>
      <div className="space-y-2 border-2 border-gray-300 p-4 bg-gray-50 rounded">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">Amount:</span>
          <span className="font-semibold text-gray-900">₹{amount.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-300 pt-2 flex justify-between text-sm">
          <span className="font-medium text-gray-700">Taxable Value:</span>
          <span className="font-semibold text-gray-900">₹{amount.toFixed(2)}</span>
        </div>
        {gstType === "igst" ? (
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">IGST (18%):</span>
            <span className="font-semibold text-gray-900">₹{igstAmount.toFixed(2)}</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">CGST (9%):</span>
              <span className="font-semibold text-gray-900">₹{cgstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">SGST (9%):</span>
              <span className="font-semibold text-gray-900">₹{sgstAmount.toFixed(2)}</span>
            </div>
          </>
        )}
        <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-base">
          <span className="text-gray-900">TOTAL AMOUNT:</span>
          <span className="text-green-700">₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  const paymentBlock = (
    <div className="mb-6 pb-6 border-b-2 border-gray-400">
      <h3 className="text-sm font-bold text-gray-900 mb-3">Payment Details</h3>
      <div className="text-xs space-y-2">
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Mode of Payment:</span>
          <span className="text-gray-900">{product.mode_of_payment}</span>
        </div>
      </div>
    </div>
  );

  const termsBlock = (
    <div className="space-y-4 text-xs text-gray-700">
      <div>
        <p className="font-bold text-gray-900 mb-1">Terms and Conditions:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Goods once sold cannot be taken back.</li>
          <li>Interest will be charged @18% per annum if payment is not made within 30 days.</li>
          <li>Cheques are subject to clearance.</li>
          <li>All disputes are subject to Hyderabad jurisdiction only.</li>
        </ul>
      </div>
      <div className="grid grid-cols-2 gap-8 pt-6 mt-6 border-t border-gray-300">
        <div>
          <p className="font-bold text-gray-900">Authorized Signatory</p>
          <div className="h-12 mt-2"></div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900">For AXIGEAR ELECTRIC LOUNGE</p>
          <div className="h-12 mt-2"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={containerClass}>
      {invoiceHeaderBlock}
      {billToBlock}
      {productDetailsBlock}
      {amountBlock}
      {paymentBlock}
      {termsBlock}
    </div>
  );
}
