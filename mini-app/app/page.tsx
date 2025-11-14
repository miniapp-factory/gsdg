import { description, title } from "@/lib/metadata";
import Game2048 from "@/components/2048";
import { generateMetadata } from "@/lib/farcaster-embed";

export { generateMetadata };

export default function Home() {
  return (
    <main className="flex flex-col gap-3 place-items-center px-4">
      <span className="text-2xl">{title}</span>
      <span className="text-muted-foreground">{description}</span>
      <Game2048 />
    </main>
  );
}
