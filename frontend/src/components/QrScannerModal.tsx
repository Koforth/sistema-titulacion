import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
  title?: string;
  continuous?: boolean;
}

export default function QrScannerModal({
  isOpen,
  onClose,
  onScan,
  title = 'Escanear Título con Teléfono Móvil / Cámara',
  continuous = false,
}: QrScannerModalProps) {
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio no soportado o bloqueado por política de usuario
    }
  };

  const handleScanSuccess = useCallback((decodedText: string) => {
    const now = Date.now();
    // Prevenir duplicados inmediatos en menos de 1.5s
    if (now - lastScanTimeRef.current < 1500) return;
    lastScanTimeRef.current = now;

    playBeep();
    if (navigator.vibrate) {
      navigator.vibrate(80);
    }

    setLastScanned(decodedText);
    onScan(decodedText);

    if (!continuous) {
      stopScanner().then(() => onClose());
    }
  }, [continuous, onScan, onClose]);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Error al detener escáner:', err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const startScanner = async (cameraId?: string) => {
    setErrorMsg(null);
    try {
      if (scannerRef.current) {
        await stopScanner();
      }

      const scanner = new Html5Qrcode('qr-reader-container');
      scannerRef.current = scanner;

      const cameraConfig = cameraId
        ? { deviceId: { exact: cameraId } }
        : { facingMode: 'environment' };

      await scanner.start(
        cameraConfig,
        {
          fps: 12,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        },
        (decodedText) => handleScanSuccess(decodedText),
        () => {
          // Frame sin código detectado, continuar buscando
        }
      );
      setScanning(true);
    } catch (err: unknown) {
      console.error('Error al iniciar cámara:', err);
      setErrorMsg('No se pudo acceder a la cámara. Verifique los permisos en el navegador o use la entrada manual.');
      setScanning(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    // Inicializar y buscar cámaras disponibles
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Preferir cámara trasera si existe
          const backCam = devices.find(
            (d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('trasera') || d.label.toLowerCase().includes('environment')
          );
          const chosenId = backCam ? backCam.id : devices[0].id;
          setSelectedCameraId(chosenId);
          startScanner(chosenId);
        } else {
          startScanner();
        }
      })
      .catch(() => {
        // Fallback a modo environment genérico
        startScanner();
      });

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    playBeep();
    onScan(manualCode.trim());
    setLastScanned(manualCode.trim());
    setManualCode('');
    if (!continuous) {
      stopScanner().then(() => onClose());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="setec-modal-backdrop" onClick={() => { stopScanner(); onClose(); }}>
      <div className="setec-modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-top-bar">
          <h3>📷 {title}</h3>
          <button
            type="button"
            className="close-x-btn"
            onClick={() => { stopScanner(); onClose(); }}
            title="Cerrar escáner"
          >
            ✕
          </button>
        </div>

        <div className="modal-content-body" style={{ textAlign: 'center' }}>
          {errorMsg ? (
            <div className="alert error" style={{ margin: '0.5rem 0' }}>{errorMsg}</div>
          ) : (
            <>
              {cameras.length > 1 && (
                <div style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <label htmlFor="cam-select" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Cámara:</label>
                  <select
                    id="cam-select"
                    value={selectedCameraId}
                    onChange={(e) => {
                      setSelectedCameraId(e.target.value);
                      startScanner(e.target.value);
                    }}
                    style={{ fontSize: '0.82rem', padding: '0.2rem 0.5rem' }}
                  >
                    {cameras.map((c) => (
                      <option key={c.id} value={c.id}>{c.label || `Cámara ${c.id.substring(0, 5)}`}</option>
                    ))}
                  </select>
                </div>
              )}

              <div
                id="qr-reader-container"
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  margin: '0 auto',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '2px solid var(--gold)',
                  background: '#000',
                  minHeight: '260px',
                }}
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0 0.2rem' }}>
                {scanning ? 'Apunte la cámara del teléfono al código QR del título físico' : 'Iniciando cámara…'}
              </p>
            </>
          )}

          {lastScanned && (
            <div style={{
              background: 'var(--success-soft)',
              color: 'var(--success)',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              margin: '0.6rem 0',
              border: '1px solid #b8dfc2'
            }}>
              ✓ Código detectado: {lastScanned}
            </div>
          )}

          <hr style={{ margin: '0.8rem 0', border: 'none', borderTop: '1px dashed var(--border-color)' }} />

          {/* Opción alternativa: Entrada manual o pistola lectora USB */}
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.4rem' }}>
            <input
              type="text"
              placeholder="O escribir código / pistolear lector USB…"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              style={{ flex: 1, fontSize: '0.85rem' }}
              autoFocus={!scanning}
            />
            <button type="submit" className="btn-search" style={{ minHeight: '34px', fontSize: '0.82rem' }}>
              Agregar
            </button>
          </form>
        </div>

        <div className="modal-footer-nav" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Modo: {continuous ? 'Escaneo continuo activo' : 'Escaneo individual'}
          </span>
          <button
            type="button"
            className="btn-stepper btn-close"
            onClick={() => { stopScanner(); onClose(); }}
          >
            Cerrar Escáner
          </button>
        </div>
      </div>
    </div>
  );
}
