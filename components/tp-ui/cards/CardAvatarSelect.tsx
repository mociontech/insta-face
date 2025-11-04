import Image from "next/image";

interface CardAvatarSelectProps {
    optionNumber: number;
    femaleAvatarSrc: string;
    maleAvatarSrc: string;
    selectedGender?: 'female' | 'male' | null;
    onSelectAvatar: (optionId: number, gender: 'female' | 'male') => void;
}

export const CardAvatarSelect = ({
    optionNumber,
    femaleAvatarSrc,
    maleAvatarSrc,
    selectedGender = null,
    onSelectAvatar
}: CardAvatarSelectProps) => {
    return (
        <div className="w-full max-w-[320px] h-auto bg-[#ECE9E7] rounded-3xl p-4 pb-6">
            {/* Contenedor de Avatares */}
            <div className="w-full flex gap-3 mb-4">
                {/* Avatar Femenino */}
                <button
                    onClick={() => onSelectAvatar(optionNumber, 'female')}
                    className={`
                        flex-1 relative aspect-[3/4] rounded-2xl overflow-hidden 
                        bg-gradient-to-b from-blue-900/20 to-cyan-500/20
                        cursor-pointer transition-all duration-300
                        hover:scale-105 hover:shadow-xl
                        ${selectedGender === 'female' 
                            ? 'ring-4 ring-[#FF0082] shadow-2xl shadow-pink-500/50 scale-105' 
                            : 'hover:ring-2 hover:ring-[#FF0082]/50'
                        }
                    `}
                >
                    <Image
                        src={femaleAvatarSrc}
                        alt={`Avatar femenino opción ${optionNumber}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 160px"
                    />
                </button>

                {/* Avatar Masculino */}
                <button
                    onClick={() => onSelectAvatar(optionNumber, 'male')}
                    className={`
                        flex-1 relative aspect-[3/4] rounded-2xl overflow-hidden 
                        bg-gradient-to-b from-blue-900/20 to-cyan-500/20
                        cursor-pointer transition-all duration-300
                        hover:scale-105 hover:shadow-xl
                        ${selectedGender === 'male' 
                            ? 'ring-4 ring-[#FF0082] shadow-2xl shadow-pink-500/50 scale-105' 
                            : 'hover:ring-2 hover:ring-[#FF0082]/50'
                        }
                    `}
                >
                    <Image
                        src={maleAvatarSrc}
                        alt={`Avatar masculino opción ${optionNumber}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 160px"
                    />
                </button>
            </div>

            {/* Texto de Opción */}
            <div className="w-full text-center">
                <p className="text-2xl md:text-3xl text-[#0a0a0a]">
                    Opción {optionNumber}
                </p>
            </div>
        </div>
    );
};
