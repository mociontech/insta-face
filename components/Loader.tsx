// components/Loader.tsx
import styles from "./Loader.module.css";

export default function Loader({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col gap-[clamp(2rem,5vh,6rem)] justify-center items-center px-4">
      <svg
        viewBox="0 0 256 256"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin-sync w-[clamp(120px,20vw,200px)] h-[clamp(120px,20vw,200px)]"
      >
        <rect fill="none" height="330" width="330" />
        <line className={styles.strokeAnim1} strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" x1="128" x2="128" y1="32" y2="64" />
        <line className={styles.strokeAnim2} strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" x1="224" x2="192" y1="128" y2="128" />
        <line className={styles.strokeAnim3} strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" x1="195.9" x2="173.3" y1="195.9" y2="173.3" />
        <line className={styles.strokeAnim4} strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" x1="128" x2="128" y1="224" y2="192" />
        <line className={styles.strokeAnim5} strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" x1="60.1" x2="82.7" y1="195.9" y2="173.3" />
        <line className={styles.strokeAnim6} strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" x1="32" x2="64" y1="128" y2="128" />
        <line className={styles.strokeAnim7} strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" x1="60.1" x2="82.7" y1="60.1" y2="82.7" />
      </svg>

      <p className="text-white font-bold text-[clamp(1.5rem,6vw,3.75rem)] text-center leading-tight">
        {message || "Cargando foto..."}
      </p>
    </div>
  );
}
