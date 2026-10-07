export default function Loader({ message }: { message?: string }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-[#06194d] bg-no-repeat"
      role="status"
      aria-live="polite"
      aria-label={message || "Espera el procesamiento de tu vision"}
      style={{
        backgroundImage: 'url("/ENRUTA/enruta7.png")',
        backgroundSize: "100% 100%",
      }}
    />
  );
}
