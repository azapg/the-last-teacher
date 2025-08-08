import { Writer } from "@/components/Writer";
import { DemoBar } from "@/components/DemoBar";

const WRITER_MAX_W = "max-w-5xl";

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col">
      <DemoBar />
      <div className="w-full flex justify-center flex-1">
        <Writer fontSize="clamp(28px,5vw,48px)" className={`pt-10 w-full ${WRITER_MAX_W}`} />
      </div>
    </main>
  );
}
