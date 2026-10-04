import { SectionSlot } from "../sections/registry";
import { SurfaceCard } from "../ui/primitives";

export function ArtistsPage() {
  return (
    <SurfaceCard className="p-5">
      <SectionSlot id="collection" params={{ kind: "artists" }} />
    </SurfaceCard>
  );
}
