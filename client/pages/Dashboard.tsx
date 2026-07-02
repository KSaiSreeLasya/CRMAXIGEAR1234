import Layout from "@/components/Layout";
import { Briefcase, CalendarCheck2, Boxes, ShieldCheck, Wrench, Users, Receipt, Truck, AlertCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Delivery {
  id: string;
  delivery_date: string;
  status: string;
}

interface DashboardStats {
  upcomingDeliveryCount: number;
  totalSales: number;
  totalInventoryItems: number;
  totalEmployees: number;
  pendingDeliveries: number;
  totalDealers: number;
  loading: boolean;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    upcomingDeliveryCount: 0,
    totalSales: 0,
    totalInventoryItems: 0,
    totalEmployees: 0,
    pendingDeliveries: 0,
    totalDealers: 0,
    loading: true,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true }));

      let dashboardData: DashboardStats = {
        upcomingDeliveryCount: 0,
        totalSales: 0,
        totalInventoryItems: 0,
        totalEmployees: 0,
        pendingDeliveries: 0,
        totalDealers: 0,
        loading: true,
      };

      if (supabase) {
        try {
          // Fetch deliveries data
          const { data: deliveriesData } = await supabase
            .from("deliveries")
            .select("id, delivery_date, status")
            .neq("status", "completed");

          if (deliveriesData) {
            const now = new Date();
            const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

            const upcoming = (deliveriesData as Delivery[]).filter((delivery) => {
              const deliveryDate = new Date(delivery.delivery_date);
              return deliveryDate >= now && deliveryDate <= oneWeekFromNow;
            });

            dashboardData.upcomingDeliveryCount = upcoming.length;
            dashboardData.pendingDeliveries = deliveriesData.length;
          }
        } catch (err) {
          console.log("Deliveries table may not exist yet");
        }

        try {
          // Fetch estimations (Sales)
          const { data: estimationsData } = await supabase
            .from("estimations")
            .select("id");

          dashboardData.totalSales = estimationsData?.length || 0;
        } catch (err) {
          console.log("Estimations table may not exist yet");
        }

        try {
          // Fetch inventory items
          const { data: inventoryData } = await supabase
            .from("inventory_items")
            .select("id");

          dashboardData.totalInventoryItems = inventoryData?.length || 0;
        } catch (err) {
          console.log("Inventory items table may not exist yet");
        }

        try {
          // Fetch employees
          const { data: employeesData } = await supabase
            .from("employees")
            .select("id");

          dashboardData.totalEmployees = employeesData?.length || 0;
        } catch (err) {
          console.log("Employees table may not exist yet");
        }

        try {
          // Fetch dealers
          const { data: dealersData } = await supabase
            .from("dealers")
            .select("id");

          dashboardData.totalDealers = dealersData?.length || 0;
        } catch (err) {
          console.log("Dealers table may not exist yet");
        }
      }

      setStats({ ...dashboardData, loading: false });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Choose a module to continue.
            </p>
          </div>

          {stats.upcomingDeliveryCount > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-orange-900">Upcoming Deliveries</h3>
                <p className="text-sm text-orange-800">
                  You have <span className="font-bold">{stats.upcomingDeliveryCount}</span> delivery{stats.upcomingDeliveryCount !== 1 ? 'ies' : ''} due in the next 7 days. Click the DELIVERY tile to view details.
                </p>
              </div>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 mb-6">
            <StatCard
              title="Total Sales"
              value={stats.totalSales}
              icon={<Briefcase className="h-5 w-5" />}
              color="bg-primary/10 text-primary"
              loading={stats.loading}
            />
            <StatCard
              title="Inventory Items"
              value={stats.totalInventoryItems}
              icon={<Boxes className="h-5 w-5" />}
              color="bg-amber-100 text-amber-700"
              loading={stats.loading}
            />
            <StatCard
              title="Employees"
              value={stats.totalEmployees}
              icon={<Users className="h-5 w-5" />}
              color="bg-emerald-100 text-emerald-700"
              loading={stats.loading}
            />
            <StatCard
              title="Dealers"
              value={stats.totalDealers}
              icon={<Users className="h-5 w-5" />}
              color="bg-violet-100 text-violet-700"
              loading={stats.loading}
            />
            <StatCard
              title="Pending Deliveries"
              value={stats.pendingDeliveries}
              icon={<Truck className="h-5 w-5" />}
              color="bg-pink-100 text-pink-700"
              loading={stats.loading}
            />
            <StatCard
              title="Attendance"
              value="View"
              icon={<CalendarCheck2 className="h-5 w-5" />}
              color="bg-blue-100 text-blue-700"
              loading={stats.loading}
              isLink={true}
            />
          </div>

          {/* Modules Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl">
            <Link
              to="/projects"
              className="rounded-lg border border-border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-md bg-primary/10 p-3 text-primary">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">SALES</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage account entries and invoices.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/attendance"
              className="rounded-lg border border-border bg-card p-6 text-left hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-md bg-blue-100 p-3 text-blue-700">
                  <CalendarCheck2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">ATTENDANCE</h2>
                  <p className="text-sm text-muted-foreground">
                    Mark daily attendance and track status.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/inventory"
              className="rounded-lg border border-border bg-card p-6 text-left hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-md bg-amber-100 p-3 text-amber-700">
                  <Boxes className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">INVENTORY</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage vehicle stock, battery count and closing stock.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/service-invoice"
              className="rounded-lg border border-border bg-card p-6 text-left hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-md bg-orange-100 p-3 text-orange-700">
                  <Wrench className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">SERVICE</h2>
                  <p className="text-sm text-muted-foreground">
                    Create and manage service invoices with PDF export.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/dealers"
              className="rounded-lg border border-border bg-card p-6 text-left hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-md bg-violet-100 p-3 text-violet-700">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">DEALERS</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage dealers and their products.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/dealer-invoice"
              className="rounded-lg border border-border bg-card p-6 text-left hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-md bg-cyan-100 p-3 text-cyan-700">
                  <Receipt className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">DEALER INVOICE</h2>
                  <p className="text-sm text-muted-foreground">
                    Create and manage dealer product invoices.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin-employees"
              className="rounded-lg border border-border bg-card p-6 text-left hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-md bg-emerald-100 p-3 text-emerald-700">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">ADMIN</h2>
                  <p className="text-sm text-muted-foreground">
                    Add and manage employees from one place.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/delivery"
              className="rounded-lg border border-border bg-card p-6 text-left hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-md bg-pink-100 p-3 text-pink-700">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">DELIVERY</h2>
                  <p className="text-sm text-muted-foreground">
                    Track deliverables and delivery dates.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
  isLink?: boolean;
}

function StatCard({ title, value, icon, color, loading, isLink }: StatCardProps) {
  const content = (
    <div className="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-all h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={`rounded-md p-2 ${color}`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold">
        {loading ? (
          <div className="h-8 w-12 bg-muted animate-pulse rounded" />
        ) : (
          value
        )}
      </div>
    </div>
  );

  if (isLink) {
    return (
      <Link to="/attendance" className="block">
        {content}
      </Link>
    );
  }

  return content;
}
