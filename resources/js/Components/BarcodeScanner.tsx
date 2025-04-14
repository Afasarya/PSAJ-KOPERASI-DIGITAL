import React, { useEffect, useRef, useState } from 'react';
import Quagga from 'quagga';
import { X, Camera, RotateCw } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
  scanPurpose: 'checkout' | 'stock_opname' | 'product_info';
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ 
  onDetected, 
  onClose,
  scanPurpose 
}) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [lastDetection, setLastDetection] = useState<string | null>(null);
  const detectionCountRef = useRef<Record<string, number>>({});
  const detectionThreshold = 3; // Number of detections required for confirmation

  const initQuagga = () => {
    if (!scannerRef.current) {
      return;
    }

    interface VideoConstraints {
        facingMode: string;
        width: { min: number };
        height: { min: number };
        aspectRatio: { min: number; max: number };
    }

    interface InputStreamConfig {
        name: string;
        type: string;
        target: Element;
        constraints: VideoConstraints;
    }

    interface LocatorConfig {
        patchSize: string;
        halfSample: boolean;
    }

    interface DecoderDebugConfig {
        drawBoundingBox: boolean;
        showFrequency: boolean;
        drawScanline: boolean;
        showPattern: boolean;
    }

    interface DecoderConfig {
        readers: string[];
        debug: DecoderDebugConfig;
    }

    interface QuaggaInitConfig {
        inputStream: InputStreamConfig;
        locator: LocatorConfig;
        numOfWorkers: number;
        decoder: DecoderConfig;
        locate: boolean;
    }

    Quagga.init(
        {
            inputStream: {
                name: 'Live',
                type: 'LiveStream',
                target: scannerRef.current as Element,
                constraints: {
                    facingMode: 'environment', // Use back camera
                    width: { min: 450 },
                    height: { min: 300 },
                    aspectRatio: { min: 1, max: 2 },
                },
            },
            locator: {
                patchSize: 'medium',
                halfSample: true,
            },
            numOfWorkers: navigator.hardwareConcurrency || 4,
            decoder: {
                readers: [
                    'ean_reader',
                    'ean_8_reader',
                    'upc_reader',
                    'code_128_reader',
                    'code_39_reader',
                    'code_93_reader',
                    'codabar_reader',
                ],
                debug: {
                    drawBoundingBox: true,
                    showFrequency: false,
                    drawScanline: true,
                    showPattern: false,
                },
            },
            locate: true,
        } as QuaggaInitConfig,
        (err: Error | null) => {
            if (err) {
                console.error('Error initializing Quagga:', err);
                setError('Gagal mengakses kamera. Periksa izin kamera atau coba perangkat lain.');
                return;
            }

            Quagga.start();
            setIsCameraStarted(true);
            setError(null);
        }
    );

    Quagga.onDetected((result) => {
      if (result && result.codeResult) {
        const code = result.codeResult.code;
        
        if (!code) return;

        // Increase detection count for this code
        detectionCountRef.current[code] = (detectionCountRef.current[code] || 0) + 1;
        setLastDetection(code);

        // If detected enough times with high enough confidence, consider it valid
        if (detectionCountRef.current[code] >= detectionThreshold && result.codeResult.startInfo.error < 0.25) {
          onDetected(code);
          stopScanner();
        }
      }
    });

    return () => {
      stopScanner();
    };
  };

  const stopScanner = () => {
    Quagga.stop();
    setIsCameraStarted(false);
  };

  const restartScanner = () => {
    stopScanner();
    detectionCountRef.current = {};
    setLastDetection(null);
    initQuagga();
  };

  useEffect(() => {
    initQuagga();

    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="barcode-scanner-container">
      <div className="barcode-scanner-content max-w-lg">
        <div className="barcode-scanner-header">
          <h3 className="text-lg font-semibold">
            {scanPurpose === 'checkout' && 'Scan Produk untuk Keranjang'}
            {scanPurpose === 'stock_opname' && 'Scan Produk untuk Stock Opname'}
            {scanPurpose === 'product_info' && 'Scan Produk untuk Informasi'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="barcode-scanner-viewport">
          <div ref={scannerRef} className="viewport h-64 rounded-md overflow-hidden"></div>
          <div className="barcode-scanner-crosshair">
            <svg width="260" height="200" viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M245 0V40M245 160V200M15 0V40M15 160V200M0 15H40M220 15H260M0 185H40M220 185H260" stroke="#3B82F6" strokeWidth="3" />
            </svg>
          </div>
        </div>

        {lastDetection && (
          <div className="mt-2 text-center">
            <p className="text-sm text-muted-foreground">
              Terdeteksi: <span className="font-medium">{lastDetection}</span> ({detectionCountRef.current[lastDetection] || 0}/{detectionThreshold})
            </p>
          </div>
        )}

        <div className="barcode-scanner-actions mt-4">
          <Button variant="outline" className="mr-2" onClick={restartScanner}>
            <RotateCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={onClose}>
            <Camera className="h-4 w-4 mr-2" />
            Tutup Scanner
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;