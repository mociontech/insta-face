import { FaceLandmarker, FilesetResolver, type NormalizedLandmark } from "@mediapipe/tasks-vision";
import { fromTriangles } from "transformation-matrix";
import { eyeTriangle, visitorCrop } from "@/lib/faceGeometry";

let detectorPromise: Promise<FaceLandmarker> | null = null;

export function prepareFacePreservation() {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm"
      );
      // The WASM loader binds console.error at initialization, including INFO output.
      const originalError = console.error;
      const logWasmMessage = (...args: unknown[]) => {
        if (args[0] === "INFO: Created TensorFlow Lite XNNPACK delegate for CPU.") {
          console.info(...args);
        } else {
          originalError.apply(console, args);
        }
      };
      console.error = logWasmMessage;
      try {
        return await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "CPU",
          },
          runningMode: "IMAGE",
          numFaces: 2,
        });
      } finally {
        if (console.error === logWasmMessage) console.error = originalError;
      }
    })().catch((error) => {
      detectorPromise = null;
      throw error;
    });
  }
  return detectorPromise;
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo preparar la foto.");
  return { canvas, context };
}

function point(landmarks: NormalizedLandmark[], index: number, image: ImageBitmap) {
  return { x: landmarks[index].x * image.width, y: landmarks[index].y * image.height };
}

export async function prepareVisitorPhoto(photo: string) {
  const detector = await prepareFacePreservation();
  const image = await createImageBitmap(await (await fetch(photo)).blob());
  try {
    const crop = visitorCrop(detector.detect(image).faceLandmarks, image.width, image.height);
    const output = createCanvas(crop.width, crop.height);
    output.context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
    return output.canvas.toDataURL("image/png");
  } finally {
    image.close();
  }
}

export async function preserveGlasses(photo: string, swappedPhoto: Blob) {
  const person = await createImageBitmap(await fetch(photo).then((response) => response.blob()));
  let target: ImageBitmap | null = null;

  try {
    const detector = await prepareFacePreservation();
    target = await createImageBitmap(swappedPhoto);
    const sources = detector.detect(person).faceLandmarks;
    const targets = detector.detect(target).faceLandmarks;
    if (sources.length !== 1 || targets.length !== 1) {
      throw new Error("No se pudo alinear las gafas con el rostro generado.");
    }

    const sourceFace = sources[0];
    const targetFace = targets[0];
    const sourceAnchors = [33, 263].map((index) => point(sourceFace, index, person));
    const targetAnchors = [33, 263].map((index) => point(targetFace, index, target));
    const [leftEye, rightEye] = sourceAnchors;
    const eyeSpan = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y);
    if (eyeSpan < 24) throw new Error("El rostro quedo demasiado pequeno en la captura.");

    const matrix = fromTriangles(
      eyeTriangle(sourceAnchors[0], sourceAnchors[1]),
      eyeTriangle(targetAnchors[0], targetAnchors[1])
    );
    if (!Object.values(matrix).every(Number.isFinite)) {
      throw new Error("No se pudo alinear las gafas con el rostro generado.");
    }

    const leftTemple = point(sourceFace, 234, person);
    const rightTemple = point(sourceFace, 454, person);
    const faceWidth = Math.hypot(rightTemple.x - leftTemple.x, rightTemple.y - leftTemple.y);
    const center = { x: (leftEye.x + rightEye.x) / 2, y: (leftEye.y + rightEye.y) / 2 };
    const angle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
    const mask = createCanvas(person.width, person.height);
    const originalGlasses = createCanvas(person.width, person.height);
    const output = createCanvas(target.width, target.height);

    mask.context.beginPath();
    FaceLandmarker.FACE_LANDMARKS_FACE_OVAL.forEach(({ start }, index) => {
      const vertex = point(sourceFace, start, person);
      if (index === 0) mask.context.moveTo(vertex.x, vertex.y);
      else mask.context.lineTo(vertex.x, vertex.y);
    });
    mask.context.closePath();
    mask.context.clip();
    mask.context.translate(center.x, center.y);
    mask.context.rotate(angle);
    mask.context.scale(faceWidth * 0.49, eyeSpan * 0.46);
    const feather = mask.context.createRadialGradient(0, 0, 0.72, 0, 0, 1);
    feather.addColorStop(0, "#ffffff");
    feather.addColorStop(1, "rgba(255,255,255,0)");
    mask.context.fillStyle = feather;
    mask.context.beginPath();
    mask.context.arc(0, 0, 1, 0, Math.PI * 2);
    mask.context.fill();

    originalGlasses.context.drawImage(person, 0, 0);
    originalGlasses.context.globalCompositeOperation = "destination-in";
    originalGlasses.context.drawImage(mask.canvas, 0, 0);

    output.context.drawImage(target, 0, 0);
    output.context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
    output.context.drawImage(originalGlasses.canvas, 0, 0);
    return output.canvas.toDataURL("image/png");
  } finally {
    person.close();
    target?.close();
  }
}
