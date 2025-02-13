"use client";

import Image from "next/image";

export default function SelectImage({ setSelectedImage }) {
  return (
    <div className="select flex items-center justify-center w-screen h-screen flex-col p-5">
      <div className="grid grid-flow-col grid-rows-2 gap-20 mt-[60%] lg:mt-[20%]">
        <button
          className="w-[100px] h-[100px] sm:w-[200px] sm:h-[200px] md:w-[300px] md:h-[300px] lg:w-[200px] lg:h-[200px] bg-black"
          onClick={() => {
            setSelectedImage(3);
          }}
        />
        <button
          className="w-[100px] h-[100px] sm:w-[200px] sm:h-[200px] md:w-[300px] md:h-[300px] lg:w-[200px] lg:h-[200px] bg-black"
          onClick={() => {
            setSelectedImage(4);
          }}
        />
        <button
          className="w-[100px] h-[100px] sm:w-[200px] sm:h-[200px] md:w-[300px] md:h-[300px] lg:w-[200px] lg:h-[200px] bg-black"
          onClick={() => {
            setSelectedImage(2);
          }}
        />
        <button
          className="w-[100px] h-[100px] sm:w-[200px] sm:h-[200px] md:w-[300px] md:h-[300px] lg:w-[200px] lg:h-[200px] bg-black"
          onClick={() => {
            setSelectedImage(1);
          }}
        />
      </div>
      {/* <Image
        width={2000}
        height={2000}
        src="/selection.webp"
        alt="selection images"
        className="w-screen h-screen"
      /> */}
    </div>
  );
}
