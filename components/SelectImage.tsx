"use client";

type Avatar = {
  avatar: string;
  url: string;
  label: string;
  position: {
    left: string;
    top: string;
    width: string;
    height: string;
  };
};

type SelectProps = {
  setSelectedImage: React.Dispatch<React.SetStateAction<string | null>>;
  avatars: Avatar[];
};

export default function SelectImage({ setSelectedImage, avatars }: SelectProps) {
  return (
    <div className="absolute inset-0 z-20">
      {avatars.map((avatar) => (
        <button
          key={avatar.avatar}
          type="button"
          title={avatar.label}
          aria-label={avatar.label}
          className="absolute overflow-hidden bg-white transition-transform duration-150 active:scale-[0.98]"
          style={{
            border: "0",
            borderRadius: "0",
            cursor: "pointer",
            padding: 0,
            ...avatar.position,
          }}
          onClick={() => setSelectedImage(avatar.url)}
        >
          <img
            src={avatar.avatar}
            alt=""
            draggable={false}
            className="h-full w-full"
            style={{
              display: "block",
              objectFit: "cover",
              objectPosition: "center center",
            }}
          />
        </button>
      ))}
    </div>
  );
}
