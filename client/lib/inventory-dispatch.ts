import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

export interface InventoryTransfer {
  id: string;
  sku: string;
  name: string;
  category: "vehicles" | "spares";
  quantity: number;
  sender: string;
  receiver_id: string;
  receiver_name?: string;
  status: "Pending Acceptance" | "Accepted" | "Rejected" | "Delivered";
  date: string;
  chassis_no?: string;
  motor_no?: string;
  battery_no?: string;
  created_at?: string;
}

export async function fetchInventoryTransfers() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("dms_inventory_transfers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching inventory transfers:", error);
    return [];
  }
  return data || [];
}

export async function allocateInventoryToDealer(allocation: {
  sku: string;
  productName: string;
  category: "vehicles" | "spares";
  quantity: number;
  dealerId: string;
  chassisNo?: string;
  motorNo?: string;
  batteryNo?: string;
}) {
  if (!supabase) return null;

  const transferId = `TRSF-${Math.floor(1000 + Math.random() * 9000)}`;
  const today = new Date().toISOString().split("T")[0];

  try {
    // First, reduce inventory immediately
    if (allocation.category === "vehicles") {
      const { data: inventoryData, error: invFetchError } = await supabase
        .from("inventory_items")
        .select("id, vehicle_count, sales_count, closing_stock")
        .ilike("model_no", `%${allocation.sku}%`)
        .single();

      if (!invFetchError && inventoryData) {
        const newVehicleCount = Math.max(0, inventoryData.vehicle_count - allocation.quantity);
        const newClosingStock = newVehicleCount - inventoryData.sales_count;

        const { error: updateInventoryError } = await supabase
          .from("inventory_items")
          .update({
            vehicle_count: newVehicleCount,
            closing_stock: Math.max(0, newClosingStock),
          })
          .eq("id", inventoryData.id);

        if (updateInventoryError) {
          console.error("Error reducing vehicle inventory:", updateInventoryError.message);
          return null;
        }
      }
    } else if (allocation.category === "spares") {
      const { data: spareData, error: spareFetchError } = await supabase
        .from("spares_inventory")
        .select("id, qty")
        .ilike("part_name", `%${allocation.sku}%`)
        .single();

      if (!spareFetchError && spareData) {
        const newQty = Math.max(0, spareData.qty - allocation.quantity);

        const { error: updateSpareError } = await supabase
          .from("spares_inventory")
          .update({
            qty: newQty,
          })
          .eq("id", spareData.id);

        if (updateSpareError) {
          console.error("Error reducing spare inventory:", updateSpareError.message);
          return null;
        }
      }
    }

    // Create the transfer record
    const { data, error } = await supabase
      .from("dms_inventory_transfers")
      .insert([
        {
          id: transferId,
          sku: allocation.sku,
          name: allocation.productName,
          category: allocation.category,
          quantity: allocation.quantity,
          sender: "Central HQ (crm.axigearelectric.com)",
          receiver_id: allocation.dealerId,
          status: "Pending Acceptance",
          date: today,
          chassis_no: allocation.chassisNo || null,
          motor_no: allocation.motorNo || null,
          battery_no: allocation.batteryNo || null,
        },
      ])
      .select("*");

    if (error) {
      console.error("Failed to dispatch shipment:", error.message);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error("Error in allocateInventoryToDealer:", error);
    return null;
  }
}

export async function updateTransferStatus(
  transferId: string,
  status: "Pending Acceptance" | "Accepted" | "Rejected" | "Delivered"
) {
  if (!supabase) return false;

  try {
    // Fetch the transfer details first to determine what to do
    const { data: transferData, error: fetchError } = await supabase
      .from("dms_inventory_transfers")
      .select("*")
      .eq("id", transferId)
      .single();

    if (fetchError || !transferData) {
      console.error("Error fetching transfer details:", fetchError?.message);
      return false;
    }

    const transfer = transferData as any;

    // If status is "Rejected", restore inventory (inventory was already reduced when dispatched)
    if (status === "Rejected") {
      if (transfer.category === "vehicles") {
        const { data: inventoryData, error: invFetchError } = await supabase
          .from("inventory_items")
          .select("id, vehicle_count, sales_count, closing_stock")
          .ilike("model_no", `%${transfer.sku}%`)
          .single();

        if (!invFetchError && inventoryData) {
          const newVehicleCount = inventoryData.vehicle_count + transfer.quantity;
          const newClosingStock = newVehicleCount - inventoryData.sales_count;

          const { error: updateInventoryError } = await supabase
            .from("inventory_items")
            .update({
              vehicle_count: newVehicleCount,
              closing_stock: newClosingStock,
            })
            .eq("id", inventoryData.id);

          if (updateInventoryError) {
            console.error("Error restoring vehicle inventory:", updateInventoryError.message);
          }
        }
      } else if (transfer.category === "spares") {
        const { data: spareData, error: spareFetchError } = await supabase
          .from("spares_inventory")
          .select("id, qty")
          .ilike("part_name", `%${transfer.sku}%`)
          .single();

        if (!spareFetchError && spareData) {
          const newQty = spareData.qty + transfer.quantity;

          const { error: updateSpareError } = await supabase
            .from("spares_inventory")
            .update({
              qty: newQty,
            })
            .eq("id", spareData.id);

          if (updateSpareError) {
            console.error("Error restoring spare inventory:", updateSpareError.message);
          }
        }
      }
    }

    // Update the transfer status
    const { error: updateError } = await supabase
      .from("dms_inventory_transfers")
      .update({ status })
      .eq("id", transferId);

    if (updateError) {
      console.error("Error updating transfer status:", updateError.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateTransferStatus:", error);
    return false;
  }
}

export async function deleteInventoryTransfer(transferId: string) {
  if (!supabase) return false;

  const { error } = await supabase
    .from("dms_inventory_transfers")
    .delete()
    .eq("id", transferId);

  if (error) {
    console.error("Error deleting transfer:", error.message);
    return false;
  }

  return true;
}
