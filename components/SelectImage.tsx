"use client";

export default function SelectImage({ setSelectedImage }) {
  return (
    <div className="relative">
      <img
        src="/Display3.png"
        alt="selection images"
        className="w-screen h-screen"
      />
      <button
        className="absolute top-[735px] left-[100px] w-[250px] h-[250px]"
        onClick={() => {
          setSelectedImage(1);
        }}
      />
      <button
        className="absolute top-[735px] left-[420px] w-[250px] h-[250px]"
        onClick={() => {
          setSelectedImage(2);
        }}
      />
      <button
        className="absolute top-[735px] right-[100px] w-[250px] h-[250px]"
        onClick={() => {
          setSelectedImage(3);
        }}
      />
      <button
        className="absolute top-[1050px] right-[730px] w-[250px] h-[250px]"
        onClick={() => {
          setSelectedImage(4);
        }}
      />
      <button
        className="absolute top-[1050px] right-[420px] w-[250px] h-[250px]"
        onClick={() => {
          setSelectedImage(5);
        }}
      />
      <button
        className="absolute top-[1050px] right-[100px] w-[250px] h-[250px]"
        onClick={() => {
          setSelectedImage(6);
        }}
      />
    </div>
  );
}
