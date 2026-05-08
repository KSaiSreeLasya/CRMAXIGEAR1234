import Layout from "@/components/Layout";
import { TrendingUp } from "lucide-react";

export default function Analytics() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics & Reporting</h1>
            <p className="text-muted-foreground">
              Deep insights into your EV bike sales data and retailer performance metrics.
            </p>
          </div>

          {/* Placeholder Content */}
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <div className="space-y-4 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
              <p className="text-muted-foreground">
                View sales trends, retailer performance, inventory tracking, and market insights.
              </p>
              <div className="bg-primary/10 rounded-lg p-6 my-6">
                <div className="flex items-center justify-center gap-3 text-primary font-semibold">
                  <TrendingUp className="w-5 h-5" />
                  <span>Coming Soon</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Continue customizing this section to match your needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
