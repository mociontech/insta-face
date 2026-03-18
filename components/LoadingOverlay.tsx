interface LoadingOverlayProps {
  label?: string;
}

export default function LoadingOverlay({
  label = "Cargando...",
}: LoadingOverlayProps) {
  return (
    <div
      className="loader-screen fixed inset-0 z-[999] flex items-center justify-center overflow-hidden"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex -translate-y-[6vh] flex-col items-center text-center">
        <img
          src="/wired-outline-213-arrow-2-rounded-hover-pinch.gif"
          alt={label}
          className="h-[clamp(120px,18vw,170px)] w-[clamp(120px,18vw,170px)] object-contain"
        />
        <p className="mt-6 max-w-[10ch] text-[clamp(2rem,3.6vw,3.4rem)] font-black leading-[1.1] text-white">
          {label}
        </p>
      </div>
    </div>
  );
}
