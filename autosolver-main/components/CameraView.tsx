import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { CameraHandle } from '../types';

interface CameraViewProps {
  isActive: boolean;
}

const CameraView = forwardRef<CameraHandle, CameraViewProps>(({ isActive }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [minZoom, setMinZoom] = useState<number>(1);
  const [maxZoom, setMaxZoom] = useState<number>(1);
  const [supportsZoom, setSupportsZoom] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    capture: () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas dimensions to match video resolution exactly
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw the current frame
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Quality Optimization:
          return canvas.toDataURL('image/jpeg', 0.8);
        }
      }
      return null;
    }
  }));

  // Zoom click handler for chips
  const handleZoomClick = async (targetZoom: number) => {
    // Clamp zoom value between min and max
    const newZoom = Math.min(Math.max(targetZoom, minZoom), maxZoom);
    setZoom(newZoom);

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];

      if (track) {
        try {
          // @ts-ignore - 'zoom' is part of advanced constraints in newer browsers
          await track.applyConstraints({ advanced: [{ zoom: newZoom }] });
        } catch (e) {
          console.warn("Zoom constraint failed:", e);
        }
      }
    }
  };

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error("Camera API not supported in this environment");
          return;
        }

        // Resolution Optimization: Set to 1080p (FHD)
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            // @ts-ignore - specific property for some browsers
            advanced: [{ focusMode: "continuous" }]
          }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Check for Zoom Capabilities
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();

        // @ts-ignore - 'zoom' property check
        if (capabilities.zoom) {
          setSupportsZoom(true);
          // @ts-ignore
          setMinZoom(capabilities.zoom.min || 1);
          // @ts-ignore
          setMaxZoom(capabilities.zoom.max || 10); // Limit max zoom logic if needed
          // @ts-ignore
          setZoom(track.getSettings().zoom || 1);
        } else {
          setSupportsZoom(false);
        }

      } catch (err) {
        console.error("Error accessing camera:", err);
        // Fallback to standard VGA if HD fails
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
          });
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (e) {
          console.error("Fallback failed", e);
        }
      }
    };

    if (isActive) {
      startCamera();
    } else {
      // Stop stream if inactive
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
        setSupportsZoom(false);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive]);

  // Zoom presets: 0.7 to 1.5 with 0.1 increments
  const ZOOM_PRESETS = [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5];

  return (
    <div className="relative w-full aspect-[3/4] bg-neutral-900 rounded-2xl overflow-hidden shadow-lg">
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center text-neutral-600 bg-neutral-900">
          <p className="text-sm font-medium">Camera Offline</p>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transform transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlay Guidelines for user */}
      {isActive && (
        <>
          <div className="absolute inset-0 border border-white/20 pointer-events-none m-6 rounded-2xl flex items-center justify-center opacity-50">
            {/* Corner Markers */}
            <div className="w-8 h-8 border-t-2 border-l-2 border-white absolute top-0 left-0 rounded-tl-lg"></div>
            <div className="w-8 h-8 border-t-2 border-r-2 border-white absolute top-0 right-0 rounded-tr-lg"></div>
            <div className="w-8 h-8 border-b-2 border-l-2 border-white absolute bottom-0 left-0 rounded-bl-lg"></div>
            <div className="w-8 h-8 border-b-2 border-r-2 border-white absolute bottom-0 right-0 rounded-br-lg"></div>

            {/* Center Focus Point */}
            <div className="w-2 h-2 rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
          </div>

          {/* Zoom Chips (Only if supported) */}
          {supportsZoom && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
              {ZOOM_PRESETS.map((level) => {
                // Only show presets within the camera's supported range
                if (level < minZoom || level > maxZoom) return null;

                const isSelected = Math.abs(zoom - level) < 0.05;

                return (
                  <button
                    key={level}
                    onClick={() => handleZoomClick(level)}
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold backdrop-blur-md transition-all duration-300
                      ${isSelected
                        ? 'bg-white text-black scale-110 shadow-lg'
                        : 'bg-black/40 text-white/70 hover:bg-black/60'}
                    `}
                  >
                    {level.toFixed(1)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Instructions */}
          <div className="absolute top-6 left-0 right-0 flex justify-center z-10 pointer-events-none">
            <div className="bg-black/40 backdrop-blur-md text-white/80 text-[10px] font-medium px-3 py-1.5 rounded-full border border-white/5 tracking-wider uppercase">
              {supportsZoom ? "Adjust Zoom" : "Align Text"}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default CameraView;