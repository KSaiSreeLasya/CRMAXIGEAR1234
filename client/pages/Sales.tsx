import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";

export default function Sales() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Sales Pipeline</h1>
            <p className="text-muted-foreground">
              Track and manage all your EV bike sales opportunities with retailers.
            </p>
          </div>

          {/* Placeholder Content */}
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <div className="space-y-4 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold">Sales Pipeline</h2>
              <p className="text-muted-foreground">
                This page will display your sales pipeline with stages, deals, and retailer information.
              </p>
              <div className="bg-primary/10 rounded-lg p-6 my-6">
                <div className="flex items-center justify-center gap-3 text-primary font-semibold">
                  <Plus className="w-5 h-5" />
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
