export default function Loader() {
  return (
    <div className="absolute z-50 h-screen w-screen flex justify-center items-center">
      <img
        className="absolute top-0 left-0"
        src={`/screens/marco${process.env.NEXT_PUBLIC_MARCO}.png`}
        alt=""
      />
      <img src="/star.gif" alt="" />
    </div>
  );
}
