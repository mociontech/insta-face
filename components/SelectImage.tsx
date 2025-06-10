"use client";

import { useState } from "react";

export default function SelectImage({ setSelectedImage }) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [currentSelection, setCurrentSelection] = useState({
    sex: "",
    photo: 0,
    anime: false,
  });

  function nextScreen() {
    setCurrentScreen((prevScreen) => prevScreen + 1);
  }

  function selectSex(sex) {
    setCurrentSelection((prevState) => ({
      ...prevState, // Copia todas las propiedades existentes
      sex: sex, // Sobrescribe solo la propiedad 'sex'
    }));
    nextScreen();
  }

  function selectPhoto(photo) {
    setCurrentSelection((prevState) => ({
      ...prevState, // Copia todas las propiedades existentes
      photo: photo, // Sobrescribe solo la propiedad 'sex'
    }));
    nextScreen();
  }

  function selectStyle(style) {
    const currentSel = { ...currentSelection }; // Copia superficial
    currentSel.anime = style;

    setSelectedImage(currentSel);
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      {currentScreen === 0 && (
        <div className="sel-1 w-screen h-screen">
          <button
            className="absolute top-[777px] left-[65px] w-[461px] h-[692px]"
            onClick={() => {
              selectSex("male");
            }}
          />
          <button
            className="absolute top-[777px] right-[65px] w-[461px] h-[692px]"
            onClick={() => {
              selectSex("female");
            }}
          />
        </div>
      )}
      {currentScreen === 1 && (
        <div className="w-screen h-screen">
          <img
            className="w-screen h-screen"
            src={`/screens/${currentSelection.sex}.jpg`}
            alt=""
          />
          <button
            className="absolute top-[557px] left-[207px] w-[305px] h-[542px]"
            onClick={() => {
              selectPhoto(1);
            }}
          />
          <button
            className="absolute top-[557px] left-[547px] w-[305px] h-[542px]"
            onClick={() => {
              selectPhoto(2);
            }}
          />
          <button
            className="absolute top-[1122px] left-[207px] w-[305px] h-[542px]"
            onClick={() => {
              selectPhoto(3);
            }}
          />
          <button
            className="absolute top-[1122px] left-[547px] w-[305px] h-[542px]"
            onClick={() => {
              selectPhoto(4);
            }}
          />
        </div>
      )}
      {currentScreen === 2 && (
        <div className="sel-3 w-screen h-screen">
          <button
            className="absolute top-[890px] left-[140px] w-[810px] h-[239px]"
            onClick={() => {
              selectStyle(false);
            }}
          />
          <button
            className="absolute top-[1180px] left-[140px] w-[810px] h-[239px]"
            onClick={() => {
              selectStyle(true);
            }}
          />
        </div>
      )}
    </div>
  );
}
