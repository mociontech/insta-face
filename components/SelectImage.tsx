"use client";

export default function SelectImage({ setSelectedImage }) {
  return (
      <div className="relative">
        <img
          src="/seleccion.jpg"
          alt="selection images"
          className="w-screen h-screen object-cover"
        />

        <div className="absolute top-[845px] left-1/2 -translate-x-1/2 grid grid-cols-2 gap-x-10 gap-y-10 w-[680px]">
        <button
          className="w-[320px] h-[320px]"
          onClick={() => setSelectedImage(1)}
        />
        <button
          className="w-[320px] h-[320px]"
          onClick={() => setSelectedImage(2)}
        />
        <button
          className="w-[320px] h-[320px]"
          onClick={() => setSelectedImage(3)}
        />
        <button
          className="w-[320px] h-[320px]"
          onClick={() => setSelectedImage(4)}
        />
      </div>

      </div>

  );
}
