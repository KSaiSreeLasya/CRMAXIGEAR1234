import { useState, useRef } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { importFromCSV, importFromExcel, exportToCSV, exportToExcel, exportToPDF, COLUMN_MAPPINGS } from "@/utils/importExport";

interface ImportExportProps {
  data: any[];
  onImport: (items: Record<string, any>[]) => Promise<void>;
  dataType: keyof typeof COLUMN_MAPPINGS;
  exportHeaders: string[];
  filename: string;
  title: string;
  showCsvExport?: boolean;
  showPdfExport?: boolean;
}

export function ImportExport({
  data,
  onImport,
  dataType,
  exportHeaders,
  filename,
  title,
  showCsvExport = false,
  showPdfExport = false,
}: ImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);

    try {
      let imported: Record<string, any>[] = [];

      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        imported = await importFromCSV(file, dataType);
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        imported = await importFromExcel(file, dataType);
      } else {
        throw new Error("Please upload a CSV or Excel file");
      }

      if (imported.length === 0) {
        throw new Error("No valid records found in the file");
      }

      await onImport(imported);
      setImportError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      setImportError(error.message || "Import failed");
      console.error("Import error:", error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* Import Button */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={handleFileChange}
            disabled={isImporting}
            className="hidden"
            aria-label={`Import ${dataType} file`}
          />
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            <Upload className="w-4 h-4" />
            {isImporting ? "Importing..." : "Import CSV/Excel"}
          </Button>
        </div>

        {/* Export Buttons */}
        {showCsvExport && (
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => exportToCSV(data, exportHeaders, filename)}
            disabled={data.length === 0}
            title={`Download ${dataType} as CSV`}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => exportToExcel(data, exportHeaders, filename)}
          disabled={data.length === 0}
          title={`Download ${dataType} as Excel`}
        >
          <Download className="w-4 h-4" />
          Export Excel
        </Button>

        {showPdfExport && (
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => exportToPDF(data, exportHeaders, `${filename}.pdf`, title)}
            disabled={data.length === 0}
            title={`Download ${dataType} as PDF`}
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        )}
      </div>

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        CSV/Excel files must have headers matching column names (e.g., {exportHeaders.slice(0, 2).join(", ")}, etc.)
      </p>

      {/* Error Message */}
      {importError && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
          {importError}
        </div>
      )}
    </div>
  );
}
