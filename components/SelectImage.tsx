"use client";

export default function SelectImage({ setSelectedImage }) {
  return (
    <div className="relative w-screen h-screen">
      <img
        src="/seleccion.png"
        alt="selection images"
        className="w-full h-full object-cover"
      />

      {/* Grid de botones desde la mitad hacia abajo */}
      <div className="absolute top-1/2 left-0 right-0 flex justify-center">
        <div className="grid grid-cols-2 gap-12">
          {[1, 2, 3, 4].map((num) => (
            <button
              key={num}
              className="w-[340px] h-[340px] bg-transparent hover:ring-4 ring-blue-500"
              onClick={() => setSelectedImage(num)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
