import { useState } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DealersTab from "@/components/dealers/DealersTab";
import ProductsTab from "@/components/dealers/ProductsTab";

export default function Dealers() {
  const [dealers, setDealers] = useState<
    Array<{ id: string; name: string; contactNo: string; address: string }>
  >([]);

  const [products, setProducts] = useState<Array<any>>([]);

  const addDealer = (dealer: {
    name: string;
    contactNo: string;
    address: string;
  }) => {
    const newDealer = {
      id: Date.now().toString(),
      ...dealer,
    };
    setDealers([...dealers, newDealer]);
  };

  const deleteDealer = (id: string) => {
    setDealers(dealers.filter((d) => d.id !== id));
  };

  const addProduct = (product: any) => {
    const newProduct = {
      id: Date.now().toString(),
      ...product,
    };
    setProducts([...products, newProduct]);
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dealers</h1>
            <p className="text-muted-foreground">
              Manage dealers and their products
            </p>
          </div>

          <Tabs defaultValue="dealers" className="w-full">
            <TabsList>
              <TabsTrigger value="dealers">Dealers</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>

            <TabsContent value="dealers" className="space-y-6">
              <DealersTab
                dealers={dealers}
                onAddDealer={addDealer}
                onDeleteDealer={deleteDealer}
              />
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <ProductsTab
                dealers={dealers}
                products={products}
                onAddProduct={addProduct}
                onDeleteProduct={deleteProduct}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
