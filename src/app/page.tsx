import { Writer } from "@/components/Writer";
import { DemoBar } from "@/components/DemoBar";

const WRITER_MAX_W = "max-w-5xl";

export default function Home() {
  return (
    <main className="h-screen w-full flex flex-col">
      <DemoBar />
      <div className="w-full flex-1 min-h-0 flex overflow-hidden">
        <div className={`mx-auto ${WRITER_MAX_W} w-full h-full px-4 sm:px-6 flex flex-col min-h-0 flex-1`}>
          <Writer fontSize="clamp(28px,5vw,48px)" className="flex-1 min-h-0" />
        </div>
      </div>
    </main>
  );
}
