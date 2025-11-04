"use client";

import Loader from "@/components/Loader";
import { useUser } from "@/hooks/useUser";
import { uploadUserPhotoToFirebase, uploadGeneratedPhotoToFirebase } from "@/lib/db";
import { faceSwap } from "@/lib/faceSwap";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SelectImage from "@/components/SelectImage";
import { Camera } from "components-mocion";
import Image from "next/image";
import { LayoutHome } from "@/components/tp-ui/layout/layoutHome";
import { CardAvatarSelect } from "@/components/tp-ui/cards/CardAvatarSelect";
import { ButtonTp } from "@/components/tp-ui/button/button";

// Array de avatares
const avatarOptions = [
  {
    id: 1,
    femaleAvatar: "/tp/Avatar_1.png",
    maleAvatar: "/tp/Avatar_2.png",
  },
  {
    id: 2,
    femaleAvatar: "/tp/Avatar 3.png",
    maleAvatar: "/tp/Avatar 4.png",
  },
  {
    id: 3,
    femaleAvatar: "/tp/Avatar 5.png",
    maleAvatar: "/tp/Avatar 6.png",
  },
];

export default function CameraPage() {
  const { setUrl, url } = useUser();
  const router = useRouter();

  const [imageSrc, setImageSrc] = useState(null);
  const [generatedImage, setGeneratedImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Control de flujo de pasos: 'select-avatar' | 'camera' | 'loading' | 'result'
  const [currentStep, setCurrentStep] = useState<'select-avatar' | 'camera' | 'loading' | 'result'>('select-avatar');

  // Control para iniciar la cuenta regresiva de la cámara
  const [startCountdown, setStartCountdown] = useState(false);

  // Estado para almacenar la selección: { optionId: number, gender: 'female' | 'male', avatarSrc: string }
  const [selectedAvatar, setSelectedAvatar] = useState<{
    optionId: number;
    gender: 'female' | 'male';
    avatarSrc: string;
  } | null>(null);

  // Función para manejar la selección de avatar
  const handleSelectAvatar = (optionId: number, gender: 'female' | 'male') => {
    const option = avatarOptions.find(opt => opt.id === optionId);
    if (!option) return;

    const avatarSrc = gender === 'female' ? option.femaleAvatar : option.maleAvatar;

    setSelectedAvatar({
      optionId,
      gender,
      avatarSrc
    });
  };

  async function processFaceSwap(imageSrc) {
    if (!imageSrc || !selectedAvatar) {
      console.error('No se proporcionó la imagen o el avatar');
      return;
    }

    setCurrentStep('loading');
    setImageSrc(imageSrc);

    try {
      // Paso 1: Subir la foto del usuario a Firebase
      const userPhotoUrl = await uploadUserPhotoToFirebase(imageSrc);

      if (!userPhotoUrl) {
        throw new Error('No se pudo obtener la URL de la foto subida a Firebase');
      }


      // Paso 2: Realizar el face swap
      const response = await faceSwap(userPhotoUrl, selectedAvatar.avatarSrc);
      if (!response) {
        throw new Error('El proceso de face swap no devolvió una respuesta válida');
      }

      setGeneratedImage(response);
      setUrl(response);
      setCurrentStep('result');

    } catch (error) {
      console.error('Error en el proceso de face swap:', error);
      console.error('Detalles del error:', error.message);

      // Resetear el estado para que el usuario pueda intentar de nuevo
      alert('Hubo un error al procesar la imagen. Por favor, intenta nuevamente.');
      setCurrentStep('select-avatar');
      setSelectedAvatar(null);
      setImageSrc(null);
      setStartCountdown(false);
    }
  }

  function nextPage() {
    if (url.length > 0) {
      router.push("/outro");
    }
  }

  // Renderizado condicional según el paso actual
  if (currentStep === 'loading') {
    return (
      <LayoutHome backgroudFigureVariant={0}>

        <Loader />
        <p className="text-white text-2xl md:text-3xl font-tp-title font-bold mt-8 z-50">
          Cargando foto...
        </p>


      </LayoutHome>
    );
  }

  if (currentStep === 'camera') {
    // Si ya se inició el countdown, mostrar la cámara en pantalla completa
    if (startCountdown) {
      return (
        <LayoutHome backgroudFigureVariant={2}>

          <div className="w-full rounded-lg h-auto bg-[#ECE9E7] z-20 px-8 md:px-14 py-8 flex flex-col gap-8">
            {/* Cámara en vivo - Preview */}
            <div className="w-full flex justify-center items-center">
              <div className="relative w-full max-w-[600px] aspect-[3/4] rounded-3xl overflow-hidden">
                <Camera
                  countdownStart={3}
                  frameSrc={null}
                  onPhotoTaken={processFaceSwap}
                  facingMode={"user"}
                  aspectRatio={"cover"}
                />
              </div>
            </div>
          </div>
        </LayoutHome>
      );
    }

    // Mostrar preview de cámara con botón
    return (
      <LayoutHome backgroudFigureVariant={2}>
        <h1 className="w-full h-auto text-5xl md:text-6xl lg:text-7xl font-tp-title font-black leading-tight flex flex-col justify-start items-start z-0 mb-8">
          <span className="h-auto text-transparent bg-clip-text bg-gradient-to-r from-[#FF0082] to-[#FF0082]">
            Paso 2
          </span>
          <span className="h-auto text-[#FFFFFF]">
            Posiciónate
          </span>
        </h1>
        <div className="w-full rounded-lg h-auto bg-[#ECE9E7] z-20 px-8 md:px-14 py-8 flex flex-col gap-8">
          {/* Cámara en vivo - Preview */}
          <div className="w-full flex justify-center items-center">
            <div className="relative w-full max-w-[600px] aspect-[3/4] rounded-3xl overflow-hidden">
              <video
                autoPlay
                playsInline
                muted
                ref={(video) => {
                  if (video && !video.srcObject) {
                    navigator.mediaDevices
                      .getUserMedia({ video: { facingMode: 'user' } })
                      .then((stream) => {
                        video.srcObject = stream;
                      })
                      .catch((err) => console.error('Error accessing camera:', err));
                  }
                }}
                className="w-full h-full object-cover scale-x-[-1]"
              />
            </div>
          </div>

          {/* Botón Tomar la foto */}
          <div className="w-full flex justify-center items-center mt-4">
            <div className="w-auto px-32">
              <ButtonTp
                handleClick={() => setStartCountdown(true)}
                text="Tomar la foto"
              />
            </div>
          </div>
        </div>
      </LayoutHome>
    );
  }

  if (currentStep === 'result' && generatedImage) {
    return (
      <LayoutHome backgroudFigureVariant={2}>
        <h1 className="w-full h-auto text-5xl md:text-6xl lg:text-7xl font-tp-title font-black leading-tight flex flex-col justify-start items-start z-0 mb-8">
          <span className="h-auto text-transparent bg-clip-text bg-gradient-to-r from-[#FF0082] to-[#FF0082]">
            Paso 4
          </span>
          <span className="h-auto text-[#FFFFFF]">
            ¡Mírate!
          </span>
        </h1>
        <div className="w-full rounded-lg h-auto bg-[#ECE9E7] z-20 px-8 md:px-14 py-8 flex flex-col gap-8">
          {/* Imagen generada */}
          <div className="w-full flex justify-center items-center">
            <div className="relative w-full max-w-[600px] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                fill
                alt="generated image"
                className="object-cover"
                src={generatedImage}
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="w-full flex flex-col md:flex-row gap-4 justify-center items-center mt-4">
            <div className="w-auto px-16">
              <ButtonTp
                handleClick={() => {
                  // Reiniciar flujo
                  setCurrentStep('select-avatar');
                  setSelectedAvatar(null);
                  setImageSrc(null);
                  setGeneratedImage(undefined);
                  setStartCountdown(false);
                }}
                text="Repetir"
              />
            </div>
            <div className="w-auto px-16">
              <ButtonTp
                handleClick={nextPage}
                text="Continuar"
              />
            </div>
          </div>
        </div>
      </LayoutHome>
    );
  }


  // Paso 1: Selección de avatar (default)
  return (
    <LayoutHome backgroudFigureVariant={2}>

      <h1 className="w-full h-auto text-5xl md:text-6xl lg:text-7xl font-tp-title font-black leading-tight flex flex-col justify-start items-start z-0 mb-8 ">
        <span className="h-auto text-transparent bg-clip-text bg-gradient-to-r from-[#FF0082] to-[#FF0082]">
          Paso 1
        </span>

        <span className="h-auto text-[#FFFFFF] bg-clip-text]">
          Elige tu Avatar
        </span>
      </h1>
      <div className="w-full rounded-lg opacity-95 h-auto bg-[#ECE9E7] z-20 px-8 md:px-14 py-8 flex flex-col gap-8">
        {/* Grid de Avatares */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 place-items-center">
          {avatarOptions.map((avatar) => (
            <CardAvatarSelect
              key={avatar.id}
              optionNumber={avatar.id}
              femaleAvatarSrc={avatar.femaleAvatar}
              maleAvatarSrc={avatar.maleAvatar}
              selectedGender={selectedAvatar?.optionId === avatar.id ? selectedAvatar.gender : null}
              onSelectAvatar={handleSelectAvatar}
            />
          ))}
        </div>

        {/* Botón ELEGIR */}

        <div className="w-full flex justify-center items-center mt-4">
          <div className="w-auto px-32">
            <ButtonTp
              handleClick={() => {
                if (selectedAvatar) {
                  setCurrentStep('camera');
                }
              }}
              text="Elegir"
              disabled={!selectedAvatar}
            />
          </div>
        </div>

      </div>
    </LayoutHome>
  );
}
