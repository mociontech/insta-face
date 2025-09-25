import React, { useState } from 'react'
import Image from 'next/image'

type Props = {
  value:string
  onChange: (value: string) => void
  onSubmit: () => void
}

function Keyboard({ value, onChange, onSubmit }: Props) {
  const [mode, setMode] = useState<'letters' | 'numbers'>('numbers')
  const handleKeyPress = (char: string) => {
    onChange(value + char)
  }

  const handleDelete = () => {
    onChange(value.slice(0, -1))
  }

  const renderKeys = () => {
    if (mode === 'numbers') {
      return (
        <div className='relative flex flex-wrap items-center justify-center gap-[27px] w-[740px] h-[325px] px-16 py-12'>
          <Image
            className='absolute w-[740px] h-[325px] inset-0 pointer-events-none z-10'
            src="/mk/bg_keyboard.webp"
            alt="Keyboard" width={651} height={325}
          />
          {[...Array(10).keys()].map((i) => (
            <button
              type="button"
              title="numero"
              onClick={() => handleKeyPress((i + 1).toString())}
              className={`z-50 animation-key key-number text-center flex justify-center items-center cursor-pointer ${i % 2 === 0 ? 'rotated' : ''}`}
              key={i}
            >
              <span className={`text-shadow-md border-text font-bold text-[77px] ${i % 2 === 0 ? 'rotate-180' : ''}`}>{i + 1}</span>
            </button>
          ))}
        </div>
      )
    }

    return (
      <div className='relative flex flex-col items-center justify-center gap-4 w-[740px] h-[325px] px-16 py-12'>
        <Image
          className='absolute w-[740px] h-[325px] inset-0 pointer-events-none z-10'
          src="/mk/bg_keyboard.webp"
          alt="Keyboard" width={651} height={325}
        />
        {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, rowIndex) => (
          <div className='flex gap-[27px] z-50' key={`row-${rowIndex}`}>
            {row.split('').map((char, i) => (
              <button
                type="button"
                title={char}
                onClick={() => handleKeyPress(char)}
                className={`z-50 animation-key key-letter text-center flex justify-center items-center cursor-pointer ${i % 2 === 0 ? 'rotated' : ''}`}
                key={`char-${char}`}
              >
                <span className={`text-shadow-md border-text font-bold text-[40px] ${i % 2 === 0 ? 'rotate-180' : ''}`}>{char}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='w-[740px]'>
      
      <div className='flex items-center justify-between h-[130px]'>
        <button
          type="button"
          title="letras"
          onClick={() => setMode(prev => (prev === 'letters' ? 'numbers' : 'letters'))}
          className="relative animation-key w-[190px] h-auto aspect-square flex items-center justify-center -left-20"
        >
          <img
            src="/mk/bg_button.webp"
            alt="Keyboard Button"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
            width={185}
            height={86}
          />
          <span className="relative z-20 text-white font-bold text-[clamp(16px,3vw,33px)] tracking-wide">

            {
              mode !== 'numbers' ? 'NÚMEROS' : 'LETRAS'
            }
          </span>
        </button>

        <button
          type="button"
          title="delete"
          onClick={handleDelete}
          className="relative animation-key w-[190px] h-auto aspect-square flex items-center justify-center -right-20"
        >
          <img
            src="/mk/bg_button.webp"
            alt="Keyboard Button"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
            width={185}
            height={86}
          />
          <span className="relative z-20 text-white font-bold text-[clamp(16px,3vw,33px)] tracking-wide">
            DELETE
          </span>
        </button>
      </div>


      {renderKeys()}


      <div className='flex items-center justify-center'>
        <button
          type="button"
          title="enter"
          onClick={onSubmit}
          className="relative animation-key w-[268px] h-auto aspect-square flex items-center justify-center"
        >
          <img
            src="/mk/bg_button.webp"
            alt="Keyboard Button"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
            width={185}
            height={86}
          />
          <span className="  z-20 text-white font-bold text-[61px] tracking-wide">
            Enter
          </span>
        </button>
      </div>
    </div>
  )
}

export default Keyboard
