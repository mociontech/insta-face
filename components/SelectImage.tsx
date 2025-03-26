"use client";

export default function SelectImage({ setSelectedImage }) {
  return (
    <div className="relative">
      <img
        src="/seleccion.png"
        alt="selection images"
        className="w-screen h-screen"
      />
      <button
        className="absolute top-[1030px] left-[100px] w-[250px] h-[250px]"
        onClick={() => {
          setSelectedImage(1);
        }}
      />
      <button
        className="absolute top-[1030px] right-[420px] w-[250px] h-[250px]"
        onClick={() => {
          setSelectedImage(2);
        }}
      />
      <button
        className="absolute top-[1030px] right-[100px] w-[250px] h-[250px]"
        onClick={() => {
          setSelectedImage(3);
        }}
      />
      <button
        className="absolute top-[1340px] left-[100px] w-[250px] h-[250px]"
        onClick={() => {
          setSelectedImage(4);
        }}
      />
      <button
        className="absolute top-[1340px] right-[420px] w-[250px] h-[250px]"
        onClick={() => {
          setSelectedImage(5);
        }}
      />
      <button
        className="absolute top-[1340px] right-[100px] w-[250px] h-[250px]"
        onClick={() => {
          setSelectedImage(6);
        }}
      />
    </div>
  );
}
