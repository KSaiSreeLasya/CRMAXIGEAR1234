import { ArrowLeft, BarChart3, Download, Lock, Eye, EyeOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface ProjectSale {
  id: string;
  customerName: string;
  modelNo: string;
  brand: string;
  vehicleModel: string;
  amount: number;
  invoiceDate: string;
}

interface InventoryCost {
  modelNo: string;
  vehicleModel: string;
  costPrice: number;
  brand?: string;
  chassisColors?: Record<string, string>;
}

interface BrandAnalysis {
  brand: string;
  modelCount: number;
  colorCount: number;
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  percentage: number;
}

interface ColorAnalysis {
  color: string;
  brands: Set<string>;
  models: Set<string>;
  totalSales: number;
  totalRevenue: number;
  percentage: number;
}

interface MonthlySale {
  model: string;
  count: number;
  totalSales: number;
  totalCost: number;
  totalProfit: number;
}

const SECURE_PASSWORD = "Axigear@2026";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const normalize = (value: string) => value.trim().toLowerCase();

const getMonthKey = (dateString: string) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const formatMonthYear = (monthKey: string) => {
  const [year, month] = monthKey.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

export default function ProjectAnalysis() {
  const navigate = useNavigate();
  const [sales, setSales] = useState<ProjectSale[]>([]);
  const [inventoryCosts, setInventoryCosts] = useState<InventoryCost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [viewMode, setViewMode] = useState<"all" | "monthly" | "brand" | "model" | "color">("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const loadAnalysis = async () => {
      setIsLoading(true);
      try {
        if (supabase) {
          const [projectsResult, inventoryResult] = await Promise.all([
            supabase.from("projects").select("id, customer_name, model_no, brand, vehicle_model, amount, invoice_date").order("created_at", { ascending: false }),
            supabase.from("inventory_items").select("model_no, vehicle_model, lot_price, transportation_price, brand, chassis_colors"),
          ]);

          if (projectsResult.error) throw projectsResult.error;
          if (inventoryResult.error) throw inventoryResult.error;

          setSales(
            (projectsResult.data ?? []).map((project) => ({
              id: project.id,
              customerName: project.customer_name ?? "-",
              modelNo: project.model_no ?? "",
              brand: project.brand ?? "",
              vehicleModel: project.vehicle_model ?? "",
              amount: Number(project.amount ?? 0),
              invoiceDate: project.invoice_date ?? "",
            })),
          );
          setInventoryCosts(
            (inventoryResult.data ?? []).map((item) => ({
              modelNo: item.model_no ?? "",
              vehicleModel: item.vehicle_model ?? "",
              costPrice: Number(item.lot_price ?? 0) + Number(item.transportation_price ?? 0),
              brand: item.brand ?? "",
              chassisColors: item.chassis_colors as Record<string, string> | undefined,
            })),
          );
          return;
        }

        const savedProjects = JSON.parse(localStorage.getItem("crm_projects") ?? "[]");
        const savedInventory = JSON.parse(localStorage.getItem("crm_inventory_items") ?? "[]");
        setSales(
          savedProjects.map((project: any) => ({
            id: project.id,
            customerName: project.customerName ?? "-",
            modelNo: project.modelNo ?? "",
            brand: project.brand ?? "",
            vehicleModel: project.vehicleModel ?? "",
            amount: Number(project.amount ?? 0),
            invoiceDate: project.invoiceDate ?? "",
          })),
        );
        setInventoryCosts(
          savedInventory.map((item: any) => ({
            modelNo: item.modelNo ?? "",
            vehicleModel: item.vehicleModel ?? "",
            costPrice: Number(item.costPrice ?? (Number(item.lotPrice ?? 0) + Number(item.transportationPrice ?? 0))),
            brand: item.brand ?? "",
            chassisColors: item.chassisColors as Record<string, string> | undefined,
          })),
        );
      } catch (error) {
        console.error("Unable to load project analysis:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAnalysis();
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SECURE_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password. Please try again.");
    }
  };

  const rows = useMemo(
    () =>
      sales.map((sale) => {
        const model = normalize(sale.modelNo);
        const inventory = inventoryCosts.find(
          (item) => normalize(item.modelNo) === model || normalize(item.vehicleModel) === model,
        );
        const costPrice = inventory?.costPrice ?? 0;
        return {
          ...sale,
          costPrice,
          profit: sale.amount - costPrice,
          hasCost: Boolean(inventory),
          brand: sale.brand || inventory?.brand || "Unknown",
          vehicleModel: sale.vehicleModel || inventory?.vehicleModel || sale.modelNo,
        };
      }),
    [inventoryCosts, sales],
  );

  const totals = useMemo(
    () => rows.reduce((sum, row) => ({ sales: sum.sales + row.amount, cost: sum.cost + row.costPrice, profit: sum.profit + row.profit }), { sales: 0, cost: 0, profit: 0 }),
    [rows],
  );

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    sales.forEach((sale) => {
      const monthKey = getMonthKey(sale.invoiceDate);
      if (monthKey) months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  }, [sales]);

  useEffect(() => {
    if (selectedMonth === "" && availableMonths.length > 0) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  const monthlySalesData = useMemo(() => {
    if (!selectedMonth) return [];
    
    const monthSales = rows.filter((row) => {
      const monthKey = getMonthKey(row.invoiceDate);
      return monthKey === selectedMonth;
    });

    const modelMap = new Map<string, MonthlySale>();

    monthSales.forEach((sale) => {
      const model = sale.modelNo || "Unknown";
      const existing = modelMap.get(model) || {
        model,
        count: 0,
        totalSales: 0,
        totalCost: 0,
        totalProfit: 0,
      };

      modelMap.set(model, {
        model,
        count: existing.count + 1,
        totalSales: existing.totalSales + sale.amount,
        totalCost: existing.totalCost + sale.costPrice,
        totalProfit: existing.totalProfit + sale.profit,
      });
    });

    return Array.from(modelMap.values()).sort((a, b) => b.count - a.count);
  }, [selectedMonth, rows]);

  const monthlyTotals = useMemo(() => {
    return monthlySalesData.reduce(
      (sum, item) => ({
        sales: sum.sales + item.totalSales,
        cost: sum.cost + item.totalCost,
        profit: sum.profit + item.totalProfit,
        count: sum.count + item.count,
      }),
      { sales: 0, cost: 0, profit: 0, count: 0 }
    );
  }, [monthlySalesData]);

  const brandAnalysis = useMemo(() => {
    const brandMap = new Map<string, BrandAnalysis>();

    rows.forEach((row) => {
      const brand = row.brand || "Unknown";
      const existing = brandMap.get(brand) || {
        brand,
        modelCount: 0,
        colorCount: 0,
        totalSales: 0,
        totalRevenue: 0,
        totalProfit: 0,
        percentage: 0,
      };

      const inventory = inventoryCosts.find((item) => normalize(item.modelNo) === normalize(row.modelNo) || normalize(item.vehicleModel) === normalize(row.modelNo));
      const colorCount = inventory?.chassisColors ? Object.keys(inventory.chassisColors).length : 0;

      brandMap.set(brand, {
        brand,
        modelCount: new Set(rows.filter((r) => r.brand === brand).map((r) => r.vehicleModel || r.modelNo)).size,
        colorCount: Math.max(existing.colorCount, colorCount),
        totalSales: existing.totalSales + 1,
        totalRevenue: existing.totalRevenue + row.amount,
        totalProfit: existing.totalProfit + row.profit,
        percentage: 0,
      });
    });

    const totalSales = rows.length || 1;
    return Array.from(brandMap.values())
      .map((b) => ({ ...b, percentage: (b.totalSales / totalSales) * 100 }))
      .sort((a, b) => b.totalSales - a.totalSales);
  }, [rows, inventoryCosts]);

  const colorAnalysis = useMemo(() => {
    const colorMap = new Map<string, ColorAnalysis>();

    rows.forEach((row) => {
      const inventory = inventoryCosts.find((item) => normalize(item.modelNo) === normalize(row.modelNo) || normalize(item.vehicleModel) === normalize(row.modelNo));
      
      if (inventory?.chassisColors) {
        Object.keys(inventory.chassisColors).forEach((color) => {
          const existing = colorMap.get(color) || {
            color,
            brands: new Set<string>(),
            models: new Set<string>(),
            totalSales: 0,
            totalRevenue: 0,
            percentage: 0,
          };

          existing.brands.add(row.brand || "Unknown");
          existing.models.add(row.vehicleModel || row.modelNo || "Unknown");
          existing.totalSales += 1;
          existing.totalRevenue += row.amount;

          colorMap.set(color, existing);
        });
      }
    });

    const totalSales = rows.length || 1;
    return Array.from(colorMap.values())
      .map((c) => ({ ...c, percentage: (c.totalSales / totalSales) * 100 }))
      .sort((a, b) => b.totalSales - a.totalSales);
  }, [rows, inventoryCosts]);

  const exportMonthlyExcel = () => {
    if (monthlySalesData.length === 0) {
      alert("No data to export for the selected month");
      return;
    }

    const csvContent = [
      [`Monthly Sales Report - ${formatMonthYear(selectedMonth)}`],
      [],
      ["Model", "Count", "Total Sales (₹)", "Total Cost (₹)", "Total Profit (₹)"],
      ...monthlySalesData.map((item) => [
        item.model,
        item.count,
        item.totalSales.toFixed(2),
        item.totalCost.toFixed(2),
        item.totalProfit.toFixed(2),
      ]),
      [],
      ["TOTAL", monthlyTotals.count, monthlyTotals.sales.toFixed(2), monthlyTotals.cost.toFixed(2), monthlyTotals.profit.toFixed(2)],
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `monthly-sales-${selectedMonth}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBrandReportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Brand-wise Sales Analysis Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 22);

    const tableData = brandAnalysis.map((brand) => [
      brand.brand,
      brand.modelCount.toString(),
      brand.colorCount.toString(),
      brand.totalSales.toString(),
      formatCurrency(brand.totalRevenue),
      formatCurrency(brand.totalProfit),
      brand.percentage.toFixed(2) + "%",
    ]);

    tableData.push([
      "TOTAL",
      "",
      "",
      rows.length.toString(),
      formatCurrency(totals.sales),
      formatCurrency(totals.profit),
      "100%",
    ]);

    (doc as any).autoTable({
      head: [["Brand", "Models", "Colors", "Units Sold", "Revenue", "Profit", "% Share"]],
      body: tableData,
      startY: 28,
      headStyles: { fillColor: [79, 70, 229] },
      bodyStyles: { textColor: [0, 0, 0] },
    });

    doc.save("brand-analysis-report.pdf");
  };

  const exportColorReportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Color-wise Sales Analysis Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 22);

    const tableData = colorAnalysis.map((color) => [
      color.color || "Not Specified",
      Array.from(color.brands).join(", "),
      Array.from(color.models).join(", "),
      color.totalSales.toString(),
      formatCurrency(color.totalRevenue),
      color.percentage.toFixed(2) + "%",
    ]);

    (doc as any).autoTable({
      head: [["Color", "Brands Available", "Models Available", "Units Sold", "Revenue", "% Share"]],
      body: tableData,
      startY: 28,
      headStyles: { fillColor: [34, 197, 94] },
      bodyStyles: { textColor: [0, 0, 0] },
    });

    doc.save("color-analysis-report.pdf");
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-background rounded-lg border border-border shadow-xl p-8">
              <div className="flex justify-center mb-6">
                <div className="bg-red-100 p-4 rounded-full">
                  <Lock className="h-8 w-8 text-red-600" />
                </div>
              </div>
              
              <h1 className="text-center text-2xl font-bold mb-2">Secure Analysis</h1>
              <p className="text-center text-muted-foreground mb-6">Enter password to access comprehensive analytical reports</p>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Master Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {passwordError}
                  </div>
                )}

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Unlock Analysis
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-6">
                Contact administrator for password reset
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto space-y-8 px-4 py-12">
        <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex items-start gap-4">
          <div className="rounded-md bg-indigo-100 p-3 text-indigo-700">
            <BarChart3 className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Project Analysis</h1>
            <p className="mt-1 text-muted-foreground">Comprehensive sales analytics by Brand, Model, and Color with easy-to-understand statistical reports.</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex flex-wrap gap-2 border-b border-border">
          {[
            { key: "all", label: "All Time" },
            { key: "monthly", label: "Monthly Report" },
            { key: "brand", label: "By Brand" },
            { key: "model", label: "By Model" },
            { key: "color", label: "By Color" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setViewMode(key as any)}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                viewMode === key
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {viewMode === "all" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Selling Price</p><p className="mt-2 text-2xl font-bold">{formatCurrency(totals.sales)}</p></div>
              <div className="rounded-lg border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Cost Price</p><p className="mt-2 text-2xl font-bold">{formatCurrency(totals.cost)}</p></div>
              <div className="rounded-lg border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Profit (Selling − Cost)</p><p className="mt-2 text-2xl font-bold">{formatCurrency(totals.profit)}</p></div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Sales analysis</h2>
              {isLoading ? <p className="text-muted-foreground">Loading sales and inventory costs...</p> : rows.length === 0 ? <p className="text-muted-foreground">No sales entries are available yet.</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead><tr className="border-b border-border text-left"><th className="px-3 py-3">Customer Name</th><th className="px-3 py-3">Model</th><th className="px-3 py-3">Brand</th><th className="px-3 py-3">Selling Price</th><th className="px-3 py-3">Cost Price</th><th className="px-3 py-3">Profit (Selling − Cost)</th></tr></thead>
                    <tbody>{rows.map((row) => <tr key={row.id} className="border-b border-border"><td className="px-3 py-3">{row.customerName}</td><td className="px-3 py-3">{row.modelNo || "-"}</td><td className="px-3 py-3">{row.brand}</td><td className="px-3 py-3">{formatCurrency(row.amount)}</td><td className="px-3 py-3">{row.hasCost ? formatCurrency(row.costPrice) : "Cost not added"}</td><td className="px-3 py-3 font-semibold">{row.hasCost ? formatCurrency(row.profit) : "-"}</td></tr>)}</tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : viewMode === "brand" ? (
          <>
            <div className="flex justify-end gap-2 mb-4">
              <Button onClick={exportBrandReportPDF} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Total Brands</p>
                <p className="mt-2 text-2xl font-bold">{brandAnalysis.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Total Units Sold</p>
                <p className="mt-2 text-2xl font-bold">{rows.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="mt-2 text-2xl font-bold">{formatCurrency(totals.sales)}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Total Profit</p>
                <p className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(totals.profit)}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-6 text-xl font-semibold">Brand-wise Statistical Analysis</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Market Share by Brand</h3>
                  <div className="space-y-3">
                    {brandAnalysis.map((brand) => (
                      <div key={brand.brand}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">{brand.brand}</span>
                          <span className="text-muted-foreground">{brand.totalSales} units ({brand.percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all"
                            style={{ width: `${brand.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Detailed Brand Report</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-3 py-3">Brand</th>
                      <th className="px-3 py-3">Models</th>
                      <th className="px-3 py-3">Colors</th>
                      <th className="px-3 py-3">Units Sold</th>
                      <th className="px-3 py-3">Total Revenue</th>
                      <th className="px-3 py-3">Total Profit</th>
                      <th className="px-3 py-3">Market Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brandAnalysis.map((brand) => (
                      <tr key={brand.brand} className="border-b border-border">
                        <td className="px-3 py-3 font-medium">{brand.brand}</td>
                        <td className="px-3 py-3">{brand.modelCount}</td>
                        <td className="px-3 py-3">{brand.colorCount}</td>
                        <td className="px-3 py-3">{brand.totalSales}</td>
                        <td className="px-3 py-3">{formatCurrency(brand.totalRevenue)}</td>
                        <td className="px-3 py-3 font-semibold text-green-600">{formatCurrency(brand.totalProfit)}</td>
                        <td className="px-3 py-3">{brand.percentage.toFixed(2)}%</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-border bg-muted/50 font-bold">
                      <td colSpan={3} className="px-3 py-3">TOTAL</td>
                      <td className="px-3 py-3">{rows.length}</td>
                      <td className="px-3 py-3">{formatCurrency(totals.sales)}</td>
                      <td className="px-3 py-3 text-green-600">{formatCurrency(totals.profit)}</td>
                      <td className="px-3 py-3">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : viewMode === "color" ? (
          <>
            <div className="flex justify-end gap-2 mb-4">
              <Button onClick={exportColorReportPDF} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Total Colors</p>
                <p className="mt-2 text-2xl font-bold">{colorAnalysis.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Unique Brands</p>
                <p className="mt-2 text-2xl font-bold">{new Set(colorAnalysis.flatMap((c) => Array.from(c.brands))).size}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Unique Models</p>
                <p className="mt-2 text-2xl font-bold">{new Set(colorAnalysis.flatMap((c) => Array.from(c.models))).size}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="mt-2 text-2xl font-bold">{formatCurrency(colorAnalysis.reduce((sum, c) => sum + c.totalRevenue, 0))}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-6 text-xl font-semibold">Color-wise Statistical Analysis</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Color Popularity Distribution</h3>
                  <div className="space-y-3">
                    {colorAnalysis.map((color) => (
                      <div key={color.color}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">{color.color || "Not Specified"}</span>
                          <span className="text-muted-foreground">{color.totalSales} units ({color.percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all"
                            style={{ width: `${color.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Detailed Color Report</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-3 py-3">Color</th>
                      <th className="px-3 py-3">Available Brands</th>
                      <th className="px-3 py-3">Available Models</th>
                      <th className="px-3 py-3">Units Sold</th>
                      <th className="px-3 py-3">Revenue</th>
                      <th className="px-3 py-3">Popularity %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colorAnalysis.map((color) => (
                      <tr key={color.color} className="border-b border-border">
                        <td className="px-3 py-3 font-medium">{color.color || "Not Specified"}</td>
                        <td className="px-3 py-3">{Array.from(color.brands).join(", ")}</td>
                        <td className="px-3 py-3">{Array.from(color.models).join(", ")}</td>
                        <td className="px-3 py-3">{color.totalSales}</td>
                        <td className="px-3 py-3">{formatCurrency(color.totalRevenue)}</td>
                        <td className="px-3 py-3 font-semibold">{color.percentage.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Month Selection */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="text-sm font-semibold">Select Month:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {formatMonthYear(month)}
                  </option>
                ))}
              </select>
              <Button
                onClick={exportMonthlyExcel}
                variant="outline"
                className="gap-2 ml-auto"
                disabled={monthlySalesData.length === 0}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>

            {/* Monthly Summary Cards */}
            {selectedMonth && (
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-lg border border-border bg-card p-5">
                  <p className="text-sm text-muted-foreground">Vehicles Sold</p>
                  <p className="mt-2 text-2xl font-bold">{monthlyTotals.count}</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-5">
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="mt-2 text-2xl font-bold">{formatCurrency(monthlyTotals.sales)}</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-5">
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="mt-2 text-2xl font-bold">{formatCurrency(monthlyTotals.cost)}</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-5">
                  <p className="text-sm text-muted-foreground">Total Profit</p>
                  <p className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(monthlyTotals.profit)}</p>
                </div>
              </div>
            )}

            {/* Monthly Model-wise Breakdown */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">
                {selectedMonth ? `Model-wise Sales - ${formatMonthYear(selectedMonth)}` : "Model-wise Sales"}
              </h2>

              {isLoading ? (
                <p className="text-muted-foreground">Loading data...</p>
              ) : monthlySalesData.length === 0 ? (
                <p className="text-muted-foreground">No sales for the selected month.</p>
              ) : (
                <>
                  {/* Bar Chart using CSS */}
                  <div className="space-y-4 mb-8">
                    <div>
                      <h3 className="font-semibold mb-4">Sales Count by Model</h3>
                      <div className="space-y-2">
                        {monthlySalesData.map((item) => {
                          const maxCount = Math.max(...monthlySalesData.map((m) => m.count), 1);
                          const percentage = (item.count / maxCount) * 100;
                          return (
                            <div key={item.model}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">{item.model || "Unknown"}</span>
                                <span className="text-muted-foreground">{item.count} units</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-6 overflow-hidden">
                                <div
                                  className="bg-primary h-full rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Sales Revenue Chart */}
                  <div className="space-y-4 mb-8">
                    <div>
                      <h3 className="font-semibold mb-4">Revenue by Model</h3>
                      <div className="space-y-2">
                        {monthlySalesData.map((item) => {
                          const maxSales = Math.max(...monthlySalesData.map((m) => m.totalSales), 1);
                          const percentage = (item.totalSales / maxSales) * 100;
                          return (
                            <div key={`revenue-${item.model}`}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">{item.model || "Unknown"}</span>
                                <span className="text-muted-foreground">{formatCurrency(item.totalSales)}</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-6 overflow-hidden">
                                <div
                                  className="bg-green-600 h-full rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-sm">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="px-3 py-3">Model</th>
                          <th className="px-3 py-3">Count</th>
                          <th className="px-3 py-3">Total Sales</th>
                          <th className="px-3 py-3">Total Cost</th>
                          <th className="px-3 py-3">Total Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlySalesData.map((item) => (
                          <tr key={item.model} className="border-b border-border">
                            <td className="px-3 py-3 font-medium">{item.model || "Unknown"}</td>
                            <td className="px-3 py-3">{item.count}</td>
                            <td className="px-3 py-3">{formatCurrency(item.totalSales)}</td>
                            <td className="px-3 py-3">{formatCurrency(item.totalCost)}</td>
                            <td className="px-3 py-3 font-semibold text-green-600">{formatCurrency(item.totalProfit)}</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-border bg-muted/50 font-bold">
                          <td className="px-3 py-3">TOTAL</td>
                          <td className="px-3 py-3">{monthlyTotals.count}</td>
                          <td className="px-3 py-3">{formatCurrency(monthlyTotals.sales)}</td>
                          <td className="px-3 py-3">{formatCurrency(monthlyTotals.cost)}</td>
                          <td className="px-3 py-3 text-green-600">{formatCurrency(monthlyTotals.profit)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
