// /components/LoaderCamera.tsx
export default function LoaderCamera() {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      {/* Marco de cámara */}
      <img
        src="/MarcoNestle.png"
        alt="Marco"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
      
      {/* Contenido del loader */}
      <div className="text-center relative z-10">
        {/* Spinner simple */}
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        
        {/* Texto con fuente personalizada */}
        <p 
          className="text-white text-2xl font-bold"
          style={{
            fontFamily: "'Ari-W9500-Bold', monospace",
            fontSmooth: "never",
            WebkitFontSmoothing: "none",
            MozOsxFontSmoothing: "none"
          }}
        >
          Generando imagen...
        </p>
      </div>
    </div>
  );
}