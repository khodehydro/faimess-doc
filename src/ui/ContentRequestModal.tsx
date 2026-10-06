import { useState } from "react";
import { Icon } from "./Icon";
import { usePreferences } from "../app/PreferencesContext";
import { useApp } from "../app/AppContext";
import { socialApi } from "../api/socialApi";
import type { ContentRequestType } from "../api/adminApi";
import { cn } from "../lib/cn";

export function ContentRequestModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { lang } = usePreferences();
  const { notify } = useApp();

  const [type, setType] = useState<ContentRequestType>("track");
  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artistName.trim()) return;

    setSubmitting(true);
    socialApi.submitContentRequest({
      type,
      title: title.trim(),
      artistName: artistName.trim(),
      notes: notes.trim(),
    });
    setSubmitting(false);

    notify(
      lang === "fa"
        ? "درخواست شما برای مدیران ارسال شد و پس از بررسی به سایت افزوده خواهد شد!"
        : "Request submitted to curators!",
      "primary",
    );

    setTitle("");
    setArtistName("");
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-[520px] flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h3 className="font-extrabold text-[16px] text-ink">
              {lang === "fa" ? "درخواست آهنگ، آلبوم یا لیریک جدید" : "Request Music or Content"}
            </h3>
            <p className="mt-0.5 text-[12px] text-ink-muted">
              {lang === "fa"
                ? "عنوان و نام هنرمند را ثبت کنید تا توسط مدیران استودیو بررسی و به آرشیو سایت اضافه شود."
                : "Ask our curators to add your favorite tracks, albums, or lyrics"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-faint hover:bg-subtle hover:text-ink"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-slim">
          {/* Request Type Selector */}
          <div>
            <label className="block text-[12px] font-bold text-ink-muted">
              {lang === "fa" ? "نوع محتوای درخواستی" : "Content Type"}
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => setType("track")}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition",
                  type === "track"
                    ? "border-primary-deep bg-primary-soft/50 text-primary-deep font-bold"
                    : "border-line bg-subtle/30 text-ink-muted hover:border-line hover:bg-subtle",
                )}
              >
                <Icon name="music" size={16} />
                <span className="mt-1 text-[12px]">{lang === "fa" ? "قطعه موسیقی" : "Track"}</span>
              </button>

              <button
                type="button"
                onClick={() => setType("album")}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition",
                  type === "album"
                    ? "border-primary-deep bg-primary-soft/50 text-primary-deep font-bold"
                    : "border-line bg-subtle/30 text-ink-muted hover:border-line hover:bg-subtle",
                )}
              >
                <Icon name="disc" size={16} />
                <span className="mt-1 text-[12px]">{lang === "fa" ? "آلبوم کامل" : "Album"}</span>
              </button>

              <button
                type="button"
                onClick={() => setType("lyrics")}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition",
                  type === "lyrics"
                    ? "border-primary-deep bg-primary-soft/50 text-primary-deep font-bold"
                    : "border-line bg-subtle/30 text-ink-muted hover:border-line hover:bg-subtle",
                )}
              >
                <Icon name="waveform" size={16} />
                <span className="mt-1 text-[12px]">{lang === "fa" ? "متن / ترجمه" : "Lyrics"}</span>
              </button>

              <button
                type="button"
                onClick={() => setType("artist")}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition",
                  type === "artist"
                    ? "border-primary-deep bg-primary-soft/50 text-primary-deep font-bold"
                    : "border-line bg-subtle/30 text-ink-muted hover:border-line hover:bg-subtle",
                )}
              >
                <Icon name="mic" size={16} />
                <span className="mt-1 text-[12px]">{lang === "fa" ? "هنرمند / گروه" : "Artist"}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-ink-muted">
              {lang === "fa" ? "عنوان اثر / نام اثر درخواستی" : "Title / Name"}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Supernova"
              className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-ink-muted">
              {lang === "fa" ? "نام خواننده یا گروه" : "Artist / Band Name"}
            </label>
            <input
              type="text"
              required
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="e.g. aespa / SEVENTEEN"
              className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-ink-muted">
              {lang === "fa" ? "توضیحات تکمیلی یا لینک نمونه (اختیاری)" : "Additional Notes or Links"}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={lang === "fa" ? "مثلاً سال انتشار، نام آلبوم یا در صورت وجود لینک یوتیوب/اسپاتیفای..." : "e.g. Year of release or direct reference"}
              className="mt-1 w-full rounded-xl border border-line bg-surface p-2.5 text-[12px] text-ink outline-none focus:border-primary-deep"
            />
          </div>

          <div className="rounded-xl border border-teal-deep/20 bg-teal-soft/30 p-3 text-[12px] text-teal-deep font-bold leading-relaxed">
            {lang === "fa"
              ? "★ پس از بررسی و تایید درخواست شما توسط مدیران و اضافه شدن محتوا به سایت، ۲۵ امتیاز وفاداری به حساب شما تعلق می‌گیرد."
              : "★ You will receive +25 loyalty points once curators approve and publish this content."}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-line bg-surface px-4 py-2 text-[12px] font-bold text-ink hover:bg-subtle"
            >
              {lang === "fa" ? "انصراف" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-primary-deep px-5 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-primary-deep/90 disabled:opacity-60"
            >
              {lang === "fa" ? "ارسال درخواست برای مدیران" : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
