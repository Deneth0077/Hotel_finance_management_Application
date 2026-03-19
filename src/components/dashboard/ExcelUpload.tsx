"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, X, FileSpreadsheet } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface ExcelUploadProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ExcelUpload({ onClose, onSuccess }: ExcelUploadProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async (data: any[]) => {
      const res = await fetch("/api/inventory/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to upload items");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success(`${data.length} items added successfully via Excel`);
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".xlsx") && !selectedFile.name.endsWith(".xls") && !selectedFile.name.endsWith(".csv")) {
        toast.error("Please upload an Excel or CSV file");
        return;
      }
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      // Expected format: name, category, currentStock, minThreshold, unit, supplier
      // We should map variations like "Item Name" to "name"
      const mappedData = data.map((item: any) => ({
        name: item.name || item["Item Name"] || item["Name"],
        category: item.category || item["Category"] || "General",
        currentStock: Number(item.currentStock || item["Stock"] || item["Current Stock"] || 0),
        minThreshold: Number(item.minThreshold || item["Threshold"] || 5),
        unit: item.unit || item["Unit"] || "pieces",
        supplier: item.supplier || item["Supplier"] || "",
      }));

      // Filter out items without names
      const validData = mappedData.filter(item => item.name);
      setPreview(validData);
    };
    reader.readAsBinaryString(file);
  };

  const handleUpload = () => {
    if (preview.length === 0) {
      toast.error("No valid items found in the file");
      return;
    }
    mutation.mutate(preview);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-background p-6 shadow-2xl border animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2 text-green-600">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">Bulk Upload Items</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center gap-4 hover:bg-muted/50 cursor-pointer transition-colors group"
          >
            <div className="rounded-full bg-primary/10 p-4 text-primary group-hover:scale-110 transition-transform">
              <Upload className="h-8 w-8" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">Click to select file</p>
              <p className="text-sm text-muted-foreground">Excel (.xlsx, .xls) or CSV</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept=".xlsx,.xls,.csv" 
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB • {preview.length} items detected</p>
                </div>
              </div>
              <button 
                onClick={() => { setFile(null); setPreview([]); }}
                className="text-red-500 hover:text-red-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr className="border-b">
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-left">Stock</th>
                    <th className="p-2 text-left">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 10).map((item, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">{item.category}</td>
                      <td className="p-2">{item.currentStock}</td>
                      <td className="p-2">{item.unit}</td>
                    </tr>
                  ))}
                  {preview.length > 10 && (
                    <tr>
                      <td colSpan={4} className="p-2 text-center text-muted-foreground">
                        And {preview.length - 10} more items...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border py-2 text-sm font-semibold hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={mutation.isPending}
                onClick={handleUpload}
                className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
              >
                {mutation.isPending ? "Uploading..." : `Upload ${preview.length} Items`}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <p className="font-bold mb-1 uppercase tracking-wider">Excel Format Guide:</p>
          <p>Headers should include: <strong>name, category, currentStock, minThreshold, unit, supplier</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-0.5 opacity-80">
            <li><strong>Category:</strong> Kitchen, General, or any custom category you've created</li>
            <li><strong>Stock & Threshold:</strong> Must be numbers</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
