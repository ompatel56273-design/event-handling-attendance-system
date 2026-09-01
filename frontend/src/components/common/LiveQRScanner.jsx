import { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { HiCamera, HiRefresh, HiLightningBolt, HiStop, HiPlay } from 'react-icons/hi';

const LiveQRScanner = ({ onScan, placeholder = 'Point camera at QR code or paste text...', modeLabel = 'QR Code' }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [currentFacingMode, setCurrentFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [manualText, setManualText] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const hasScannedRef = useRef(false);

  // Discover available camera devices
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(d => d.kind === 'videoinput');
          setCameras(videoDevices);
          if (videoDevices.length > 0) {
            setSelectedCameraId(videoDevices[0].deviceId);
          }
        })
        .catch(err => console.warn('Camera enumeration error:', err));
    }

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (facing = currentFacingMode, deviceId = selectedCameraId) => {
    setCameraError('');
    hasScannedRef.current = false;

    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    try {
      const constraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check if torch/flash is supported
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      if (capabilities.torch) {
        setTorchSupported(true);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Required for mobile iOS/Android auto-play
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('muted', 'true');
        
        await videoRef.current.play();
        setIsScanning(true);
        startScanningLoop();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      // If environment camera failed, fallback to default user camera
      if (facing === 'environment') {
        setCurrentFacingMode('user');
        startCamera('user', '');
        return;
      }
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings.'
          : 'Unable to open camera: ' + (err.message || 'Device not found')
      );
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
    setTorchOn(false);
  };

  const startScanningLoop = () => {
    const scanFrame = () => {
      if (!videoRef.current || hasScannedRef.current) return;

      const video = videoRef.current;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Run jsQR decoder
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data && !hasScannedRef.current) {
          hasScannedRef.current = true;
          playBeep();
          stopCamera();
          onScan(code.data.trim());
          return;
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880; // A5 pitch
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  const handleToggleCamera = () => {
    if (isScanning) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const handleSwitchCamera = () => {
    const nextMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    setCurrentFacingMode(nextMode);
    startCamera(nextMode, '');
  };

  const handleToggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      const newTorch = !torchOn;
      await track.applyConstraints({
        advanced: [{ torch: newTorch }],
      });
      setTorchOn(newTorch);
    } catch (err) {
      console.warn('Torch not supported:', err);
    }
  };

  const handleManualSubmit = (e) => {
    if (e) e.preventDefault();
    if (manualText.trim()) {
      stopCamera();
      onScan(manualText.trim());
    }
  };

  return (
    <div
      className="card live-scanner-card"
      style={{
        textAlign: 'center',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), var(--primary-subtle)',
      }}
    >
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Camera Live Viewfinder Window */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          height: '290px',
          margin: '0 auto 18px',
          borderRadius: '20px',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse at center, rgba(30, 41, 59, 0.4) 0%, #060913 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.8), 0 10px 30px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Actual Live Video Feed */}
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: isScanning ? 'block' : 'none',
          }}
          autoPlay
          playsInline
          muted
        />

        {/* Viewfinder Target & Laser Line Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div className="scanner-corner tl"></div>
          <div className="scanner-corner tr"></div>
          <div className="scanner-corner bl"></div>
          <div className="scanner-corner br"></div>

          {isScanning ? (
            <>
              <div className="scanner-laser-line"></div>
              <span
                style={{
                  position: 'absolute',
                  bottom: 16,
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: '#FFFFFF',
                  padding: '6px 16px',
                  borderRadius: 20,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid var(--primary-border)',
                  boxShadow: '0 0 12px var(--primary-glow)',
                }}
              >
                ● Scanning Live Camera...
              </span>
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)', padding: '0 20px' }}>
              <HiCamera style={{ fontSize: '3.4rem', color: 'var(--primary)', marginBottom: 8, filter: 'drop-shadow(0 0 12px var(--primary))' }} />
              <p style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>Camera Standby</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Click <strong style={{ color: 'var(--primary)' }}>"Start Camera"</strong> to activate real-time scanner
              </p>
            </div>
          )}
        </div>
      </div>

      {cameraError && (
        <div className="alert alert-error" style={{ marginBottom: 16, fontSize: '0.84rem' }}>
          {cameraError}
        </div>
      )}

      {/* Camera Interactive Action Controls */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn ${isScanning ? 'btn-danger' : 'btn-primary'} btn-sm`}
          onClick={handleToggleCamera}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', fontSize: '0.88rem' }}
        >
          {isScanning ? <><HiStop style={{ fontSize: '1.1rem' }} /> Stop Camera</> : <><HiPlay style={{ fontSize: '1.1rem' }} /> Start Camera</>}
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleSwitchCamera}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: '0.88rem' }}
          title="Switch between front and back camera"
        >
          <HiRefresh style={{ fontSize: '1.1rem' }} /> Switch ({currentFacingMode === 'environment' ? 'Rear' : 'Front'})
        </button>

        {torchSupported && isScanning && (
          <button
            type="button"
            className={`btn ${torchOn ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={handleToggleTorch}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: '0.88rem' }}
          >
            <HiLightningBolt style={{ fontSize: '1.1rem' }} /> {torchOn ? 'Flash On' : 'Flash Off'}
          </button>
        )}
      </div>

      {/* Manual Input Fallback */}
      <form onSubmit={handleManualSubmit}>
        <div className="form-group" style={{ textAlign: 'left', marginBottom: 14 }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
            Manual {modeLabel} Input / Scanner Token
          </label>
          <input
            className="form-control"
            placeholder={placeholder}
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className={`btn ${manualText.trim() ? 'btn-primary' : 'btn-secondary'} btn-full`}
          disabled={!manualText.trim()}
          style={{ padding: '12px 18px', fontWeight: 700, fontSize: '0.92rem' }}
        >
          Verify & Process {modeLabel}
        </button>
      </form>
    </div>
  );
};

export default LiveQRScanner;
