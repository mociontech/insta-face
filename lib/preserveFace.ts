import { FaceLandmarker, FilesetResolver, type NormalizedLandmark } from "@mediapipe/tasks-vision";
import { fromTriangles } from "transformation-matrix";
import { canvasRGBA } from "stackblur-canvas";

let detectorPromise: Promise<FaceLandmarker> | null = null;

export function prepareFacePreservation() {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm"
      );
      return FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "CPU",
        },
        runningMode: "IMAGE",
        numFaces: 1,
      });
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

function skinColors(data: ImageData, landmarks: NormalizedLandmark[]) {
  const forehead = {
    x: landmarks[10].x * 0.75 + landmarks[1].x * 0.25,
    y: landmarks[10].y * 0.75 + landmarks[1].y * 0.25,
  };
  return [landmarks[50], landmarks[280], forehead].map((sample) => {
    const x = Math.max(2, Math.min(data.width - 3, Math.round(sample.x * data.width)));
    const y = Math.max(2, Math.min(data.height - 3, Math.round(sample.y * data.height)));
    const channels = [0, 0, 0];
    for (let dy = -2; dy <= 2; dy += 1) {
      for (let dx = -2; dx <= 2; dx += 1) {
        const offset = ((y + dy) * data.width + x + dx) * 4;
        for (let channel = 0; channel < 3; channel += 1) channels[channel] += data.data[offset + channel] / 25;
      }
    }
    return channels;
  });
}

export async function preserveFaceDetails(photo: string, swappedPhoto: Blob) {
  const personBlob = await fetch(photo).then((response) => response.blob());
  const detector = await prepareFacePreservation();
  const person = await createImageBitmap(personBlob);
  let target: ImageBitmap | null = null;

  try {
    target = await createImageBitmap(swappedPhoto);
    const sourceFace = detector.detect(person).faceLandmarks[0];
    const targetFace = detector.detect(target).faceLandmarks[0];
    if (!sourceFace || !targetFace) {
      throw new Error("No se pudo alinear el rostro para conservar sus detalles.");
    }

    const sourceAnchors = [33, 263, 1].map((index) => point(sourceFace, index, person));
    const targetAnchors = [33, 263, 1].map((index) => point(targetFace, index, target));
    const [leftEye, rightEye] = sourceAnchors;
    const eyeSpan = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y);
    if (eyeSpan < 24) throw new Error("El rostro quedo demasiado pequeno en la captura.");

    const matrix = fromTriangles(sourceAnchors, targetAnchors);
    if (!Object.values(matrix).every(Number.isFinite)) {
      throw new Error("No se pudo alinear el rostro para conservar sus detalles.");
    }

    const leftTemple = point(sourceFace, 234, person);
    const rightTemple = point(sourceFace, 454, person);
    const faceWidth = Math.hypot(rightTemple.x - leftTemple.x, rightTemple.y - leftTemple.y);
    const center = { x: (leftEye.x + rightEye.x) / 2, y: (leftEye.y + rightEye.y) / 2 };
    const angle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
    const mask = createCanvas(person.width, person.height);
    const originalEyes = createCanvas(person.width, person.height);
    const mappedFace = createCanvas(target.width, target.height);
    const faceMask = createCanvas(target.width, target.height);
    const output = createCanvas(target.width, target.height);
    const adjustedPerson = createCanvas(person.width, person.height);

    output.context.drawImage(target, 0, 0);
    adjustedPerson.context.drawImage(person, 0, 0);
    const sourcePixels = adjustedPerson.context.getImageData(0, 0, person.width, person.height);
    const sourceSkin = skinColors(sourcePixels, sourceFace);
    const targetSkin = skinColors(output.context.getImageData(0, 0, target.width, target.height), targetFace);
    const gains = sourceSkin.map((sample, index) => sample.map((value, channel) => (
      Math.max(0.65, Math.min(1.4, targetSkin[index][channel] / Math.max(1, value)))
    )));
    const foreheadY = (sourceFace[10].y * 0.75 + sourceFace[1].y * 0.25) * person.height;
    const cheeksY = (sourceFace[50].y + sourceFace[280].y) / 2 * person.height;

    // Balance capture lighting without recoloring dark frames or pupils.
    for (let offset = 0; offset < sourcePixels.data.length; offset += 4) {
      const brightness = (sourcePixels.data[offset] + sourcePixels.data[offset + 1] + sourcePixels.data[offset + 2]) / 3;
      const weight = Math.max(0, Math.min(1, (brightness - 25) / 75));
      const y = Math.floor(offset / 4 / person.width);
      const blend = Math.max(0, Math.min(1, (y - foreheadY) / Math.max(1, cheeksY - foreheadY)));
      for (let channel = 0; channel < 3; channel += 1) {
        const cheekGain = (gains[0][channel] + gains[1][channel]) / 2;
        const gain = gains[2][channel] * (1 - blend) + cheekGain * blend;
        sourcePixels.data[offset + channel] *= 1 + (gain - 1) * weight;
      }
    }
    adjustedPerson.context.putImageData(sourcePixels, 0, 0);

    // MediaPipe's mesh maps the visitor's facial pixels to the completed swap.
    const mesh = FaceLandmarker.FACE_LANDMARKS_TESSELATION;
    for (let index = 0; index < mesh.length; index += 3) {
      const indices = [mesh[index].start, mesh[index + 1].start, mesh[index + 2].start];
      const sourceTriangle = indices.map((vertex) => point(sourceFace, vertex, person));
      const targetTriangle = indices.map((vertex) => point(targetFace, vertex, target));
      const [a, b, c] = sourceTriangle;
      if (Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) < 0.1) continue;
      const transform = fromTriangles(sourceTriangle, targetTriangle);
      if (!Object.values(transform).every(Number.isFinite)) continue;
      const triangleCenter = {
        x: targetTriangle.reduce((sum, vertex) => sum + vertex.x, 0) / 3,
        y: targetTriangle.reduce((sum, vertex) => sum + vertex.y, 0) / 3,
      };

      mappedFace.context.save();
      mappedFace.context.beginPath();
      targetTriangle.forEach((vertex, vertexIndex) => {
        const dx = vertex.x - triangleCenter.x;
        const dy = vertex.y - triangleCenter.y;
        const distance = Math.hypot(dx, dy) || 1;
        const x = vertex.x + dx / distance * 0.65;
        const y = vertex.y + dy / distance * 0.65;
        if (vertexIndex === 0) mappedFace.context.moveTo(x, y);
        else mappedFace.context.lineTo(x, y);
      });
      mappedFace.context.closePath();
      mappedFace.context.clip();
      mappedFace.context.setTransform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f);
      mappedFace.context.drawImage(adjustedPerson.canvas, 0, 0);
      mappedFace.context.restore();
    }

    const faceCenter = point(targetFace, 1, target);
    faceMask.context.beginPath();
    FaceLandmarker.FACE_LANDMARKS_FACE_OVAL.forEach(({ start }, index) => {
      const vertex = point(targetFace, start, target);
      const x = faceCenter.x + (vertex.x - faceCenter.x) * 0.96;
      const y = faceCenter.y + (vertex.y - faceCenter.y) * 0.96;
      if (index === 0) faceMask.context.moveTo(x, y);
      else faceMask.context.lineTo(x, y);
    });
    faceMask.context.closePath();
    faceMask.context.fillStyle = "#ffffff";
    faceMask.context.fill();
    const targetFaceWidth = Math.hypot(
      targetAnchors[1].x - targetAnchors[0].x,
      targetAnchors[1].y - targetAnchors[0].y
    );
    canvasRGBA(faceMask.canvas, 0, 0, target.width, target.height, Math.max(2, Math.round(targetFaceWidth * 0.07)));
    mappedFace.context.globalCompositeOperation = "destination-in";
    mappedFace.context.drawImage(faceMask.canvas, 0, 0);

    // A single transform keeps rigid glasses frames from bending with the face mesh.
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

    originalEyes.context.drawImage(adjustedPerson.canvas, 0, 0);
    originalEyes.context.globalCompositeOperation = "destination-in";
    originalEyes.context.drawImage(mask.canvas, 0, 0);

    output.context.drawImage(target, 0, 0);
    output.context.drawImage(mappedFace.canvas, 0, 0);
    output.context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
    output.context.drawImage(originalEyes.canvas, 0, 0);
    return output.canvas.toDataURL("image/jpeg", 0.95);
  } finally {
    person.close();
    target?.close();
  }
}
