import { SectionSlot } from "../sections/registry";
import { SurfaceCard } from "../ui/primitives";
import { usePreferences } from "../app/PreferencesContext";

export function PlaylistsPage() {
  const { dir } = usePreferences();
  return (
    <SurfaceCard dir={dir} className="p-5">
      <SectionSlot id="collection" params={{ kind: "playlists" }} />
    </SurfaceCard>
  );
}
