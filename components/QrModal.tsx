
import React, { useState, useEffect, useRef } from 'react';

// Make Html5Qrcode available from the script loaded in index.html
declare const Html5Qrcode: any;

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: string; // for generating QR
  onScanSuccess: (decodedText: string) => void;
  onScanError: (errorMessage: string) => void;
}

const QR_READER_ID = "qr-reader";

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  data,
  onScanSuccess,
  onScanError,
}) => {
  const [mode, setMode] = useState<'scan' | 'generate'>('scan');
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen && mode === 'scan') {
      // Ensure the scanner is initialized only once
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(QR_READER_ID, /* verbose= */ false);
      }
      const scanner = scannerRef.current;
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      // Check if scanner is already running before starting
      if (!scanner.isScanning) {
        scanner.start(
          { facingMode: "environment" },
          config,
          (decodedText: string, decodedResult: any) => {
            // success callback
            onScanSuccess(decodedText);
            // Stop scanning after a successful scan
            if (scanner.isScanning) {
              scanner.stop().catch((err: any) => console.error("Failed to stop scanner post-success", err));
            }
          },
          (errorMessage: string) => {
            // parse error callback, we can ignore it
          }
        ).catch((err: any) => {
          onScanError("Could not start QR scanner. Please grant camera permissions and refresh.");
        });
      }

      return () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
          scannerRef.current.stop().catch((err: any) => {
            // This can sometimes fail if the component unmounts quickly.
            console.error("Cleanup: Failed to stop scanner", err);
          });
        }
      };
    }
  }, [isOpen, mode, onScanSuccess, onScanError]);

  // Effect to stop scanner when modal is closed or mode is changed
  useEffect(() => {
    if ((!isOpen || mode !== 'scan') && scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((err: any) => console.error("Cleanup on close/mode change: Failed to stop scanner", err));
    }
  }, [isOpen, mode]);

  // Reset to scan mode when modal is opened, to provide a consistent experience
  useEffect(() => {
      if(isOpen) {
          setMode('scan');
      }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=250x250&bgcolor=1f2937`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="qr-modal-title">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 id="qr-modal-title" className="text-xl font-bold text-white">QR Code</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none" aria-label="Close modal">&times;</button>
        </div>

        <div className="mb-4">
          <div className="flex border-b border-gray-700" role="tablist">
            <button
              className={`flex-1 py-2 text-center font-semibold ${mode === 'scan' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
              onClick={() => setMode('scan')}
              role="tab"
              aria-selected={mode === 'scan'}
            >
              Scan
            </button>
            <button
              className={`flex-1 py-2 text-center font-semibold ${mode === 'generate' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'} disabled:text-gray-600 disabled:cursor-not-allowed`}
              onClick={() => setMode('generate')}
              disabled={!data}
              role="tab"
              aria-selected={mode === 'generate'}
            >
              Generate
            </button>
          </div>
        </div>

        <div className="aspect-square w-full bg-gray-900 rounded-md flex items-center justify-center overflow-hidden" role="tabpanel">
          {mode === 'scan' ? (
            <div id={QR_READER_ID} className="w-full"></div>
          ) : (
            data ? (
                <img src={qrCodeUrl} alt="Generated QR Code" />
            ) : (
                <p className="text-gray-500 text-center p-4">Protect a message in the main app to generate a QR code.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
};
