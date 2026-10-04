import { SectionSlot } from "../sections/registry";
import { SurfaceCard } from "../ui/primitives";

export function AlbumsPage() {
  return (
    <SurfaceCard className="p-5">
      <SectionSlot id="collection" params={{ kind: "albums" }} />
    </SurfaceCard>
  );
}
