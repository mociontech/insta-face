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
    <div className="flex flex-col justify-center items-center w-full gap-6">
      {
        avatars?.map((avatar, index) => (
          <button
            key={avatar.avatar}
            type="button"
            title="image"
            className="btn-primary text-white w-[243px] font-bold"
            onClick={() => {
              setSelectedImage(avatar.url);
            }}
          >
            {avatar.gender}
          </button>
        ))
      }
    </div>
  );
}
