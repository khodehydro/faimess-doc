import { SectionSlot } from "../sections/registry";

/**
 * The library, in the same content card the feed uses — the player stays
 * beside it (see `Shell` in app/App.tsx). Clicking a card opens its detail
 * inside this card instead of leaving the layout.
 */
export function ArtistsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-6">
      <SectionSlot id="collection" params={{ kind: "artists" }} />
    </div>
  );
}
