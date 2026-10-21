"use client";

import Loader from "@/components/Loader";
import SelectImage from "@/components/SelectImage";
import ExperienceScreen from "@/components/ExperienceScreen";
import { useUser } from "@/hooks/useUser";
import { uploadUserPhotoToFirebase } from "@/lib/db";
import { faceSwap, FaceSwapError, getFaceSwapConfiguration } from "@/lib/faceSwap";
import { experience, artRect } from "@/lib/experience";
import axios from "axios";
import { Glasses, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const photoPanel = experience.output.photo;

export default function CameraPage() {
  const { setUrl } = useUser();
  const router = useRouter();
  const cameraRef = useRef<Webcam>(null);
  const processing = useRef(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [countDown, setCountDown] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [hasGlasses, setHasGlasses] = useState(false);

  useEffect(() => {
    if (!selectedImage || !cameraReady || generatedImage || isLoading || captureError || countDown !== null) return;
    const timer = setTimeout(() => setCountDown(5), 1500);
    return () => clearTimeout(timer);
  }, [selectedImage, cameraReady, generatedImage, isLoading, captureError, countDown]);

  useEffect(() => {
    if (countDown === null) return;
    if (countDown === 0) {
      const photo = cameraRef.current?.getScreenshot();
      if (photo && !processing.current) void processFaceSwap(photo);
      else if (!photo) { setCaptureError("No se pudo tomar la foto. Revisa el permiso de camara."); setCountDown(null); }
      return;
    }
    const timer = setTimeout(() => setCountDown((value) => (value ?? 0) - 1), 1000);
    return () => clearTimeout(timer);
  }, [countDown]);

  useEffect(() => {
    if (selectedImage) void import("@/lib/preserveFace")
      .then(({ prepareFacePreservation }) => prepareFacePreservation())
      .catch(() => undefined);
  }, [selectedImage]);

  async function processFaceSwap(photoSrc: string) {
    if (!selectedImage || processing.current) return;
    processing.current = true;
    setIsLoading(true);
    try {
      const configuration = await getFaceSwapConfiguration();
      if (!configuration.configured) throw new FaceSwapError(configuration.message || "Falta configurar el servicio de imagen.");
      const { prepareVisitorPhoto, preserveGlasses } = await import("@/lib/preserveFace");
      let visitorPhoto: string;
      try { visitorPhoto = await prepareVisitorPhoto(photoSrc); }
      catch (error) { throw new FaceSwapError(error instanceof Error ? error.message : "No se pudo validar tu rostro. Repite la foto."); }
      const userPhoto = configuration.provider === "openai" ? visitorPhoto : await uploadUserPhotoToFirebase(visitorPhoto);
      if (!userPhoto) throw new FaceSwapError("No se pudo subir la foto. Revisa la conexion.");
      const response = await faceSwap(userPhoto, selectedImage);
      let resultImage = response.resultImage;
      if (hasGlasses) {
        const swapped = await axios.post("/api/proxy", { url: resultImage, downloadOnly: true }, { responseType: "blob", timeout: 20000 });
        resultImage = await preserveGlasses(visitorPhoto, swapped.data);
      }
      const saved = await axios.post("/api/proxy", { url: resultImage });
      if (!saved.data.url) throw new Error("No se pudo guardar la foto.");
      setGeneratedImage(saved.data.url);
      setUrl(saved.data.url);
    } catch (error) {
      setCaptureError(error instanceof FaceSwapError ? error.message : "No se pudo conservar bien el rostro y las gafas. Repite la foto con luz frontal, sin reflejos fuertes.");
      setCameraReady(false);
    } finally {
      processing.current = false;
      setCountDown(null);
      setIsLoading(false);
    }
  }

  function repeatPhoto() {
    setCaptureError(null);
    setCameraReady(false);
    setCountDown(null);
    setGeneratedImage(null);
    setUrl("");
  }

  if (!selectedImage) return (
    <ExperienceScreen screen="avatars">
      <h2 className="sr-only">Selecciona un avatar</h2>
      {experience.avatars.length ? <>
        <label className="absolute left-[30%] top-[34.2%] z-30 flex min-h-8 w-[40%] items-center justify-center gap-2 text-[#202020]" style={{ fontSize: "max(12px, 2.6cqw)" }}>
          <Glasses aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span>Con gafas</span>
          <input type="checkbox" checked={hasGlasses} onChange={(event) => setHasGlasses(event.target.checked)} className="h-5 w-5 accent-black" />
        </label>
        <SelectImage avatars={experience.avatars} setSelectedImage={setSelectedImage} />
      </> : <p role="status" className="text-center text-zinc-600">No hay avatares disponibles.</p>}
    </ExperienceScreen>
  );

  return (
    <div className="relative min-h-dvh w-full bg-white text-zinc-900">
      {isLoading && <Loader />}
      {!generatedImage && !isLoading && !captureError && (
        <ExperienceScreen screen={countDown === null ? "camera" : "countdown"}>
          <div className="absolute overflow-hidden bg-zinc-950" style={{ ...artRect(photoPanel.left, photoPanel.top, photoPanel.width, photoPanel.height), borderRadius: `${photoPanel.radius / 10.8}cqw` }}>
            <Webcam ref={cameraRef} audio={false} className="h-full w-full object-cover" disablePictureInPicture forceScreenshotSourceSize imageSmoothing mirrored={false}
              playsInline screenshotFormat="image/png" videoConstraints={{ width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: "user" }}
              onUserMedia={() => setCameraReady(true)} onUserMediaError={() => setCaptureError("No se pudo abrir la camara. Revisa los permisos del navegador.")} />
            {countDown !== null && countDown > 0 && <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-bold text-white drop-shadow-lg" style={{ fontSize: "24cqw" }}>{countDown}</div>}
          </div>
          {countDown === null && <p className="absolute z-20 flex items-center justify-center rounded-full bg-black/65 text-center font-bold text-white" style={{ ...artRect(194, 890, 692, 140), fontSize: "4.2cqw" }}>{hasGlasses ? "Mira de frente, sin reflejos en las gafas" : "Posicionate dentro del marco"}</p>}
        </ExperienceScreen>
      )}
      {captureError && (
        <section className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white p-6">
          <p role="alert" className="max-w-md text-center text-lg font-medium">{captureError}</p>
          <button type="button" autoFocus onClick={repeatPhoto} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-black px-6 py-3 text-white"><RotateCcw size={20} aria-hidden="true" />Repetir foto</button>
        </section>
      )}
      {generatedImage && (
        <ExperienceScreen screen="result">
          <img src={generatedImage} alt="Resultado generado" className="absolute inset-0 h-full w-full object-contain" draggable={false} />
          <button type="button" aria-label="Repetir foto" title="Repetir foto" onClick={repeatPhoto} className="result-action" style={{ left: "16.67%" }}><img src={experience.resultButtons.repeat} alt="" draggable={false} /></button>
          <button type="button" aria-label="Siguiente" title="Ver QR" onClick={() => router.push("/outro")} className="result-action" style={{ left: "32.87%" }}><img src={experience.resultButtons.next} alt="" draggable={false} /></button>
        </ExperienceScreen>
      )}
    </div>
  );
}
