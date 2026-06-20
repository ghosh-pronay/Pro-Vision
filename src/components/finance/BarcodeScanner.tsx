import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Search, Package, ExternalLink } from "lucide-react";

interface Product {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  image?: string;
  prices?: Array<{
    store: string;
    price: number;
    url?: string;
  }>;
}

interface BarcodeScannerProps {
  onScan: (product: Product) => void;
  onClose: () => void;
}

const MOCK_PRODUCTS: Record<string, Product> = {
  "8901234567890": {
    barcode: "8901234567890",
    name: "Parle-G Biscuit",
    brand: "Parle",
    category: "Snacks",
    image: "https://via.placeholder.com/100",
    prices: [
      { store: "Chaldal", price: 15, url: "https://chaldal.com" },
      { store: "Shwapno", price: 16 },
      { store: "Agora", price: 15.5 },
    ],
  },
  "8901042011015": {
    barcode: "8901042011015",
    name: "Maggi Noodles",
    brand: "Nestle",
    category: "Food",
    image: "https://via.placeholder.com/100",
    prices: [
      { store: "Chaldal", price: 14, url: "https://chaldal.com" },
      { store: "Shwapno", price: 15 },
      { store: "Agora", price: 14.5 },
    ],
  },
  "8941101310013": {
    barcode: "8941101310013",
    name: "Lays Classic Salted",
    brand: "Lays",
    category: "Snacks",
    image: "https://via.placeholder.com/100",
    prices: [
      { store: "Chaldal", price: 50, url: "https://chaldal.com" },
      { store: "Shwapno", price: 52 },
      { store: "Agora", price: 49 },
    ],
  },
};

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState("");
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsScanning(true);
      setError(null);
    } catch (err) {
      setError("Camera access denied. Please use manual entry.");
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const simulateScan = () => {
    const barcodes = Object.keys(MOCK_PRODUCTS);
    const randomBarcode = barcodes[Math.floor(Math.random() * barcodes.length)];
    handleBarcodeScan(randomBarcode);
  };

  const handleBarcodeScan = (barcode: string) => {
    const product = MOCK_PRODUCTS[barcode];
    if (product) {
      setScannedProduct(product);
      stopScanning();
    } else {
      setScannedProduct({
        barcode,
        name: `Product ${barcode.slice(-4)}`,
        brand: "Unknown",
        category: "Unknown",
      });
    }
  };

  const handleManualEntry = () => {
    if (manualEntry.trim()) {
      handleBarcodeScan(manualEntry.trim());
      setManualEntry("");
    }
  };

  const handleConfirm = () => {
    if (scannedProduct) {
      onScan(scannedProduct);
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
          <h2 className="text-xl font-bold">Scan Product</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!scannedProduct ? (
            <motion.div
              key="scanner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {isScanning ? (
                <div className="relative rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-64 object-cover bg-black"
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-32 border-2 border-primary rounded-lg" />
                  </div>
                  <button
                    onClick={stopScanning}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={startScanning}
                    className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-8 hover:border-primary transition-colors"
                  >
                    <Camera className="h-12 w-12 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Scan Barcode</span>
                  </button>

                  <button
                    onClick={simulateScan}
                    className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-8 hover:border-primary transition-colors"
                  >
                    <Package className="h-12 w-12 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Demo Scan</span>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={manualEntry}
                  onChange={(e) => setManualEntry(e.target.value)}
                  placeholder="Enter barcode manually..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleManualEntry();
                  }}
                />
                <button
                  onClick={handleManualEntry}
                  disabled={!manualEntry.trim()}
                  className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Point your camera at a barcode or enter it manually
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                {scannedProduct.image && (
                  <img
                    src={scannedProduct.image}
                    alt={scannedProduct.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{scannedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">{scannedProduct.brand}</p>
                  <p className="text-xs text-muted-foreground">{scannedProduct.barcode}</p>
                </div>
              </div>

              {scannedProduct.prices && scannedProduct.prices.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Price Comparison:</p>
                  <div className="space-y-2">
                    {scannedProduct.prices
                      .sort((a, b) => a.price - b.price)
                      .map((price, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                        >
                          <div>
                            <p className="text-sm font-medium">{price.store}</p>
                            {price.url && (
                              <a
                                href={price.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary flex items-center gap-1"
                              >
                                Visit store <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <span className="text-lg font-bold text-primary">
                            ৳{price.price}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setScannedProduct(null);
                    setIsScanning(false);
                  }}
                  className="flex-1 py-2 text-sm text-muted-foreground border border-border rounded-lg hover:bg-accent"
                >
                  Scan Again
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90"
                >
                  Add Product
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
