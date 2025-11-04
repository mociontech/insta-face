import Image from "next/image";

export default function Loader() {
  return (
    <div className="absolute z-50 h-screen w-screen flex justify-center items-center bg-black/10">
      <div className="animate-spin w-[200px] h-[200px]">
        <Image
          src="/tp/Loading.png"
          alt="Loading"
          width={200}
          height={200}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
