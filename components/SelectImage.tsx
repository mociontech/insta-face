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
    <div className="flex flex-wrap gap-[49px] justify-center items-center">
      {
        avatars?.map((avatar, index) => (
          <button
            key={avatar.avatar}
            type="button"
            title="image"
            className="btn-primary w-[735px] text-center py-[44px] text-[65px] text-white"
            onClick={() => {
              // setSelectedImage(index + 1);
              setSelectedImage(avatar.url);
            }}
          >
            {/* <Image
              width={1200}
              height={1091}
              src={avatar.avatar}
              alt="selection images"
              className="w-[275px] h-[275px]"
            /> */}
            {avatar.gender}
          </button>
        ))
      }
    </div>
  );
}
