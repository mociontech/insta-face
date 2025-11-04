interface ButtonTpProps {
    handleClick: () => void;
    text: string;
    disabled?: boolean;
}
export const ButtonTp = ({handleClick, text, disabled = false}: ButtonTpProps) => {
    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={`w-full h-full group relative px-12 py-4 text-xl md:text-2xl font-bold text-white rounded-full shadow-lg transition-all duration-300 ${
                disabled 
                    ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-r from-[#FF0082] to-[#FF0082] hover:shadow-2xl hover:shadow-pink-500/50 hover:scale-105 active:scale-95'
            }`}
        >
            <span className="relative z-10 font-tp-title">{text}</span>
            {!disabled && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF0082] to-[#FF0082] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}
        </button>
    )
}