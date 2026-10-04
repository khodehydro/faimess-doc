import { SectionSlot } from "../sections/registry";
import { SurfaceCard } from "../ui/primitives";
import { usePreferences } from "../app/PreferencesContext";

export function ArtistsPage() {
  const { dir } = usePreferences();
  return (
    <SurfaceCard dir={dir} className="p-6">
      <SectionSlot id="collection" params={{ kind: "artists" }} />
    </SurfaceCard>
  );
}
