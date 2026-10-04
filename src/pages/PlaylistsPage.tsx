import { SectionSlot } from "../sections/registry";
import { SurfaceCard } from "../ui/primitives";

export function PlaylistsPage() {
  return (
    <SurfaceCard className="p-5">
      <SectionSlot id="collection" params={{ kind: "playlists" }} />
    </SurfaceCard>
  );
}
