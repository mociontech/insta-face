"use client";

import Image from "next/image";

type avatar = {
  gender: string;
  avatar: string;
  url: string;
}
type SelectProps = {
  setSelectedImage: React.Dispatch<React.SetStateAction<string>>;
  avatars: avatar[];
}

export default function SelectImage({ setSelectedImage, avatars }: SelectProps) {

  return (
    <div className="relative flex flex-col justify-center items-center w-full">
      <Image
        width={1080}
        height={1920}
        src="/uniminuto/elegir_avatar.jpg"
        alt="selection images"
        className="absolute z-20 w-[570px]  h-screen"
      />
      <div className="z-50 w-[400px] flex flex-wrap justify-center items-center  gap-6 mt-24">

        <div className="flex flex-col justify-center items-center gap-3">
          <div className="flex justify-center items-center gap-6">
            <button
              title="index"
              type="button"
              className=" w-[80px] h-[80px] bg-red-200 rounded-[5px]"
              onClick={() => {
                setSelectedImage(avatars[0].url);
              }}
            >
              <Image src="/uniminuto/botones/AVATAR_1.png" width={204} height={204} alt="avatar"/>
            </button>
            <button
              title="index"
              type="button"
              className=" w-[80px] h-[80px] bg-red-200 rounded-[5px]"
              onClick={() => {
                setSelectedImage( avatars[1].url);
              }}
            >
              <Image src="/uniminuto/botones/AVATAR_2.png" width={204} height={204} alt="avatar" />
            </button>
          </div>
          <span>Físico - matemático</span>
        </div>
        <div className="flex flex-col justify-center items-center gap-3">
          <div className="flex justify-center items-center gap-6">
            <button
              title="index"
              type="button"
              className=" w-[80px] h-[80px] bg-red-200 rounded-[5px]"
              onClick={() => {
                setSelectedImage(avatars[2].url);
              }}
            >
              <Image src="/uniminuto/botones/AVATAR_3.png" width={204} height={204} alt="avatar" />
            </button>
            <button
              title="index"
              type="button"
              className=" w-[80px] h-[80px] bg-red-200 rounded-[5px]"
              onClick={() => {
                setSelectedImage(avatars[3].url);
              }}
            >
              <Image src="/uniminuto/botones/AVATAR_4.png" width={204} height={204} alt="avatar" />
            </button>
          </div>
          <span>Ciencias de la Salud</span>
        </div>
        <div className="flex flex-col justify-center items-center gap-3">
          <div className="flex justify-center items-center gap-6">
            <button
              title="index"
              type="button"
              className=" w-[80px] h-[80px] bg-red-200 rounded-[5px] mt-6"
              onClick={() => {
                setSelectedImage(avatars[4].url);
              }}
            >
              <Image src="/uniminuto/botones/AVATAR_5.png" width={204} height={204} alt="avatar" />

            </button>
            <button
              title="index"
              type="button"
              className=" w-[80px] h-[80px] bg-red-200 rounded-[5px] mt-6"
              onClick={() => {
                setSelectedImage(avatars[5].url);
              }}
            >
              <Image src="/uniminuto/botones/AVATAR_6.png" width={204} height={204} alt="avatar" />

            </button>
          </div>
          <span className="text-center">Ciencias sociales <br />
            y admin</span>
        </div>
        <div className="flex flex-col justify-center items-center gap-3">
          <div className="flex justify-center items-center gap-6">
            <button
              title="index"
              type="button"
              className=" w-[80px] h-[80px] bg-red-200 rounded-[5px]"
              onClick={() => {
                setSelectedImage(avatars[6].url);
              }}
            >
              <Image src="/uniminuto/botones/AVATAR_7.png" width={204} height={204} alt="avatar" />
            </button>
            <button
              title="index"
              type="button"
              className=" w-[80px] h-[80px] bg-red-200 rounded-[5px]"
              onClick={() => {
                setSelectedImage(avatars[7].url);
              }}
            >
              <Image src="/uniminuto/botones/AVATAR_8.png" width={204} height={204} alt="avatar" />
            </button>
          </div>
          <span>Humanidades y Artes</span>
        </div>

        <div className="flex flex-col justify-center items-center gap-3">
          <div className="flex justify-center items-center gap-6">
            <button
              title="index"
              type="button"
              className=" w-[80px] h-[80px] bg-red-200 rounded-[5px]"
              onClick={() => {
                setSelectedImage(avatars[8].url);
              }}
            >
              <Image src="/uniminuto/botones/AVATAR_9.png" width={204} height={204} alt="avatar" />

            </button>
            <button
              title="index"
              type="button"
              className=" w-[80px] h-[80px] bg-red-200 rounded-[5px]"
              onClick={() => {
                setSelectedImage(avatars[9].url);
              }}
            >
              <Image src="/uniminuto/botones/AVATAR_10.png" width={204} height={204} alt="avatar" />

            </button>
          </div>
          <span>Ingeniería</span>
        </div>
      </div>


    </div>
  );
}
