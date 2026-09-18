"use client";


type avatar = {
  avatar: string;
  url: string;
  label: string;
}
type SelectProps = {
  setSelectedImage: React.Dispatch<React.SetStateAction<string>>;
  avatars: avatar[];
}

export default function SelectImage({ setSelectedImage, avatars }: SelectProps) {
  return (
    <div
      className="relative z-50"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: "clamp(18px, 3.2vw, 36px)",
        width: "100%",
        maxWidth: "1120px",
        overflow: "hidden",
        transform: "translateY(clamp(-120px, -6vh, -70px))",
      }}
    >
      {
        avatars?.map((avatar) => (
          <button
            key={avatar.avatar}
            type="button"
            title={avatar.label}
            aria-label={avatar.label}
            className="group"
            style={{
              appearance: "none",
              background: "#fff",
              border: "8px solid #fff",
              borderRadius: "4px",
              boxShadow: "0 8px 18px rgba(0, 0, 0, 0.22)",
              cursor: "pointer",
              flex: "0 0 auto",
              height: "clamp(720px, 64vh, 940px)",
              overflow: "hidden",
              padding: 0,
              width: "clamp(360px, 36vw, 470px)",
            }}
            onClick={() => {
              setSelectedImage(avatar.url);
            }}
          >
            <img
              src={avatar.avatar}
              alt=""
              draggable={false}
              style={{
                background: "#fff",
                display: "block",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center bottom",
                width: "100%",
              }}
            />
          </button>
        ))
      }
    </div>
  );
}
