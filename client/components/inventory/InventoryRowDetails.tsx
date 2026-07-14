import { X } from "lucide-react";
import { InventoryItem } from "@/types/inventory";

interface InventoryRowDetailsProps {
  item: InventoryItem | null;
  onClose: () => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

export function InventoryRowDetails({
  item,
  onClose,
  onEdit,
  onDelete,
}: InventoryRowDetailsProps) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg border border-border shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Inventory Details - Row {item.slNo}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Basic Info Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Sl. No</p>
                <p className="font-semibold">{item.slNo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Model No</p>
                <p className="font-semibold">{item.modelNo || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Brand</p>
                <p className="font-semibold">{item.brand || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehicle Model</p>
                <p className="font-semibold">{item.vehicleModel || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">HSN No</p>
                <p className="font-semibold">{item.hsnNo || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Manufacturer Inv No</p>
                <p className="font-semibold">{item.manufacturerInvNo || "-"}</p>
              </div>
            </div>
          </div>

          {/* Vehicle Count Section */}
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100">Vehicle Count Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Total Vehicle Count</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{item.vehicleCount}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Sales Count</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{item.salesCount}</p>
              </div>
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Closing Stock</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{item.closingStock}</p>
              </div>
            </div>
          </div>

          {/* Chassis Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Chassis Information</h3>
            <div className="space-y-4">
              {item.chassisNo && (
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">Current Chassis (Unsold)</p>
                  <p className="text-sm whitespace-pre-wrap break-words">{item.chassisNo}</p>
                </div>
              )}
              {item.previousChassisNo && (
                <div className="bg-gray-50 dark:bg-gray-950/20 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Previous Chassis (Sold)</p>
                  <p className="text-sm whitespace-pre-wrap break-words">{item.previousChassisNo}</p>
                </div>
              )}
              {!item.chassisNo && !item.previousChassisNo && (
                <p className="text-muted-foreground">No chassis numbers available</p>
              )}
            </div>
          </div>

          {/* Battery Information */}
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <h3 className="text-lg font-semibold mb-4 text-amber-900 dark:text-amber-100">Battery Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-amber-700 dark:text-amber-300">Battery Model</p>
                <p className="font-semibold">{item.batteryModel || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-amber-700 dark:text-amber-300">Battery No</p>
                <p className="font-semibold">{item.batteryNo || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-amber-700 dark:text-amber-300">Battery Count</p>
                <p className="font-semibold">{item.batteryCount}</p>
              </div>
            </div>
          </div>

          {/* Motor Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Motor Information</h3>
            <div>
              <p className="text-sm text-muted-foreground">Motor No</p>
              <p className="font-semibold">{item.motorNo || "-"}</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Created on: {item.createdAt}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onEdit(item);
              onClose();
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Delete this inventory row?")) {
                onDelete(item.id);
                onClose();
              }
            }}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
