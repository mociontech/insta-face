"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const outputWidth = 1080;
const outputHeight = 1920;
const streamStartupTimeoutMs = 3500;

type CameraProps = {
  countdownStart?: number;
  onPhotoTaken?: (photo: string) => void;
};

type SourceWithDimensions =
  | HTMLVideoElement
  | HTMLImageElement
  | HTMLCanvasElement
  | ImageBitmap
  | OffscreenCanvas;

function getSourceDimensions(
  image: SourceWithDimensions,
  fallbackWidth: number,
  fallbackHeight: number
) {
  if ("videoWidth" in image && "videoHeight" in image) {
    return {
      width: image.videoWidth || fallbackWidth,
      height: image.videoHeight || fallbackHeight,
    };
  }

  if ("naturalWidth" in image && "naturalHeight" in image) {
    return {
      width: image.naturalWidth || fallbackWidth,
      height: image.naturalHeight || fallbackHeight,
    };
  }

  return {
    width: image.width || fallbackWidth,
    height: image.height || fallbackHeight,
  };
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: SourceWithDimensions,
  targetWidth: number,
  targetHeight: number
) {
  const { width: sourceWidth, height: sourceHeight } = getSourceDimensions(
    image,
    targetWidth,
    targetHeight
  );
  const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const offsetX = (targetWidth - drawWidth) / 2;
  const offsetY = (targetHeight - drawHeight) / 2;

  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

function getPreferredCameraId(devices: MediaDeviceInfo[]) {
  const videoInputs = devices.filter((device) => device.kind === "videoinput");

  if (videoInputs.length <= 1) {
    return null;
  }

  const externalCamera =
    videoInputs.find((device) =>
      /usb|external|logi|webcam|camera|brio|hd pro/i.test(device.label)
    ) || videoInputs[videoInputs.length - 1];

  return externalCamera?.deviceId || null;
}

export default function Camera({
  countdownStart = 5,
  onPhotoTaken,
}: CameraProps) {
  const webcamRef = useRef<Webcam | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(countdownStart);
  const [isCapturing, setIsCapturing] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeConstraintIndex, setActiveConstraintIndex] = useState(0);
  const [preferredDeviceId, setPreferredDeviceId] = useState<string | null>(null);
  const [hasLiveStream, setHasLiveStream] = useState(false);

  const constraintProfiles: MediaTrackConstraints[] = [
    preferredDeviceId
      ? {
          deviceId: { exact: preferredDeviceId },
          width: { ideal: 1080 },
          height: { ideal: 1920 },
          aspectRatio: { ideal: 9 / 16 },
        }
      : null,
    {
      width: { ideal: 1080 },
      height: { ideal: 1920 },
      aspectRatio: { ideal: 9 / 16 },
    },
    {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      aspectRatio: { ideal: 16 / 9 },
    },
    {
      facingMode: { ideal: "environment" },
    },
    {
      facingMode: { ideal: "user" },
    },
  ].filter(Boolean) as MediaTrackConstraints[];

  useEffect(() => {
    let isMounted = true;

    async function loadDevices() {
      if (!navigator.mediaDevices?.getUserMedia) {
        if (isMounted) {
          setCameraError("Este navegador no permite acceder a la camara.");
        }
        return;
      }

      try {
        const warmupStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        warmupStream.getTracks().forEach((track) => track.stop());
      } catch {
        // Let the webcam component surface the final state.
      }

      if (!navigator.mediaDevices.enumerateDevices) {
        return;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const detectedDeviceId = getPreferredCameraId(devices);

        if (isMounted && detectedDeviceId) {
          setPreferredDeviceId(detectedDeviceId);
          setActiveConstraintIndex(0);
        }
      } catch {
        // Ignore enumeration failures and keep generic constraints.
      }
    }

    loadDevices();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isCapturing || capturedImage || hasLiveStream || cameraError) {
      return;
    }

    const startupTimer = setTimeout(() => {
      if (activeConstraintIndex < constraintProfiles.length - 1) {
        setActiveConstraintIndex((current) => current + 1);
        return;
      }

      setCameraError(
        "No se pudo abrir la camara. Verifica permisos del navegador o que la camara externa no este ocupada por otra app."
      );
    }, streamStartupTimeoutMs);

    return () => {
      clearTimeout(startupTimer);
    };
  }, [
    activeConstraintIndex,
    cameraError,
    capturedImage,
    constraintProfiles.length,
    hasLiveStream,
    isCapturing,
  ]);

  useEffect(() => {
    if (!isCapturing || !hasLiveStream || capturedImage) {
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;

    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      capturePhoto();
    }

    return () => {
      clearTimeout(timer);
    };
  }, [capturedImage, countdown, hasLiveStream, isCapturing]);

  function capturePhoto() {
    const videoElement = webcamRef.current?.video;

    if (!videoElement || videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      setCameraError("La camara no entrego video a tiempo. Intenta repetir la toma.");
      return;
    }

    const finalCanvas = document.createElement("canvas");
    const ctx = finalCanvas.getContext("2d");

    if (!ctx) {
      return;
    }

    finalCanvas.width = outputWidth;
    finalCanvas.height = outputHeight;
    drawImageCover(ctx, videoElement, outputWidth, outputHeight);

    const imageData = finalCanvas.toDataURL("image/png");
    setCapturedImage(imageData);
    setIsCapturing(false);
    setHasLiveStream(false);
  }

  function handleRetry() {
    setCapturedImage(null);
    setCountdown(countdownStart);
    setIsCapturing(true);
    setCameraError(null);
    setHasLiveStream(false);
    setActiveConstraintIndex(0);
  }

  function handleContinue() {
    if (capturedImage) {
      onPhotoTaken?.(capturedImage);
    }
  }

  function handleUserMedia() {
    setHasLiveStream(true);
    setCameraError(null);
    setCountdown(countdownStart);
  }

  function handleUserMediaError() {
    setHasLiveStream(false);

    if (activeConstraintIndex < constraintProfiles.length - 1) {
      setActiveConstraintIndex((current) => current + 1);
      return;
    }

    setCameraError(
      "No se pudo abrir la camara. Verifica permisos del navegador o que la camara externa este seleccionada."
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <img
        src="/foto.png"
        alt="Captura de foto"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute left-1/2 top-[6.770833%] z-10 -translate-x-1/2 text-center text-[clamp(1.3rem,2vw,2rem)] font-bold uppercase tracking-[0.04em] text-white">
        PREPARATE PARA LA FOTO!
      </div>

      <div className="absolute left-1/2 top-[6.770833%] h-[73.958333%] w-[61.111111%] -translate-x-1/2 overflow-hidden bg-[#E9E9E9]">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Vista previa"
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            <Webcam
              key={`${preferredDeviceId || "default"}-${activeConstraintIndex}`}
              ref={webcamRef}
              audio={false}
              mirrored={false}
              screenshotFormat="image/png"
              forceScreenshotSourceSize
              videoConstraints={constraintProfiles[activeConstraintIndex]}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              className="h-full w-full object-cover"
            />
            {isCapturing && hasLiveStream && (
              <div className="telegraf-bold absolute inset-0 flex items-center justify-center bg-black/10 text-[8rem] text-white">
                {countdown}
              </div>
            )}
            {!hasLiveStream && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 px-8 text-center text-[1.4rem] leading-tight text-white">
                Activando camara...
              </div>
            )}
            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#E9E9E9] px-10 text-center text-[1.6rem] leading-tight text-[#1A1A1A]">
                {cameraError}
              </div>
            )}
          </>
        )}
      </div>

      <div className="absolute left-1/2 top-[83.854167%] flex -translate-x-1/2 items-end gap-10">
        <button
          type="button"
          onClick={handleRetry}
          className="flex flex-col items-center gap-3 text-white"
        >
          <span className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
            <img
              src="/Arrow Outline (1).png"
              alt="Repetir"
              className="h-[44px] w-[44px]"
            />
          </span>
          <span className="telegraf-bold text-[1.1rem] uppercase">Repetir</span>
        </button>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!capturedImage}
          className="flex flex-col items-center gap-3 text-white"
        >
          <span
            className={`flex h-[88px] w-[88px] items-center justify-center rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.18)] ${
              capturedImage ? "bg-[#32C7B0]" : "bg-[#32C7B0]/60"
            }`}
          >
            <img
              src="/arr.png"
              alt="Siguiente"
              className={`h-[44px] w-[44px] ${
                capturedImage ? "opacity-100" : "opacity-70"
              }`}
            />
          </span>
          <span className="telegraf-bold text-[1.1rem] uppercase">Siguiente</span>
        </button>
      </div>
    </div>
  );
}
