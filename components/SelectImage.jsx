"use client";

export default function SelectImage({ setSelectedImage }) {
  return (
    <div className="relative">
      <img
        src="/selection.webp"
        alt="selection images"
        className="w-screen h-screen"
      />
      <button
        className="absolute top-[800px] left-[200px] w-[320px] h-[320px]"
        onClick={() => {
          setSelectedImage(1);
        }}
      />
      <button
        className="absolute top-[800px] right-[200px] w-[320px] h-[320px]"
        onClick={() => {
          setSelectedImage(2);
        }}
      />
      <button
        className="absolute top-[1150px] left-[200px] w-[320px] h-[320px]"
        onClick={() => {
          setSelectedImage(3);
        }}
      />
      <button
        className="absolute top-[1150px] right-[200px] w-[320px] h-[320px]"
        onClick={() => {
          setSelectedImage(4);
        }}
      />
    </div>
  );
}
