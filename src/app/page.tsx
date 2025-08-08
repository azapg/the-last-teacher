import { Writer } from "@/components/Writer";

const WRITER_MAX_W = "max-w-5xl";

export default function Home() {
  return (
    <main className="min-h-screen w-full flex justify-center ">
      <Writer fontSize="clamp(28px,5vw,48px)" className={`pt-10 w-full ${WRITER_MAX_W}`}/>
    </main>
  );
}
