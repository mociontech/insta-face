interface GeneratedResultProps {
  imageUrl: string;
  onContinue: () => void;
}

export default function GeneratedResult({
  imageUrl,
  onContinue,
}: GeneratedResultProps) {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <img
        src="/resul.png"
        alt="Marco del resultado"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute left-[12.963%] top-[9.166667%] h-[65%] w-[73.888889%] overflow-hidden bg-[#E8E8E8]">
        <img
          src={imageUrl}
          alt="Resultado generado por IA"
          className="h-full w-full bg-[#E8E8E8] object-contain object-top"
        />
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="absolute left-[10.462963%] top-[89.479167%] h-[6.927083%] min-h-[72px] w-[79.166667%] rounded-[24px] bg-black text-[clamp(2.1rem,4vw,4.5rem)] font-black uppercase tracking-[0.02em] text-white shadow-[0_14px_40px_rgba(0,0,0,0.35)] transition-transform duration-200 active:scale-[0.99]"
      >
        Continuar
      </button>
    </div>
  );
}
