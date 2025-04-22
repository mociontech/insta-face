"use client";

import Image from "next/image";

export default function SelectImage({ setSelectedImage }) {
  return (
    <div className="relative">
      <Image
        width={2000}
        height={2000}
        src="/selection.webp"
        alt="selection images"
        className="w-screen h-screen"
      />
      <button
        className="absolute top-[800px] left-[200px] w-[320px] h-[320px] bg-red-500"
        onClick={() => {
          setSelectedImage(1);
        }}
      />
      <button
        className="absolute top-[800px] right-[200px] w-[320px] h-[320px] bg-red-500"
        onClick={() => {
          setSelectedImage(2);
        }}
      />
      <button
        className="absolute top-[1150px] left-[200px] w-[320px] h-[320px] bg-red-500"
        onClick={() => {
          setSelectedImage(3);
        }}
      />
      <button
        className="absolute top-[1150px] right-[200px] w-[320px] h-[320px] bg-red-500"
        onClick={() => {
          setSelectedImage(4);
        }}
      />
    </div>
  );
}
