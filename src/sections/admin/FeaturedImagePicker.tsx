/* ------------------------------------------------------------------ *
 *  FAIMESS Featured Image Picker
 *  Unified cover/featured photo selector for tracks, albums, artists,
 *  news stories, playlists and merchandise.
 *  Supports custom direct URL input (download host/CDN) and an interactive
 *  visual media library gallery.
 * ------------------------------------------------------------------ */

import { useState } from "react";
import { GALLERY_ITEMS, type GalleryCategory, type GalleryItem } from "../../data/galleryAssets";
import { Icon } from "../../ui/Icon";
import { cn } from "../../lib/cn";
import { usePreferences } from "../../app/PreferencesContext";

type FeaturedImagePickerProps = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  defaultCategory?: GalleryCategory;
};

export function FeaturedImagePicker({
  value,
  onChange,
  label = "Featured Image",
  hint,
  defaultCategory = "all",
}: FeaturedImagePickerProps) {
  const { lang } = usePreferences();
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState<GalleryCategory>(defaultCategory);
  const [search, setSearch] = useState("");

  const filteredItems = GALLERY_ITEMS.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (search.trim()) {
      return item.title.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const categories: { id: GalleryCategory; label: string }[] = [
    { id: "all", label: lang === "fa" ? "همه تصاویر" : "All Media" },
    { id: "albums", label: lang === "fa" ? "کاور آلبوم‌ها" : "Albums" },
    { id: "artists", label: lang === "fa" ? "هنرمندان" : "Artists" },
    { id: "playlists", label: lang === "fa" ? "پلی‌لیست‌ها" : "Playlists" },
    { id: "news", label: lang === "fa" ? "اخبار و بنر" : "News & Banners" },
    { id: "shop", label: lang === "fa" ? "محصولات" : "Merch" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[12px] font-bold text-ink-muted">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[12px] text-ink-faint transition hover:text-flame-deep"
          >
            {lang === "fa" ? "حذف تصویر" : "Clear"}
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Preview Thumbnail */}
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] border border-line bg-subtle/80 shadow-inner">
          {value ? (
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                // fallback placeholder
                (e.currentTarget as HTMLImageElement).src = "/assets/photos/albums/afterglow.webp";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-faint">
              <Icon name="disc" size={20} />
            </div>
          )}
        </div>

        {/* URL Input & Gallery Trigger */}
        <div className="flex min-w-0 flex-1 gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={lang === "fa" ? "آدرس مستقیم تصویر یا هاست دانلود..." : "https://cdn.example.com/cover.webp"}
            className="min-w-0 flex-1 rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink shadow-sm outline-none transition focus:border-primary-deep"
          />

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-[12px] border border-primary-deep/20 bg-primary-soft px-3 py-2 text-[12px] font-bold text-primary-deep shadow-sm transition hover:bg-primary-soft/80"
          >
            <Icon name="disc" size={14} />
            <span>{lang === "fa" ? "انتخاب از گالری" : "Media Gallery"}</span>
          </button>
        </div>
      </div>

      {hint && (
        <p className="text-[12px] text-ink-faint">{hint}</p>
      )}

      {/* Gallery Selector Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[85vh] w-full max-w-[700px] flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <h3 className="font-extrabold text-[15px] text-ink">
                  {lang === "fa" ? "گالری تصاویر رسمی فیمس" : "FAIMESS Media Library"}
                </h3>
                <p className="text-[12px] text-ink-muted">
                  {lang === "fa"
                    ? "یک تصویر شاخص با کیفیت بالا برای اثر خود انتخاب کنید"
                    : "Select a high-resolution artwork from the curated catalog"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full p-2 text-ink-muted transition hover:bg-subtle hover:text-ink"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            {/* Category Filter & Search Bar */}
            <div className="space-y-3 border-b border-line bg-subtle/30 px-5 py-3">
              <div className="flex items-center gap-2 overflow-x-auto scroll-rail pb-1">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1 text-[12px] font-bold transition",
                      category === c.id
                        ? "bg-primary-deep text-white shadow-sm"
                        : "bg-surface text-ink-muted hover:text-ink border border-line",
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={lang === "fa" ? "جستجو در عناوین تصاویر..." : "Search artwork by title..."}
                  className="w-full rounded-[12px] border border-line bg-surface py-2 pe-3 ps-9 text-[12px] text-ink shadow-sm outline-none focus:border-primary-deep"
                />
                <div className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-ink-faint">
                  <Icon name="search" size={14} />
                </div>
              </div>
            </div>

            {/* Thumbnails Grid */}
            <div className="flex-1 overflow-y-auto p-5 scroll-slim">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {filteredItems.map((item: GalleryItem) => {
                  const isSelected = value === item.url;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onChange(item.url);
                        setModalOpen(false);
                      }}
                      className={cn(
                        "group relative flex flex-col overflow-hidden rounded-[16px] border text-start transition",
                        isSelected
                          ? "border-primary-deep ring-2 ring-primary-deep/30 bg-primary-soft/20"
                          : "border-line bg-surface hover:border-ink-faint hover:shadow-md",
                      )}
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-subtle">
                        <img
                          src={item.url}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary-deep/40 backdrop-blur-[2px]">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-primary-deep shadow-md">
                              <Icon name="check" size={14} />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="truncate font-bold text-[12px] text-ink">
                          {item.title}
                        </p>
                        <p className="text-[12px] capitalize text-ink-faint">
                          {item.category}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-ink-muted">
                  <Icon name="disc" size={32} />
                  <p className="mt-2 text-[13px] font-bold">
                    {lang === "fa" ? "تصویری پیدا نشد" : "No media found"}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-line bg-subtle/30 px-5 py-3">
              <span className="text-[12px] text-ink-faint">
                {filteredItems.length} {lang === "fa" ? "تصویر آماده" : "available items"}
              </span>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-[12px] border border-line bg-surface px-4 py-1.5 text-[12px] font-bold text-ink shadow-sm transition hover:bg-subtle"
              >
                {lang === "fa" ? "بستن" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
