import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Dealer {
  id: string;
  name: string;
  contactNo: string;
  address: string;
}

interface Product {
  id: string;
  modelNo: string;
  dealerName: string;
  dealerCode: string;
  contactNo: string;
  location: string;
  productDescription: string;
  hsnNo: string;
  noOfVehicles: string;
  chassisNo: string;
  motorNo: string;
  batteryNo: string;
  batteryVehicleSpecs: string;
  batteryWarranty: string;
  batteryCapacity: string;
  vehicleWarranty: string;
  invoiceDate: string;
  amount: string;
  modeOfPayment: string;
}

interface ProductsTabProps {
  dealers: Dealer[];
  products: Product[];
  onAddProduct: (product: Omit<Product, "id">) => void;
  onDeleteProduct: (id: string) => void;
}

export default function ProductsTab({
  dealers,
  products,
  onAddProduct,
  onDeleteProduct,
}: ProductsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Product, "id">>({
    modelNo: "",
    dealerName: "",
    dealerCode: "",
    contactNo: "",
    location: "",
    productDescription: "",
    hsnNo: "",
    noOfVehicles: "",
    chassisNo: "",
    motorNo: "",
    batteryNo: "",
    batteryVehicleSpecs: "",
    batteryWarranty: "",
    batteryCapacity: "",
    vehicleWarranty: "",
    invoiceDate: "",
    amount: "",
    modeOfPayment: "",
  });

  const handleChange = (
    field: keyof Omit<Product, "id">,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.modelNo && formData.dealerName) {
      onAddProduct(formData);
      setFormData({
        modelNo: "",
        dealerName: "",
        dealerCode: "",
        contactNo: "",
        location: "",
        productDescription: "",
        hsnNo: "",
        noOfVehicles: "",
        chassisNo: "",
        motorNo: "",
        batteryNo: "",
        batteryVehicleSpecs: "",
        batteryWarranty: "",
        batteryCapacity: "",
        vehicleWarranty: "",
        invoiceDate: "",
        amount: "",
        modeOfPayment: "",
      });
      setShowForm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Product Form */}
      {showForm && (
        <div className="bg-background rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Model No
                  </label>
                  <input
                    type="text"
                    value={formData.modelNo}
                    onChange={(e) => handleChange("modelNo", e.target.value)}
                    placeholder="Enter model number"
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Dealer Name
                  </label>
                  <select
                    value={formData.dealerName}
                    onChange={(e) => handleChange("dealerName", e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Dealer</option>
                    {dealers.map((dealer) => (
                      <option key={dealer.id} value={dealer.name}>
                        {dealer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Dealer Code
                  </label>
                  <input
                    type="text"
                    value={formData.dealerCode}
                    onChange={(e) => handleChange("dealerCode", e.target.value)}
                    placeholder="Enter dealer code"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Contact No
                  </label>
                  <input
                    type="tel"
                    value={formData.contactNo}
                    onChange={(e) => handleChange("contactNo", e.target.value)}
                    placeholder="Enter contact number"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Enter location"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Product Description
                  </label>
                  <input
                    type="text"
                    value={formData.productDescription}
                    onChange={(e) =>
                      handleChange("productDescription", e.target.value)
                    }
                    placeholder="Enter product description"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    HSN No
                  </label>
                  <input
                    type="text"
                    value={formData.hsnNo}
                    onChange={(e) => handleChange("hsnNo", e.target.value)}
                    placeholder="Enter HSN number"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    No. of Vehicles
                  </label>
                  <input
                    type="number"
                    value={formData.noOfVehicles}
                    onChange={(e) => handleChange("noOfVehicles", e.target.value)}
                    placeholder="Enter number of vehicles"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div>
              <h3 className="text-lg font-medium mb-4">Vehicle Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Chassis No
                  </label>
                  <input
                    type="text"
                    value={formData.chassisNo}
                    onChange={(e) => handleChange("chassisNo", e.target.value)}
                    placeholder="Enter chassis number"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Motor No
                  </label>
                  <input
                    type="text"
                    value={formData.motorNo}
                    onChange={(e) => handleChange("motorNo", e.target.value)}
                    placeholder="Enter motor number"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Battery No
                  </label>
                  <input
                    type="text"
                    value={formData.batteryNo}
                    onChange={(e) => handleChange("batteryNo", e.target.value)}
                    placeholder="Enter battery number"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Battery & Warranty */}
            <div>
              <h3 className="text-lg font-medium mb-4">Battery & Warranty</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Battery & Vehicle Specifications
                  </label>
                  <input
                    type="text"
                    value={formData.batteryVehicleSpecs}
                    onChange={(e) =>
                      handleChange("batteryVehicleSpecs", e.target.value)
                    }
                    placeholder="Enter specifications"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Battery Warranty
                  </label>
                  <input
                    type="text"
                    value={formData.batteryWarranty}
                    onChange={(e) =>
                      handleChange("batteryWarranty", e.target.value)
                    }
                    placeholder="Enter battery warranty"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Battery Capacity
                  </label>
                  <input
                    type="text"
                    value={formData.batteryCapacity}
                    onChange={(e) =>
                      handleChange("batteryCapacity", e.target.value)
                    }
                    placeholder="Enter battery capacity"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Vehicle Warranty
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleWarranty}
                    onChange={(e) =>
                      handleChange("vehicleWarranty", e.target.value)
                    }
                    placeholder="Enter vehicle warranty"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Invoice & Payment */}
            <div>
              <h3 className="text-lg font-medium mb-4">Invoice & Payment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => handleChange("invoiceDate", e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    placeholder="Enter amount"
                    step="0.01"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mode of Payment
                  </label>
                  <select
                    value={formData.modeOfPayment}
                    onChange={(e) =>
                      handleChange("modeOfPayment", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Payment Mode</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Add Product
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Form Button */}
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Add New Product
        </Button>
      )}

      {/* Products List */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Products List</h2>
        </div>

        {products.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No products added yet. Add one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model No</TableHead>
                  <TableHead>Dealer Name</TableHead>
                  <TableHead>Dealer Code</TableHead>
                  <TableHead>Contact No</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Product Desc</TableHead>
                  <TableHead>HSN No</TableHead>
                  <TableHead>Vehicles</TableHead>
                  <TableHead>Chassis No</TableHead>
                  <TableHead>Motor No</TableHead>
                  <TableHead>Battery No</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.modelNo}</TableCell>
                    <TableCell>{product.dealerName}</TableCell>
                    <TableCell>{product.dealerCode}</TableCell>
                    <TableCell>{product.contactNo}</TableCell>
                    <TableCell>{product.location}</TableCell>
                    <TableCell>{product.productDescription}</TableCell>
                    <TableCell>{product.hsnNo}</TableCell>
                    <TableCell>{product.noOfVehicles}</TableCell>
                    <TableCell>{product.chassisNo}</TableCell>
                    <TableCell>{product.motorNo}</TableCell>
                    <TableCell>{product.batteryNo}</TableCell>
                    <TableCell>{product.invoiceDate}</TableCell>
                    <TableCell>{product.amount}</TableCell>
                    <TableCell>{product.modeOfPayment}</TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        className="inline-flex items-center gap-2 text-destructive hover:text-destructive/80 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
