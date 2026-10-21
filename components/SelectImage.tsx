"use client";

import type { Avatar } from "@/lib/experience";

type SelectProps = {
  setSelectedImage: React.Dispatch<React.SetStateAction<string | null>>;
  avatars: Avatar[];
};

export default function SelectImage({ setSelectedImage, avatars }: SelectProps) {
  return (
    <div className="grid w-full max-w-4xl grid-cols-2 gap-4">
      {avatars.map((avatar) => (
        <button
          key={avatar.avatar}
          type="button"
          title={avatar.label}
          aria-label={avatar.label}
          className={avatar.embedded ? "art-hit-area" : `${avatar.position ? "absolute" : "relative aspect-[3/5]"} overflow-hidden bg-transparent transition-transform duration-150 active:scale-[0.98]`}
          style={{
            border: "0",
            borderRadius: "0",
            cursor: "pointer",
            padding: 0,
            ...avatar.position,
          }}
          onClick={() => setSelectedImage(avatar.url)}
        >
          {!avatar.embedded && <img
            src={avatar.avatar}
            alt=""
            draggable={false}
            className="h-full w-full"
            style={{
              display: "block",
              objectFit: "contain",
              objectPosition: "center center",
            }}
          />}
          <span className="sr-only">{avatar.label}</span>
        </button>
      ))}
    </div>
  );
}
