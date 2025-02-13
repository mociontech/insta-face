"use client";

import Image from "next/image";

export default function SelectImage({ setSelectedImage }) {
  return (
    <div className="select flex items-center justify-center w-screen h-screen flex-col p-5">
      <div className="grid grid-flow-col grid-rows-2 gap-5 md:gap-5 lg:gap-10 mt-[60%] lg:mt-[60%]">
        <button
          className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px] bg-black rounded-[2em]"
          onClick={() => {
            setSelectedImage(3);
          }}
          style={{ backgroundImage: `url('/phone.png')` }}
        />
        <button
          className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px] bg-black rounded-[2em]"
          onClick={() => {
            setSelectedImage(4);
          }}
          style={{ backgroundImage: `url('/phone.png')` }}
        />
        <button
          className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px] bg-black rounded-[2em]"
          onClick={() => {
            setSelectedImage(2);
          }}
          style={{ backgroundImage: `url('/phone.png')` }}
        />
        <button
          className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px] bg-black rounded-[2em]"
          onClick={() => {
            setSelectedImage(1);
          }}
          style={{ backgroundImage: `url('/phone.png')` }}
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
