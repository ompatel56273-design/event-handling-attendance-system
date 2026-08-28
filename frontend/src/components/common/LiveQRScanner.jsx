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
    <div className="card live-scanner-card" style={{ textAlign: 'center', background: '#FFFFFF' }}>
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Camera Live Viewfinder Window */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '380px',
          height: '280px',
          margin: '0 auto 16px',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#0C1033',
          boxShadow: '0 8px 24px rgba(12, 16, 51, 0.25)',
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
                  bottom: 14,
                  background: 'rgba(12, 16, 51, 0.75)',
                  color: '#FFFFFF',
                  padding: '4px 14px',
                  borderRadius: 20,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  backdropFilter: 'blur(4px)',
                }}
              >
                ● Scanning Live Camera...
              </span>
            </>
          ) : (
            <div style={{ color: '#94A3B8', padding: '0 20px' }}>
              <HiCamera style={{ fontSize: '3.2rem', color: '#5C33CF', marginBottom: 6 }} />
              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F1F5F9' }}>Camera Standby</p>
              <p style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: 4 }}>
                Click <strong>"Start Camera"</strong> to view real-time camera feed
              </p>
            </div>
          )}
        </div>
      </div>

      {cameraError && (
        <div className="alert alert-error" style={{ marginBottom: 16, fontSize: '0.82rem' }}>
          {cameraError}
        </div>
      )}

      {/* Camera Interactive Action Controls */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn ${isScanning ? 'btn-danger' : 'btn-primary'} btn-sm`}
          onClick={handleToggleCamera}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {isScanning ? <><HiStop /> Stop Camera</> : <><HiPlay /> Start Camera</>}
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleSwitchCamera}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          title="Switch between front and back camera"
        >
          <HiRefresh /> Switch ({currentFacingMode === 'environment' ? 'Rear' : 'Front'})
        </button>

        {torchSupported && isScanning && (
          <button
            type="button"
            className={`btn ${torchOn ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={handleToggleTorch}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <HiLightningBolt /> {torchOn ? 'Flash On' : 'Flash Off'}
          </button>
        )}
      </div>

      {/* Manual Input Fallback */}
      <form onSubmit={handleManualSubmit}>
        <div className="form-group" style={{ textAlign: 'left', marginBottom: 10 }}>
          <label style={{ fontSize: '0.76rem', color: '#64748B' }}>
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
          className="btn btn-secondary btn-full"
          disabled={!manualText.trim()}
        >
          Verify & Process {modeLabel}
        </button>
      </form>
    </div>
  );
};

export default LiveQRScanner;
