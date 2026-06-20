import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Check, Loader2, FileText } from "lucide-react";

interface ReceiptData {
  merchant: string;
  date: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  tax: number;
  currency: string;
}

interface ReceiptScannerProps {
  onScan: (data: ReceiptData) => void;
  onClose: () => void;
}

export default function ReceiptScanner({ onScan, onClose }: ReceiptScannerProps) {
  const [step, setStep] = useState<"capture" | "preview" | "result">("capture");
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setStep("preview");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL("image/jpeg");
      setImage(imageData);
      setStep("preview");

      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Camera access denied:", error);
    }
  };

  const processReceipt = async () => {
    setIsProcessing(true);

    // Simulate OCR processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockData: ReceiptData = {
      merchant: "Sample Store",
      date: new Date().toISOString().split("T")[0],
      total: 1250,
      items: [
        { name: "Item 1", quantity: 2, price: 300 },
        { name: "Item 2", quantity: 1, price: 450 },
        { name: "Item 3", quantity: 3, price: 200 },
      ],
      tax: 100,
      currency: "BDT",
    };

    setReceiptData(mockData);
    setIsProcessing(false);
    setStep("result");
  };

  const handleConfirm = () => {
    if (receiptData) {
      onScan(receiptData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 safe-area-pb safe-area-pt"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Scan Receipt</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === "capture" && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleCapture}
                  className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-8 hover:border-primary transition-colors"
                >
                  <Camera className="h-12 w-12 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Take Photo</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-8 hover:border-primary transition-colors"
                >
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Upload Image</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              <p className="text-xs text-muted-foreground text-center">
                Supports JPG, PNG images. Receipt will be scanned using OCR.
              </p>
            </motion.div>
          )}

          {step === "preview" && image && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={image}
                  alt="Receipt"
                  className="w-full h-64 object-contain bg-black/20"
                />
                <button
                  onClick={() => {
                    setImage(null);
                    setStep("capture");
                  }}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setImage(null);
                    setStep("capture");
                  }}
                  className="flex-1 py-2 text-sm text-muted-foreground border border-border rounded-lg hover:bg-accent"
                >
                  Retake
                </button>
                <button
                  onClick={processReceipt}
                  disabled={isProcessing}
                  className="flex-1 py-2 text-sm text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Scanning...
                    </span>
                  ) : (
                    "Scan Receipt"
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === "result" && receiptData && (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-medium">Receipt Data</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Merchant:</span>
                    <span>{receiptData.merchant}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{receiptData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items:</span>
                    <span>{receiptData.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax:</span>
                    <span>৳{receiptData.tax}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t border-white/10">
                    <span>Total:</span>
                    <span className="text-primary">৳{receiptData.total}</span>
                  </div>
                </div>

                {receiptData.items.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <p className="text-xs text-muted-foreground mb-2">Items:</p>
                    {receiptData.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs mb-1">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span>৳{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setReceiptData(null);
                    setImage(null);
                    setStep("capture");
                  }}
                  className="flex-1 py-2 text-sm text-muted-foreground border border-border rounded-lg hover:bg-accent"
                >
                  Scan Again
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-2 text-sm text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Add Transaction
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
