"use client";

import { useState } from "react";
import {
  avatarPairOptions,
  getAvatarIdForPair,
  getAvatarOption,
} from "@/lib/avatarOptions";
import { useUser } from "@/hooks/useUser";

export default function SelectImage({ setSelectedImage }) {
  const { gender } = useUser();
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  function handleImageError(id: string) {
    setFailedImages((current) => ({
      ...current,
      [id]: true,
    }));
  }

  function handleContinue() {
    if (!selectedPairId) {
      return;
    }

    const avatarId = getAvatarIdForPair(selectedPairId, gender);

    if (avatarId) {
      setSelectedImage(avatarId);
    }
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <img
        src="/ava.png"
        alt="Seleccion de avatar"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute left-1/2 top-[42.8%] grid w-[780px] -translate-x-1/2 grid-cols-[363px_363px] justify-between gap-y-12">
        {avatarPairOptions.map((pair) => {
          const femaleAvatar = getAvatarOption(pair.femaleAvatarId);
          const maleAvatar = getAvatarOption(pair.maleAvatarId);
          const isSelected = selectedPairId === pair.id;

          if (!femaleAvatar || !maleAvatar) {
            return null;
          }

          return (
            <button
              key={pair.id}
              type="button"
              onClick={() => setSelectedPairId(pair.id)}
              className="flex w-[363px] flex-col items-center justify-self-center text-white"
            >
              <div
                className={`flex h-[182px] w-[363px] overflow-hidden rounded-[18px] border-2 bg-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.28)] transition-all duration-200 ${
                  isSelected
                    ? "border-white shadow-[0_0_0_4px_rgba(255,255,255,0.18),0_18px_40px_rgba(0,0,0,0.35)]"
                    : "border-white/70"
                }`}
              >
                {!failedImages[femaleAvatar.id] ? (
                  <img
                    src={femaleAvatar.previewImageUrl}
                    alt={femaleAvatar.label}
                    className="h-[182px] w-[181.5px] object-cover object-top"
                    onError={() => handleImageError(femaleAvatar.id)}
                  />
                ) : (
                  <div className="flex h-[182px] w-[181.5px] items-center justify-center bg-slate-900 text-sm text-white/75">
                    Sin imagen
                  </div>
                )}
                {!failedImages[maleAvatar.id] ? (
                  <img
                    src={maleAvatar.previewImageUrl}
                    alt={maleAvatar.label}
                    className="h-[182px] w-[181.5px] object-cover object-top"
                    onError={() => handleImageError(maleAvatar.id)}
                  />
                ) : (
                  <div className="flex h-[182px] w-[181.5px] items-center justify-center bg-slate-900 text-sm text-white/75">
                    Sin imagen
                  </div>
                )}
              </div>
              <span className="telegraf-bold mt-2 text-[clamp(1.15rem,1.8vw,1.9rem)]">
                {pair.label}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!selectedPairId}
        onClick={handleContinue}
        className={`telegraf-bold absolute left-[10.462963%] top-[84.375%] h-[6.927083%] min-h-[72px] w-[79.166667%] rounded-[24px] text-[clamp(2.1rem,4vw,4.5rem)] uppercase text-white shadow-[0_14px_40px_rgba(0,0,0,0.35)] transition-opacity ${
          selectedPairId ? "bg-black opacity-100" : "bg-black/70 opacity-70"
        }`}
      >
        Continuar
      </button>
    </div>
  );
}
