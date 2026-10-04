import { SectionSlot } from "../sections/registry";

export function AlbumsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 sm:px-5 lg:px-5 lg:pb-5">
      <div className="h-[720px] lg:h-auto lg:min-h-0 lg:flex-1">
        <SectionSlot id="collection" params={{ kind: "albums" }} />
      </div>
    </div>
  );
}
