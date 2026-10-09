export default function Loader({ message }: { message?: string }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-[#06194d] bg-no-repeat"
      role="status"
      aria-live="polite"
      aria-label={message || "Espera el procesamiento de tu vision"}
      style={{
        backgroundImage: 'url("/ENRUTA/imagen7.png")',
        backgroundSize: "100% 100%",
      }}
    >
      <img
        src="/ENRUTA/leader.gif"
        alt=""
        aria-hidden="true"
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          height: "auto",
          left: "50%",
          top: "36%",
          width: "clamp(150px, 24vw, 260px)",
        }}
      />
    </div>
  );
}
