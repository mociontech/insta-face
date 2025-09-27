"use client"
import Image from 'next/image'
import React, { useState } from 'react'


export default function SelectGenderPage() {
  const [selectedImage, setSelectedImage] = useState(0)
  return (
    <section className='select-avatar relative w-full bg-no-repeat bg-top bg-cover h-screen flex flex-col justify-center items-center text-white'>
      <div className='absolute inset-0 bg-black opacity-30'></div>
      <h2 className='text-white z-10 font-bold text-[145px] font-loruner'>Selecciona</h2>
      {/* <span className='text-[48px] text-center z-10 w-[712px] h-[149px] text-white'> a tu personaje favorito y prepárate para posar a su lado</span> */}

      <div className='z-10 flex flex-row justify-center items-center'>
        <Image
          src="/mk/Mask_2.webp"
          alt="Background Image"
          width={520}
          height={927}
          priority
          className="animation-key w-[520px] h-[927px]"
        />
        <Image
          src="/mk/Mask_1.webp"
          alt="Background Image"
          width={520}
          height={927}
          priority
          className="animation-key w-[520px] h-[927px]"
        />
      </div>
      <div className="relative">
        <Image
          src="/mk/logo_mk.webp"
          alt="Logo"
          width={340}
          height={383}
          priority
          className="object-contain"
        />
      </div>
    </section>
  )
}
