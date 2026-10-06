import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePreferences } from "../app/PreferencesContext";
import { useApp } from "../app/AppContext";
import { useAuth } from "../app/AuthContext";
import {
  adminApi,
  getDefaultPermissions,
  type AdminAlbum,
  type AdminNews,
  type AdminOverviewStats,
  type AdminPlaylist,
  type AdminTrack,
  type AdminUser,
  type AdminUserRole,
  type SiteFeatureSettings,
  type UserPermissions,
} from "../api/adminApi";
import { Icon } from "../ui/Icon";
import { toman, type ShopCategoryId, type ShopBadge } from "../data/shop";
import { cn } from "../lib/cn";
import { FeaturedImagePicker } from "../sections/admin/FeaturedImagePicker";
import { getActiveAdminTab, ADMIN_TABS, type AdminTabId } from "../sections/admin/AdminTopNav";
import type { Artist } from "../data/library";

export function AdminPage() {
  const { t, locale, dir, lang, dataLabel } = usePreferences();
  const { navigate, notify } = useApp();
  const { isAdmin, openAccount } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTabId>(() => getActiveAdminTab());
  const [stats, setStats] = useState<AdminOverviewStats>(() => adminApi.getOverviewStats());
  const [siteSettings, setSiteSettings] = useState<SiteFeatureSettings>(() => adminApi.getSiteSettings());
  const [searchQuery, setSearchQuery] = useState("");
  const [statsPeriod, setStatsPeriod] = useState<"today" | "week" | "all">("today");

  // Track Hash Route for Admin Tabs
  useEffect(() => {
    const onHashChange = () => {
      setActiveTab(getActiveAdminTab());
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const switchTab = (tab: AdminTabId) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.location.hash = tab === "dashboard" ? "#/admin" : `#/admin/${tab}`;
    }
  };

  // Synchronize with reactive updates from adminApi
  const refreshData = useCallback(() => {
    setStats(adminApi.getOverviewStats());
    setSiteSettings(adminApi.getSiteSettings());
  }, []);

  useEffect(() => {
    return adminApi.subscribe(refreshData);
  }, [refreshData]);

  /* ---------------- Track Modal (Create & Edit with Single Track Support) ---------------- */
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [trackTitle, setTrackTitle] = useState("");
  const [trackArtist, setTrackArtist] = useState("NOVAE");
  const [trackAlbum, setTrackAlbum] = useState("Afterglow");
  const [trackIsSingle, setTrackIsSingle] = useState(false);
  const [trackDuration, setTrackDuration] = useState("3:24");
  const [trackAudio, setTrackAudio] = useState("/assets/audio/faimess-demo.mp3");
  const [trackPhoto, setTrackPhoto] = useState("/assets/photos/albums/afterglow.webp");
  const [trackPlays, setTrackPlays] = useState(120);
  const [trackLyricsOriginal, setTrackLyricsOriginal] = useState("");
  const [trackLyricsTranslation, setTrackLyricsTranslation] = useState("");

  const openCreateTrack = () => {
    setEditingTrackId(null);
    setTrackTitle("");
    setTrackArtist("NOVAE");
    setTrackAlbum("Afterglow");
    setTrackIsSingle(false);
    setTrackDuration("3:24");
    setTrackAudio("/assets/audio/faimess-demo.mp3");
    setTrackPhoto("/assets/photos/albums/afterglow.webp");
    setTrackPlays(120);
    setTrackLyricsOriginal("");
    setTrackLyricsTranslation("");
    setTrackModalOpen(true);
  };

  const openEditTrack = (tr: AdminTrack) => {
    setEditingTrackId(tr.id);
    setTrackTitle(tr.title);
    setTrackArtist(tr.artist);
    const isSingle = Boolean(tr.isSingle || tr.album === "· single");
    setTrackIsSingle(isSingle);
    setTrackAlbum(isSingle ? "· single" : tr.album);
    const m = Math.floor(tr.seconds / 60);
    const s = Math.floor(tr.seconds % 60);
    setTrackDuration(`${m}:${String(s).padStart(2, "0")}`);
    setTrackAudio(tr.audio || "/assets/audio/faimess-demo.mp3");
    setTrackPhoto(tr.photo || "/assets/photos/albums/afterglow.webp");
    setTrackPlays(tr.plays ?? 1000);

    const existingLyrics = adminApi.getTrackLyrics(tr.id);
    setTrackLyricsOriginal(existingLyrics?.original ?? "");
    setTrackLyricsTranslation(existingLyrics?.translation ?? "");
    setTrackModalOpen(true);
  };

  const handleSaveTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTitle.trim() || !trackArtist.trim()) return;

    if (editingTrackId) {
      adminApi.updateTrack(editingTrackId, {
        title: trackTitle.trim(),
        artist: trackArtist.trim(),
        album: trackIsSingle ? "· single" : trackAlbum.trim(),
        isSingle: trackIsSingle,
        duration: trackDuration.trim(),
        audio: trackAudio.trim() || "/assets/audio/faimess-demo.mp3",
        photo: trackPhoto.trim(),
        plays: trackPlays,
        lyricsOriginal: trackLyricsOriginal.trim() || undefined,
        lyricsTranslation: trackLyricsTranslation.trim() || undefined,
      });
      notify(lang === "fa" ? "مشخصات آهنگ با موفقیت به‌روزرسانی شد" : "Track updated successfully", "primary");
    } else {
      adminApi.createTrack({
        title: trackTitle.trim(),
        artist: trackArtist.trim(),
        album: trackIsSingle ? "· single" : trackAlbum.trim(),
        isSingle: trackIsSingle,
        duration: trackDuration.trim(),
        audio: trackAudio.trim() || "/assets/audio/faimess-demo.mp3",
        photo: trackPhoto.trim(),
        plays: trackPlays,
        lyricsOriginal: trackLyricsOriginal.trim() || undefined,
        lyricsTranslation: trackLyricsTranslation.trim() || undefined,
      });
      notify(lang === "fa" ? "آهنگ جدید با موفقیت منتشر شد" : "Track published successfully", "primary");
    }
    setTrackModalOpen(false);
  };

  /* ---------------- Album Modal (Create & Edit) ---------------- */
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumArtist, setAlbumArtist] = useState("NOVAE");
  const [albumYear, setAlbumYear] = useState(2026);
  const [albumPhoto, setAlbumPhoto] = useState("/assets/photos/albums/afterglow.webp");
  const [albumSelectedTrackIds, setAlbumSelectedTrackIds] = useState<string[]>([]);
  const [albumTrackSearch, setAlbumTrackSearch] = useState("");

  const openCreateAlbum = () => {
    setEditingAlbumId(null);
    setAlbumTitle("");
    setAlbumArtist("NOVAE");
    setAlbumYear(2026);
    setAlbumPhoto("/assets/photos/albums/afterglow.webp");
    setAlbumSelectedTrackIds([]);
    setAlbumTrackSearch("");
    setAlbumModalOpen(true);
  };

  const openEditAlbum = (alb: AdminAlbum) => {
    setEditingAlbumId(alb.id);
    setAlbumTitle(alb.title);
    setAlbumArtist(alb.artist);
    setAlbumYear(alb.year);
    setAlbumPhoto(alb.photo);
    setAlbumSelectedTrackIds(alb.trackIds ?? []);
    setAlbumTrackSearch("");
    setAlbumModalOpen(true);
  };

  const handleToggleTrackInAlbum = (id: string) => {
    setAlbumSelectedTrackIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSaveAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumTitle.trim() || !albumArtist.trim()) return;

    if (editingAlbumId) {
      adminApi.updateAlbum(editingAlbumId, {
        title: albumTitle.trim(),
        artist: albumArtist.trim(),
        year: albumYear,
        photo: albumPhoto,
        trackIds: albumSelectedTrackIds,
      });
      notify(lang === "fa" ? "آلبوم و فهرست آهنگ‌های آن با موفقیت ویرایش شد" : "Album & tracklist updated", "primary");
    } else {
      adminApi.createAlbum({
        title: albumTitle.trim(),
        artist: albumArtist.trim(),
        year: albumYear,
        photo: albumPhoto,
        trackIds: albumSelectedTrackIds,
      });
      notify(lang === "fa" ? "آلبوم جدید ایجاد و آهنگ‌ها متصل شدند" : "Album created & tracks linked", "primary");
    }
    setAlbumModalOpen(false);
  };

  /* ---------------- Playlist Modal (With Track Selection & Search) ---------------- */
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistCurator, setPlaylistCurator] = useState("FAIMESS Editorial");
  const [playlistMood, setPlaylistMood] = useState("Vibrant");
  const [playlistPhoto, setPlaylistPhoto] = useState("/assets/photos/playlists/golden-hour.webp");
  const [playlistSelectedTrackIds, setPlaylistSelectedTrackIds] = useState<string[]>([]);
  const [playlistTrackSearch, setPlaylistTrackSearch] = useState("");

  const openCreatePlaylist = () => {
    setEditingPlaylistId(null);
    setPlaylistName("");
    setPlaylistCurator("FAIMESS Editorial");
    setPlaylistMood("Vibrant");
    setPlaylistPhoto("/assets/photos/playlists/golden-hour.webp");
    setPlaylistSelectedTrackIds([]);
    setPlaylistTrackSearch("");
    setPlaylistModalOpen(true);
  };

  const openEditPlaylist = (pl: AdminPlaylist) => {
    setEditingPlaylistId(pl.id);
    setPlaylistName(pl.name);
    setPlaylistCurator(pl.curator);
    setPlaylistMood(pl.mood);
    setPlaylistPhoto(pl.photo);
    setPlaylistSelectedTrackIds(pl.trackIds ?? []);
    setPlaylistTrackSearch("");
    setPlaylistModalOpen(true);
  };

  const handleToggleTrackInPlaylist = (id: string) => {
    setPlaylistSelectedTrackIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSavePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim()) return;

    if (editingPlaylistId) {
      adminApi.updatePlaylist(editingPlaylistId, {
        name: playlistName.trim(),
        curator: playlistCurator.trim(),
        mood: playlistMood.trim(),
        photo: playlistPhoto,
        trackIds: playlistSelectedTrackIds,
      });
      notify(lang === "fa" ? "پلی‌لیست و آهنگ‌های آن ویرایش شد" : "Playlist updated", "primary");
    } else {
      adminApi.createPlaylist({
        name: playlistName.trim(),
        curator: playlistCurator.trim(),
        mood: playlistMood.trim(),
        photo: playlistPhoto,
        trackIds: playlistSelectedTrackIds,
      });
      notify(lang === "fa" ? "پلی‌لیست با آهنگ‌های انتخابی ساخته شد" : "Playlist created with tracks", "primary");
    }
    setPlaylistModalOpen(false);
  };

  /* ---------------- Artist Modal (Create & Edit) ---------------- */
  const [artistModalOpen, setArtistModalOpen] = useState(false);
  const [editingArtistId, setEditingArtistId] = useState<string | null>(null);
  const [artistName, setArtistName] = useState("");
  const [artistKind, setArtistKind] = useState<Artist["kind"]>("Boy group");
  const [artistGenre, setArtistGenre] = useState("Electro pop");
  const [artistPhoto, setArtistPhoto] = useState("/assets/photos/artists/novae.webp");
  const [artistVerified, setArtistVerified] = useState(false);
  const [artistNewRelease, setArtistNewRelease] = useState(false);

  const openCreateArtist = () => {
    setEditingArtistId(null);
    setArtistName("");
    setArtistKind("Boy group");
    setArtistGenre("Electro pop");
    setArtistPhoto("/assets/photos/artists/novae.webp");
    setArtistVerified(false);
    setArtistNewRelease(false);
    setArtistModalOpen(true);
  };

  const openEditArtist = (art: Artist) => {
    setEditingArtistId(art.id);
    setArtistName(art.name);
    setArtistKind(art.kind);
    setArtistGenre(art.genre);
    setArtistPhoto(art.photo);
    setArtistVerified(Boolean(art.verified));
    setArtistNewRelease(Boolean(art.newRelease));
    setArtistModalOpen(true);
  };

  const handleSaveArtist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistName.trim()) return;

    if (editingArtistId) {
      adminApi.updateArtist(editingArtistId, {
        name: artistName.trim(),
        kind: artistKind,
        genre: artistGenre.trim(),
        photo: artistPhoto,
        verified: artistVerified,
        newRelease: artistNewRelease,
      });
      notify(lang === "fa" ? "مشخصات هنرمند به‌روزرسانی شد" : "Artist profile updated", "primary");
    } else {
      adminApi.createArtist({
        name: artistName.trim(),
        kind: artistKind,
        genre: artistGenre.trim(),
        photo: artistPhoto,
        verified: artistVerified,
        newRelease: artistNewRelease,
      });
      notify(lang === "fa" ? "هنرمند جدید اضافه شد" : "Artist added successfully", "primary");
    }
    setArtistModalOpen(false);
  };

  /* ---------------- News Modal (Create, Edit & Status Workflow) ---------------- */
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsAuthor, setNewsAuthor] = useState("FAIMESS Editorial");
  const [newsTag, setNewsTag] = useState("Tour");
  const [newsExcerpt, setNewsExcerpt] = useState("");
  const [newsBody, setNewsBody] = useState("");
  const [newsPhoto, setNewsPhoto] = useState("/assets/photos/banners/asia-leg.webp");
  const [newsStatus, setNewsStatus] = useState<"published" | "pending_review">("published");
  const [newsFilterStatus, setNewsFilterStatus] = useState<"all" | "published" | "pending_review">("all");

  const openCreateNews = () => {
    setEditingNewsId(null);
    setNewsTitle("");
    setNewsAuthor("FAIMESS Editorial");
    setNewsTag("Tour");
    setNewsExcerpt("");
    setNewsBody("");
    setNewsPhoto("/assets/photos/banners/asia-leg.webp");
    setNewsStatus("published");
    setNewsModalOpen(true);
  };

  const openEditNews = (n: AdminNews) => {
    setEditingNewsId(n.id);
    setNewsTitle(n.title);
    setNewsAuthor(n.author?.name || "FAIMESS Editorial");
    setNewsTag(n.tag);
    setNewsExcerpt(n.excerpt);
    setNewsBody(n.bodyKeys?.[0] || n.excerpt);
    setNewsPhoto(n.photo);
    setNewsStatus(n.status || "published");
    setNewsModalOpen(true);
  };

  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsExcerpt.trim()) return;

    if (editingNewsId) {
      adminApi.updateNews(editingNewsId, {
        title: newsTitle.trim(),
        author: {
          name: newsAuthor.trim(),
          role: "Staff Columnist",
          avatar: "/assets/photos/account/me.webp",
          seed: 1,
        },
        tag: newsTag as any,
        excerpt: newsExcerpt.trim(),
        bodyKeys: [newsBody.trim() || newsExcerpt.trim()],
        photo: newsPhoto,
        status: newsStatus,
      });
      notify(lang === "fa" ? "مقاله خبری به‌روزرسانی شد" : "Article updated", "primary");
    } else {
      adminApi.createNews({
        title: newsTitle.trim(),
        authorName: newsAuthor.trim(),
        tag: newsTag as any,
        excerpt: newsExcerpt.trim(),
        body: newsBody.trim(),
        photo: newsPhoto,
        status: newsStatus,
      });
      notify(
        newsStatus === "published"
          ? (lang === "fa" ? "مقاله خبری با موفقیت منتشر شد" : "Article published")
          : (lang === "fa" ? "پیش‌نویس خبر جهت بررسی و تایید مدیر ثبت شد" : "Draft submitted for manager approval"),
        "primary",
      );
    }
    setNewsModalOpen(false);
  };

  /* ---------------- Product Modal (Create & Edit) ---------------- */
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState<Exclude<ShopCategoryId, "all">>("apparel");
  const [prodPrice, setProdPrice] = useState(1500000);
  const [prodWasPrice, setProdWasPrice] = useState<number | undefined>(undefined);
  const [prodBadge, setProdBadge] = useState<ShopBadge | undefined>(undefined);
  const [prodPhoto, setProdPhoto] = useState("/assets/photos/shop/hoodie.webp");

  const openCreateProduct = () => {
    setEditingProductId(null);
    setProdName("");
    setProdCategory("apparel");
    setProdPrice(1500000);
    setProdWasPrice(undefined);
    setProdBadge(undefined);
    setProdPhoto("/assets/photos/shop/hoodie.webp");
    setProductModalOpen(true);
  };

  const openEditProduct = (p: any) => {
    setEditingProductId(p.id);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdPrice(p.price);
    setProdWasPrice(p.wasPrice);
    setProdBadge(p.badge);
    setProdPhoto(p.photo);
    setProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    if (editingProductId) {
      adminApi.updateProduct(editingProductId, {
        name: prodName.trim(),
        category: prodCategory,
        price: prodPrice,
        wasPrice: prodWasPrice,
        badge: prodBadge,
        photo: prodPhoto,
      });
      notify(lang === "fa" ? "محصول به‌روزرسانی شد" : "Product updated", "primary");
    } else {
      adminApi.createProduct({
        name: prodName.trim(),
        category: prodCategory,
        price: prodPrice,
        wasPrice: prodWasPrice,
        badge: prodBadge,
        photo: prodPhoto,
      });
      notify(lang === "fa" ? "محصول جدید اضافه شد" : "Product created", "primary");
    }
    setProductModalOpen(false);
  };

  /* ---------------- User Modal (Roles & Multi-Permissions RBAC) ---------------- */
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUsername, setEditingUsername] = useState<string | null>(null);
  const [userUsername, setUserUsername] = useState("");
  const [userDisplayName, setUserDisplayName] = useState("");
  const [userRole, setUserRole] = useState<AdminUserRole>("user");
  const [userPerms, setUserPerms] = useState<UserPermissions>(() => getDefaultPermissions("user"));
  const [userPoints, setUserPoints] = useState(100);
  const [userAvatar, setUserAvatar] = useState("/assets/photos/account/me.webp");

  const openCreateUser = () => {
    setEditingUsername(null);
    setUserUsername("");
    setUserDisplayName("");
    setUserRole("user");
    setUserPerms(getDefaultPermissions("user"));
    setUserPoints(100);
    setUserAvatar("/assets/photos/account/me.webp");
    setUserModalOpen(true);
  };

  const openEditUser = (u: AdminUser) => {
    setEditingUsername(u.username);
    setUserUsername(u.username);
    setUserDisplayName(u.displayName);
    setUserRole(u.role);
    setUserPerms(u.permissions || getDefaultPermissions(u.role));
    setUserPoints(u.points);
    setUserAvatar(u.avatar);
    setUserModalOpen(true);
  };

  const handleRoleChange = (role: AdminUserRole) => {
    setUserRole(role);
    setUserPerms(getDefaultPermissions(role));
  };

  const handleTogglePermission = (permKey: keyof UserPermissions) => {
    setUserPerms((prev) => ({
      ...prev,
      [permKey]: !prev[permKey],
    }));
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userUsername.trim() || !userDisplayName.trim()) return;

    if (editingUsername) {
      adminApi.updateUser(editingUsername, {
        displayName: userDisplayName.trim(),
        role: userRole,
        permissions: userPerms,
        points: userPoints,
        avatar: userAvatar,
      });
      notify(lang === "fa" ? "نقش و دسترسی‌های کاربر ذخیره شد" : "User & permissions updated", "primary");
    } else {
      adminApi.createUser({
        username: userUsername.trim(),
        displayName: userDisplayName.trim(),
        role: userRole,
        permissions: userPerms,
        points: userPoints,
        avatar: userAvatar,
      });
      notify(lang === "fa" ? "کاربر با دسترسی‌های تعیین‌شده ایجاد شد" : "Staff/User created", "primary");
    }
    setUserModalOpen(false);
  };

  /* ---------------- Backup & Restore State ---------------- */
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [backupJsonText, setBackupJsonText] = useState("");

  const handleOpenBackupModal = () => {
    setBackupJsonText(adminApi.exportDatabaseJson());
    setBackupModalOpen(true);
  };

  const handleApplyImport = () => {
    if (!backupJsonText.trim()) return;
    const ok = adminApi.importDatabaseJson(backupJsonText.trim());
    if (ok) {
      notify(lang === "fa" ? "دیتابیس با موفقیت بازیابی شد" : "Database restored from JSON", "primary");
      setBackupModalOpen(false);
    } else {
      notify(lang === "fa" ? "خطا در قالب فایل پشتیبان JSON" : "Invalid backup JSON format", "primary");
    }
  };

  // Auth gate check
  if (!isAdmin) {
    return (
      <div className="flex min-h-[460px] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary-deep shadow-sm">
          <Icon name="lock" size={28} />
        </div>
        <h2 className="mt-4 font-black text-[20px] text-ink">
          {t("admin.restricted")}
        </h2>
        <p className="mt-1.5 max-w-[420px] text-[13px] text-ink-muted leading-relaxed">
          {t("admin.restrictedDesc")}
        </p>
        <button
          type="button"
          onClick={() => openAccount()}
          className="mt-6 flex items-center gap-2 rounded-full bg-primary-deep px-6 py-2.5 font-bold text-[13px] text-white shadow-frame transition hover:bg-primary-deep/90"
        >
          <Icon name="lock" size={16} />
          <span>{lang === "fa" ? "ورود با حساب مدیر" : "Sign in as Admin"}</span>
        </button>
      </div>
    );
  }

  const existingAlbums = adminApi.getAlbums();
  const existingArtists = adminApi.getArtists();

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4 lg:p-6 space-y-6">
      {/* Executive Header & Quick Controls */}
      <div className="flex flex-col gap-4 rounded-[22px] border border-line bg-surface/80 p-4 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 items-center rounded-full bg-primary-deep px-2.5 font-black text-[12px] uppercase tracking-wider text-white">
              FAIMESS Core
            </span>
            <span className="font-bold text-[12px] text-teal-deep">● Live Persistence</span>
            <span className="font-mono text-[12px] text-ink-faint">v4.0.0</span>
          </div>
          <h1 className="mt-1 font-black text-[22px] tracking-tight text-ink sm:text-[26px]">
            {lang === "fa" ? "مرکز مدیریت کل استودیو فیمس" : "FAIMESS Studio Control Center"}
          </h1>
          <p className="text-[12px] text-ink-muted">
            {lang === "fa"
              ? "مدیریت جامع کاتالوگ دیسکوگرافی، آرتیست‌ها، پخش صوت، تحریریه و نظارت جامعه"
              : "Enterprise management for catalog, artists, audio streaming, editorial and moderation"}
          </p>
        </div>

        {/* Global Admin Tools: Backup, Reset */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOpenBackupModal}
            className="flex items-center gap-1.5 rounded-[12px] border border-line bg-surface px-3 py-1.5 text-[12px] font-bold text-ink shadow-sm transition hover:bg-subtle"
            title="Database JSON Backup & Restore"
          >
            <Icon name="folder" size={14} />
            <span>{lang === "fa" ? "پشتیبان‌گیری / بازیابی دیتابیس" : "Backup / Restore"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm(lang === "fa" ? "آیا از بازنشانی داده‌ها به حالت اولیه اطمینان دارید؟" : "Reset database to initial demo state?")) {
                adminApi.resetDatabase();
                notify(lang === "fa" ? "پایگاه داده بازنشانی شد" : "Database reset to defaults", "primary");
              }
            }}
            className="flex items-center gap-1.5 rounded-[12px] border border-flame-deep/20 bg-flame-soft px-3 py-1.5 text-[12px] font-bold text-flame-deep shadow-sm transition hover:bg-flame-soft/80"
          >
            <Icon name="close" size={14} />
            <span>{lang === "fa" ? "بازنشانی دمو" : "Reset Demo"}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Switcher Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-[16px] border border-line bg-surface p-1.5 shadow-sm scroll-rail">
        {ADMIN_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => switchTab(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-[12px] px-3 py-2 text-[12px] font-extrabold transition",
                isActive
                  ? "bg-primary-deep text-white shadow-sm"
                  : "text-ink-muted hover:bg-subtle hover:text-ink",
              )}
            >
              <Icon name={tab.icon} size={15} />
              <span>{lang === "fa" ? tab.labelFa : tab.labelEn}</span>
              {tab.id === "comments" && stats.reportedComments > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-flame-deep text-[12px] text-white">
                  {stats.reportedComments}
                </span>
              )}
              {tab.id === "lyrics" && stats.pendingLyrics > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-deep text-[12px] text-white">
                  {stats.pendingLyrics}
                </span>
              )}
              {tab.id === "news" && stats.pendingNews > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-soft text-[12px] text-ink font-black">
                  {stats.pendingNews}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ===================== TAB 1: DASHBOARD & MASTER ANALYTICS ===================== */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Time Filter Chips */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-[16px] text-ink">
                {lang === "fa" ? "داشبورد تحلیلی و شاخص‌های کلیدی پلتفرم" : "Platform Executive KPI Suite"}
              </h3>
              <p className="text-[12px] text-ink-muted">
                {lang === "fa" ? "آمار زنده ترافیک، استریم، درآمد، کامنت‌ها و کاربران فعال" : "Live real-time metrics"}
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setStatsPeriod("today")}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] font-bold transition",
                  statsPeriod === "today" ? "bg-primary-deep text-white" : "text-ink-muted hover:text-ink",
                )}
              >
                {lang === "fa" ? "امروز" : "Today"}
              </button>
              <button
                type="button"
                onClick={() => setStatsPeriod("week")}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] font-bold transition",
                  statsPeriod === "week" ? "bg-primary-deep text-white" : "text-ink-muted hover:text-ink",
                )}
              >
                {lang === "fa" ? "این هفته" : "This Week"}
              </button>
              <button
                type="button"
                onClick={() => setStatsPeriod("all")}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] font-bold transition",
                  statsPeriod === "all" ? "bg-primary-deep text-white" : "text-ink-muted hover:text-ink",
                )}
              >
                {lang === "fa" ? "کل دوران" : "All Time"}
              </button>
            </div>
          </div>

          {/* Master KPI Cards Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-[18px] border border-line bg-surface p-3.5 shadow-sm">
              <span className="text-[12px] text-teal-deep font-bold">● {lang === "fa" ? "کاربران آنلاین" : "Online Now"}</span>
              <p className="mt-1 font-black text-[22px] text-ink">{stats.onlineUsers}</p>
            </div>

            <div className="rounded-[18px] border border-line bg-surface p-3.5 shadow-sm">
              <span className="text-[12px] text-ink-muted">
                {statsPeriod === "today" ? (lang === "fa" ? "بازدید امروز" : "Views Today") : (lang === "fa" ? "کل بازدیدها" : "Total Views")}
              </span>
              <p className="mt-1 font-black text-[22px] text-primary-deep">
                {(statsPeriod === "today" ? stats.pageViewsToday : stats.pageViewsTotal).toLocaleString(locale)}
              </p>
            </div>

            <div className="rounded-[18px] border border-line bg-surface p-3.5 shadow-sm">
              <span className="text-[12px] text-ink-muted">
                {statsPeriod === "today" ? (lang === "fa" ? "دیدگاه‌های امروز" : "Comments Today") : (lang === "fa" ? "کل دیدگاه‌ها" : "Total Comments")}
              </span>
              <p className="mt-1 font-black text-[22px] text-ink">
                {statsPeriod === "today" ? stats.commentsToday : stats.totalComments}
              </p>
            </div>

            <div className="rounded-[18px] border border-line bg-surface p-3.5 shadow-sm">
              <span className="text-[12px] text-ink-muted">{t("admin.statsTracks")}</span>
              <p className="mt-1 font-black text-[22px] text-ink">{stats.totalTracks}</p>
            </div>

            <div className="rounded-[18px] border border-line bg-surface p-3.5 shadow-sm">
              <span className="text-[12px] text-ink-muted">{t("admin.statsStreams")}</span>
              <p className="mt-1 font-black text-[22px] text-ink">
                {(statsPeriod === "today" ? stats.streamsToday : stats.totalStreams).toLocaleString(locale)}
              </p>
            </div>

            <div className="rounded-[18px] border border-line bg-surface p-3.5 shadow-sm">
              <span className="text-[12px] text-ink-muted">{t("admin.statsRevenue")}</span>
              <p className="mt-1 font-black text-[18px] text-teal-deep">
                {toman(stats.estimatedRevenueToman, locale)}
              </p>
            </div>
          </div>

          {/* Quick Actions & Recent Activity Audit Log */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-[22px] border border-line bg-surface p-5 shadow-sm">
              <h3 className="font-extrabold text-[15px] text-ink">
                {lang === "fa" ? "دسترسی سریع و ایجاد محتوا" : "Quick Action Shortcuts"}
              </h3>
              <p className="mt-1 text-[12px] text-ink-muted">
                {lang === "fa" ? "ایجاد فوری آهنگ، آلبوم، پلی‌لیست، خبر، محصول یا پرسنل" : "Fast creation modals"}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={openCreateTrack}
                  className="flex flex-col items-center justify-center rounded-[16px] border border-line bg-subtle/50 p-3 text-center transition hover:border-primary-deep hover:bg-surface"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
                    <Icon name="plus" size={16} />
                  </div>
                  <span className="mt-2 font-bold text-[12px] text-ink">
                    {lang === "fa" ? "+ افزودن آهنگ" : "+ Add Song"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={openCreateAlbum}
                  className="flex flex-col items-center justify-center rounded-[16px] border border-line bg-subtle/50 p-3 text-center transition hover:border-primary-deep hover:bg-surface"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-mint-soft text-teal-deep">
                    <Icon name="disc" size={16} />
                  </div>
                  <span className="mt-2 font-bold text-[12px] text-ink">
                    {lang === "fa" ? "+ ساخت آلبوم" : "+ Create Album"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={openCreatePlaylist}
                  className="flex flex-col items-center justify-center rounded-[16px] border border-line bg-subtle/50 p-3 text-center transition hover:border-primary-deep hover:bg-surface"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-soft text-purple-deep">
                    <Icon name="list" size={16} />
                  </div>
                  <span className="mt-2 font-bold text-[12px] text-ink">
                    {lang === "fa" ? "+ ساخت پلی‌لیست" : "+ Create Playlist"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={openCreateArtist}
                  className="flex flex-col items-center justify-center rounded-[16px] border border-line bg-subtle/50 p-3 text-center transition hover:border-primary-deep hover:bg-surface"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-soft text-ink">
                    <Icon name="mic" size={16} />
                  </div>
                  <span className="mt-2 font-bold text-[12px] text-ink">
                    {lang === "fa" ? "+ هنرمند جدید" : "+ New Artist"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={openCreateNews}
                  className="flex flex-col items-center justify-center rounded-[16px] border border-line bg-subtle/50 p-3 text-center transition hover:border-primary-deep hover:bg-surface"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-mint-soft text-teal-deep">
                    <Icon name="news" size={16} />
                  </div>
                  <span className="mt-2 font-bold text-[12px] text-ink">
                    {lang === "fa" ? "+ انتشار خبر" : "+ Publish News"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={openCreateUser}
                  className="flex flex-col items-center justify-center rounded-[16px] border border-line bg-subtle/50 p-3 text-center transition hover:border-primary-deep hover:bg-surface"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-subtle text-ink">
                    <Icon name="users" size={16} />
                  </div>
                  <span className="mt-2 font-bold text-[12px] text-ink">
                    {lang === "fa" ? "+ کاربر / پرسنل" : "+ Add Staff"}
                  </span>
                </button>
              </div>
            </div>

            {/* Audit Log / Activity */}
            <div className="rounded-[22px] border border-line bg-surface p-5 shadow-sm">
              <h3 className="font-extrabold text-[15px] text-ink">{t("admin.recentActivity")}</h3>
              <p className="mt-1 text-[12px] text-ink-muted">
                {lang === "fa" ? "ثبت لاگ زنده از فعالیت‌های مدیران و ناظران در سیستم" : "Live audit trail"}
              </p>

              <div className="mt-4 max-h-64 space-y-2.5 overflow-y-auto pe-1 scroll-slim">
                {adminApi.getRecentActivities().map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 rounded-[14px] border border-line/60 bg-subtle/40 p-2.5"
                  >
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
                      <Icon name="check" size={12} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[12px] text-ink">{act.action}</span>
                        <span className="text-[12px] text-ink-faint">{act.timestamp}</span>
                      </div>
                      <p className="mt-0.5 truncate text-[12px] text-ink-muted">{act.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: TRACKS MANAGEMENT ===================== */}
      {activeTab === "tracks" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative min-w-0 max-w-sm flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === "fa" ? "جستجو در آهنگ‌ها، خواننده‌ها یا آلبوم‌ها..." : "Search tracks..."}
                  className="w-full rounded-[14px] border border-line bg-surface py-2 pe-3 ps-9 text-[12px] text-ink shadow-sm outline-none focus:border-primary-deep"
                />
                <div className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-ink-faint">
                  <Icon name="search" size={14} />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreateTrack}
              className="flex shrink-0 items-center gap-2 rounded-[14px] bg-primary-deep px-4 py-2 font-bold text-[12px] text-white shadow-sm transition hover:bg-primary-deep/90"
            >
              <Icon name="plus" size={15} />
              <span>{t("admin.addTrack")}</span>
            </button>
          </div>

          {/* Tracks Table */}
          <div className="overflow-x-auto rounded-[20px] border border-line bg-surface shadow-sm scroll-rail">
            <table className="w-full min-w-[700px] text-start text-[13px]">
              <thead className="border-b border-line bg-subtle/40 text-ink-muted">
                <tr>
                  <th className="py-3 ps-4 text-start font-bold">{lang === "fa" ? "کاور" : "Art"}</th>
                  <th className="py-3 text-start font-bold">{t("admin.colTitle")}</th>
                  <th className="py-3 text-start font-bold">{t("admin.colArtist")}</th>
                  <th className="py-3 text-start font-bold">{t("admin.colAlbum")}</th>
                  <th className="py-3 text-start font-bold">{lang === "fa" ? "لینک پخش" : "Stream URL"}</th>
                  <th className="py-3 text-start font-bold">{t("admin.colDuration")}</th>
                  <th className="py-3 text-start font-bold">{t("admin.colPlays")}</th>
                  <th className="py-3 pe-4 text-end font-bold">{t("admin.colActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {adminApi.getTracks(searchQuery).map((tr) => (
                  <tr key={tr.id} className="transition-colors hover:bg-subtle/50">
                    <td className="py-2.5 ps-4">
                      <img
                        src={tr.photo || "/assets/photos/albums/afterglow.webp"}
                        alt={tr.title}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    </td>
                    <td className="py-2.5 font-bold text-ink">{tr.title}</td>
                    <td className="py-2.5 text-ink-muted">{tr.artist}</td>
                    <td className="py-2.5">
                      {tr.isSingle || tr.album === "· single" ? (
                        <span className="rounded-full bg-purple-soft px-2.5 py-0.5 text-[12px] font-bold text-purple-deep">
                          {lang === "fa" ? "تک‌آهنگ (Single)" : "Single"}
                        </span>
                      ) : (
                        <span className="text-ink-muted">{tr.album}</span>
                      )}
                    </td>
                    <td className="py-2.5 text-[12px] font-mono text-ink-faint truncate max-w-[140px]" title={tr.audio}>
                      {tr.audio}
                    </td>
                    <td className="py-2.5 font-mono text-[12px] text-ink-faint">
                      {Math.floor(tr.seconds / 60)}:{String(Math.floor(tr.seconds % 60)).padStart(2, "0")}
                    </td>
                    <td className="py-2.5 text-ink-muted">{(tr.plays ?? 1000).toLocaleString(locale)}</td>
                    <td className="py-2.5 pe-4 text-end">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditTrack(tr)}
                          className="rounded-lg p-1.5 text-ink-faint transition hover:bg-primary-soft hover:text-primary-deep"
                          title="Edit Track"
                        >
                          <Icon name="edit" size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(lang === "fa" ? `آیا از حذف آهنگ "${tr.title}" اطمینان دارید؟` : `Delete track "${tr.title}"?`)) {
                              adminApi.deleteTrack(tr.id);
                              notify(t("admin.deletedToast"), "primary");
                            }
                          }}
                          className="rounded-lg p-1.5 text-ink-faint transition hover:bg-flame-soft hover:text-flame-deep"
                          title="Delete"
                        >
                          <Icon name="close" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: ALBUMS MANAGEMENT ===================== */}
      {activeTab === "albums" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative min-w-0 max-w-sm flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "fa" ? "جستجو در آلبوم‌ها..." : "Search albums..."}
                className="w-full rounded-[14px] border border-line bg-surface py-2 pe-3 ps-9 text-[12px] text-ink shadow-sm outline-none focus:border-primary-deep"
              />
              <div className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-ink-faint">
                <Icon name="search" size={14} />
              </div>
            </div>

            <button
              type="button"
              onClick={openCreateAlbum}
              className="flex shrink-0 items-center gap-2 rounded-[14px] bg-primary-deep px-4 py-2 font-bold text-[12px] text-white shadow-sm transition hover:bg-primary-deep/90"
            >
              <Icon name="plus" size={15} />
              <span>{lang === "fa" ? "+ ایجاد آلبوم جدید" : "+ Create Album"}</span>
            </button>
          </div>

          {/* Albums Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {adminApi.getAlbums(searchQuery).map((alb) => (
              <div
                key={alb.id}
                className="flex gap-3.5 rounded-[20px] border border-line bg-surface p-3.5 shadow-sm transition hover:shadow-md"
              >
                <img
                  src={alb.photo}
                  alt={alb.title}
                  className="h-24 w-24 shrink-0 rounded-[14px] object-cover"
                />
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-[14px] text-ink truncate">{alb.title}</h4>
                    <p className="text-[12px] text-ink-muted">{alb.artist}</p>
                    <p className="text-[12px] text-ink-faint mt-1">
                      {alb.year} · {alb.tracks ?? alb.trackIds?.length ?? 0} {lang === "fa" ? "ترک" : "tracks"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => openEditAlbum(alb)}
                      className="flex items-center gap-1 rounded-lg border border-line bg-subtle px-2.5 py-1 text-[12px] font-bold text-ink transition hover:bg-primary-soft hover:text-primary-deep"
                    >
                      <Icon name="edit" size={13} />
                      <span>{lang === "fa" ? "ویرایش و لیست آهنگ‌ها" : "Edit & Tracks"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(lang === "fa" ? `آیا از حذف آلبوم "${alb.title}" مطمئن هستید؟` : `Delete album "${alb.title}"?`)) {
                          adminApi.deleteAlbum(alb.id);
                          notify(lang === "fa" ? "آلبوم با موفقیت حذف شد" : "Album deleted", "primary");
                        }
                      }}
                      className="rounded-lg p-1 text-ink-faint hover:text-flame-deep"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 4: ARTISTS MANAGEMENT ===================== */}
      {activeTab === "artists" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative min-w-0 max-w-sm flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "fa" ? "جستجو در هنرمندان..." : "Search artists..."}
                className="w-full rounded-[14px] border border-line bg-surface py-2 pe-3 ps-9 text-[12px] text-ink shadow-sm outline-none focus:border-primary-deep"
              />
              <div className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-ink-faint">
                <Icon name="search" size={14} />
              </div>
            </div>

            <button
              type="button"
              onClick={openCreateArtist}
              className="flex shrink-0 items-center gap-2 rounded-[14px] bg-primary-deep px-4 py-2 font-bold text-[12px] text-white shadow-sm transition hover:bg-primary-deep/90"
            >
              <Icon name="plus" size={15} />
              <span>{t("admin.addArtist")}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {adminApi.getArtists(searchQuery).map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-[18px] border border-line bg-surface p-3.5 shadow-sm transition hover:shadow-md"
              >
                <img src={a.photo} alt={a.name} className="h-12 w-12 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="truncate font-extrabold text-[13.5px] text-ink">{a.name}</h4>
                    {a.verified && <Icon name="verified" size={14} className="text-primary-deep shrink-0" />}
                  </div>
                  <p className="text-[12px] text-ink-muted">{a.genre} · {a.kind}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditArtist(a)}
                    className="rounded-lg p-1.5 text-ink-faint hover:text-primary-deep"
                    title="Edit Artist"
                  >
                    <Icon name="edit" size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(lang === "fa" ? `آیا از حذف هنرمند "${a.name}" مطمئن هستید؟` : `Delete artist "${a.name}"?`)) {
                        adminApi.deleteArtist(a.id);
                        notify(t("admin.deletedToast"), "primary");
                      }
                    }}
                    className="rounded-lg p-1.5 text-ink-faint hover:text-flame-deep"
                    title="Delete"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 5: PLAYLISTS MANAGEMENT ===================== */}
      {activeTab === "playlists" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative min-w-0 max-w-sm flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "fa" ? "جستجو در پلی‌لیست‌ها..." : "Search playlists..."}
                className="w-full rounded-[14px] border border-line bg-surface py-2 pe-3 ps-9 text-[12px] text-ink shadow-sm outline-none focus:border-primary-deep"
              />
              <div className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-ink-faint">
                <Icon name="search" size={14} />
              </div>
            </div>

            <button
              type="button"
              onClick={openCreatePlaylist}
              className="flex shrink-0 items-center gap-2 rounded-[14px] bg-primary-deep px-4 py-2 font-bold text-[12px] text-white shadow-sm transition hover:bg-primary-deep/90"
            >
              <Icon name="plus" size={15} />
              <span>{lang === "fa" ? "+ ساخت پلی‌لیست جدید" : "+ Create Playlist"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {adminApi.getPlaylists(searchQuery).map((pl) => (
              <div
                key={pl.id}
                className="flex items-center gap-3.5 rounded-[20px] border border-line bg-surface p-3.5 shadow-sm"
              >
                <img src={pl.photo} alt={pl.name} className="h-16 w-16 rounded-[14px] object-cover" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-[14px] text-ink truncate">{pl.name}</h4>
                  <p className="text-[12px] text-ink-muted">{pl.curator}</p>
                  <p className="text-[12px] text-ink-faint mt-0.5">{pl.mood} · {pl.tracks} {lang === "fa" ? "ترک" : "tracks"}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditPlaylist(pl)}
                    className="rounded-lg p-1.5 text-ink-faint hover:text-primary-deep"
                  >
                    <Icon name="edit" size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(lang === "fa" ? `حذف پلی‌لیست "${pl.name}"؟` : `Delete playlist "${pl.name}"?`)) {
                        adminApi.deletePlaylist(pl.id);
                        notify(lang === "fa" ? "پلی‌لیست حذف شد" : "Playlist deleted", "primary");
                      }
                    }}
                    className="rounded-lg p-1.5 text-ink-faint hover:text-flame-deep"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 6: NEWS & EDITORIAL (WORKFLOW) ===================== */}
      {activeTab === "news" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative min-w-0 max-w-sm flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === "fa" ? "جستجو در اخبار..." : "Search news..."}
                  className="w-full rounded-[14px] border border-line bg-surface py-2 pe-3 ps-9 text-[12px] text-ink shadow-sm outline-none focus:border-primary-deep"
                />
                <div className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-ink-faint">
                  <Icon name="search" size={14} />
                </div>
              </div>

              {/* Status filter: All, Published, Pending Review */}
              <select
                value={newsFilterStatus}
                onChange={(e) => setNewsFilterStatus(e.target.value as any)}
                className="rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none"
              >
                <option value="all">{lang === "fa" ? "همه اخبار" : "All Stories"}</option>
                <option value="published">{lang === "fa" ? "منتشر شده" : "Published"}</option>
                <option value="pending_review">{lang === "fa" ? "در انتظار تایید مدیر" : "Pending Approval"}</option>
              </select>
            </div>

            <button
              type="button"
              onClick={openCreateNews}
              className="flex shrink-0 items-center gap-2 rounded-[14px] bg-primary-deep px-4 py-2 font-bold text-[12px] text-white shadow-sm transition hover:bg-primary-deep/90"
            >
              <Icon name="plus" size={15} />
              <span>{t("admin.publishNews")}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {adminApi.getNews(searchQuery, newsFilterStatus).map((item) => (
              <div
                key={item.id}
                className="flex flex-col overflow-hidden rounded-[20px] border border-line bg-surface shadow-sm"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-subtle">
                  <img src={item.photo} alt={item.title} className="h-full w-full object-cover" />
                  <span className="absolute start-3 top-3 rounded-full bg-surface/90 px-2.5 py-0.5 text-[12px] font-black text-ink shadow-sm">
                    {dataLabel(item.tag)}
                  </span>
                  {item.status === "pending_review" && (
                    <span className="absolute end-3 top-3 rounded-full bg-amber-soft px-2.5 py-0.5 text-[12px] font-black text-ink shadow-sm">
                      {lang === "fa" ? "در انتظار تایید" : "Pending Review"}
                    </span>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-[14px] text-ink line-clamp-1">{item.title}</h4>
                    <p className="mt-1 text-[12px] text-ink-muted line-clamp-2">{item.excerpt}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
                    <span className="text-[12px] text-ink-faint">{item.author?.name || "Editorial"}</span>
                    <div className="flex items-center gap-1.5">
                      {item.status === "pending_review" && (
                        <button
                          type="button"
                          onClick={() => {
                            adminApi.approveNews(item.id);
                            notify(lang === "fa" ? "خبر توسط مدیر تایید و منتشر شد" : "Approved & Published", "primary");
                          }}
                          className="rounded-lg bg-teal-deep px-2.5 py-1 text-[12px] font-bold text-white hover:bg-teal-deep/90"
                        >
                          {lang === "fa" ? "تایید و انتشار" : "Approve"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEditNews(item)}
                        className="rounded-lg p-1.5 text-ink-faint hover:text-primary-deep"
                      >
                        <Icon name="edit" size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(lang === "fa" ? `حذف مقاله "${item.title}"؟` : `Delete article "${item.title}"?`)) {
                            adminApi.deleteNews(item.id);
                            notify(t("admin.deletedToast"), "primary");
                          }
                        }}
                        className="rounded-lg p-1.5 text-ink-faint hover:text-flame-deep"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 7: REPORTED COMMENTS MODERATION ===================== */}
      {activeTab === "comments" && (
        <div className="space-y-4">
          <div className="rounded-[22px] border border-line bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-[15px] text-ink">
                  {lang === "fa" ? "میز نظارت بر دیدگاه‌های گزارش‌شده" : "Reported Comments Queue"}
                </h3>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {lang === "fa" ? "بررسی گزارش‌های ثبت‌شده توسط کاربران و تصمیم‌گیری حذف یا تایید" : "Review reported content"}
                </p>
              </div>
              <span className="rounded-full bg-flame-soft px-3 py-1 font-extrabold text-[12px] text-flame-deep">
                {stats.reportedComments} {lang === "fa" ? "مورد در صف" : "pending"}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {adminApi.getComments("reported").map((cm) => (
                <div
                  key={cm.id}
                  className="rounded-[16px] border border-flame-deep/20 bg-flame-soft/30 p-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[13px] text-ink">{cm.author}</span>
                      <span className="ms-2 font-mono text-[12px] text-ink-faint">{cm.handle}</span>
                      <span className="ms-2 text-[12px] text-ink-faint">در {cm.targetTitle}</span>
                    </div>
                    <span className="rounded-full bg-flame-soft px-2 py-0.5 text-[12px] font-extrabold text-flame-deep">
                      {cm.reportReason || "Flagged"}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] text-ink-body leading-relaxed">{cm.text}</p>
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        adminApi.approveComment(cm.id);
                        notify(lang === "fa" ? "دیدگاه تایید و برگردانده شد" : "Comment restored", "primary");
                      }}
                      className="rounded-lg border border-line bg-surface px-3 py-1 text-[12px] font-bold text-ink hover:bg-subtle"
                    >
                      {lang === "fa" ? "رد گزارش (تایید دیدگاه)" : "Dismiss Flag"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        adminApi.deleteComment(cm.id);
                        notify(lang === "fa" ? "دیدگاه با موفقیت حذف شد" : "Comment deleted", "primary");
                      }}
                      className="rounded-lg bg-flame-deep px-3 py-1 text-[12px] font-bold text-white hover:bg-flame-deep/90"
                    >
                      {lang === "fa" ? "حذف دیدگاه و پاسخ‌ها" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}

              {adminApi.getComments("reported").length === 0 && (
                <div className="py-8 text-center text-ink-muted">
                  <Icon name="check" size={24} className="mx-auto text-teal-deep" />
                  <p className="mt-2 text-[12px] font-bold">
                    {lang === "fa" ? "صف دیدگاه‌های گزارش‌شده خالی است" : "No reported comments in queue"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 8: LYRICS SUBMISSIONS REVIEW ===================== */}
      {activeTab === "lyrics" && (
        <div className="space-y-4">
          <div className="rounded-[22px] border border-line bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-[15px] text-ink">
                  {lang === "fa" ? "میز بررسی متن‌های آهنگ ارسالی هواداران" : "Fan Lyric Sheet Submissions Review"}
                </h3>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {lang === "fa" ? "تایید متن ترانه و پرداخت ۱۸ امتیاز وفاداری به حساب هوادار" : "Approve lyrics & award points"}
                </p>
              </div>
              <span className="rounded-full bg-primary-soft px-3 py-1 font-extrabold text-[12px] text-primary-deep">
                {stats.pendingLyrics} {lang === "fa" ? "متن در انتظار" : "pending"}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {adminApi.getLyricSubmissions().map((sub) => (
                <div key={sub.id} className="rounded-[16px] border border-line/60 bg-subtle/40 p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[13.5px] text-ink">{sub.trackTitle}</h4>
                      <span className="text-[12px] text-ink-muted">{sub.language} · {dataLabel(sub.sentAt)}</span>
                    </div>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[12px] font-extrabold uppercase",
                      sub.status === "approved" ? "bg-mint-soft text-teal-deep" : "bg-primary-soft text-primary-deep",
                    )}>
                      {sub.status}
                    </span>
                  </div>

                  <pre className="mt-2 max-h-28 overflow-y-auto rounded-lg bg-surface p-2 font-mono text-[12px] leading-relaxed text-ink-body scroll-slim">
                    {sub.original}
                  </pre>

                  {sub.status === "pending" && (
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          adminApi.rejectLyricSubmission(sub.id);
                          notify(lang === "fa" ? "پیشنهاد رد شد" : "Submission rejected", "primary");
                        }}
                        className="rounded-lg border border-line bg-surface px-3 py-1 text-[12px] font-bold text-ink-muted hover:text-ink"
                      >
                        {lang === "fa" ? "رد" : "Reject"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          adminApi.approveLyricSubmission(sub.id, 18);
                          notify(lang === "fa" ? "متن تایید شد و ۱۸ امتیاز به هوادار پرداخت گردید" : "Approved & +18 pts awarded", "primary");
                        }}
                        className="rounded-lg bg-primary-deep px-3 py-1 text-[12px] font-bold text-white shadow-sm hover:bg-primary-deep/90"
                      >
                        {lang === "fa" ? "تایید و پرداخت ۱۸ امتیاز" : "Approve (+18 pts)"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 9: SHOP INVENTORY ===================== */}
      {activeTab === "shop" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative min-w-0 max-w-sm flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "fa" ? "جستجو در محصولات..." : "Search products..."}
                className="w-full rounded-[14px] border border-line bg-surface py-2 pe-3 ps-9 text-[12px] text-ink shadow-sm outline-none focus:border-primary-deep"
              />
              <div className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-ink-faint">
                <Icon name="search" size={14} />
              </div>
            </div>

            <button
              type="button"
              onClick={openCreateProduct}
              className="flex shrink-0 items-center gap-2 rounded-[14px] bg-primary-deep px-4 py-2 font-bold text-[12px] text-white shadow-sm transition hover:bg-primary-deep/90"
            >
              <Icon name="plus" size={15} />
              <span>{lang === "fa" ? "+ افزودن محصول به فروشگاه" : "+ Add Product"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {adminApi.getProducts(searchQuery).map((p) => (
              <div
                key={p.id}
                className="flex flex-col overflow-hidden rounded-[20px] border border-line bg-surface p-3.5 shadow-sm"
              >
                <img src={p.photo} alt={p.name} className="aspect-square w-full rounded-[14px] object-cover" />
                <h4 className="mt-2.5 font-extrabold text-[13.5px] text-ink truncate">{p.name}</h4>
                <p className="text-[12px] font-bold text-teal-deep">{toman(p.price, locale)}</p>

                <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2">
                  <span className="text-[12px] capitalize text-ink-faint">{p.category}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditProduct(p)}
                      className="rounded-lg p-1.5 text-ink-faint hover:text-primary-deep"
                    >
                      <Icon name="edit" size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(lang === "fa" ? `حذف محصول "${p.name}"؟` : `Delete product "${p.name}"?`)) {
                          adminApi.deleteProduct(p.id);
                          notify(t("admin.deletedToast"), "primary");
                        }
                      }}
                      className="rounded-lg p-1.5 text-ink-faint hover:text-flame-deep"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 10: SITE VISIBILITY & FEATURE TOGGLES ===================== */}
      {activeTab === "settings" && (
        <div className="space-y-4">
          <div className="rounded-[22px] border border-line bg-surface p-5 shadow-sm">
            <h3 className="font-extrabold text-[16px] text-ink">
              {lang === "fa" ? "مدیریت نمایش بخش‌ها و آیکون‌های سایت" : "Site Sections & Feature Visibility"}
            </h3>
            <p className="mt-1 text-[12px] text-ink-muted">
              {lang === "fa"
                ? "می‌توانید بخش‌های مختلف سایت نظیر فروشگاه، اخبار، پلی‌لیست‌ها و... را به صورت موقت فعال یا پنهان کنید."
                : "Control which sections and navigation icons appear on the consumer site"}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <label className="flex items-center justify-between rounded-[16px] border border-line bg-subtle/30 p-3.5 cursor-pointer">
                <div>
                  <span className="font-bold text-[13px] text-ink">{lang === "fa" ? "بخش و منوی فروشگاه (Shop)" : "Shop Section"}</span>
                  <p className="text-[12px] text-ink-muted">{lang === "fa" ? "نمایش آیکون فروشگاه در منوی بالا و پایین" : "Show shop route & items"}</p>
                </div>
                <input
                  type="checkbox"
                  checked={siteSettings.showShop}
                  onChange={(e) => adminApi.updateSiteSettings({ showShop: e.target.checked })}
                  className="h-5 w-5 rounded accent-primary-deep cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between rounded-[16px] border border-line bg-subtle/30 p-3.5 cursor-pointer">
                <div>
                  <span className="font-bold text-[13px] text-ink">{lang === "fa" ? "بخش و شلف اخبار (News)" : "News Editorial"}</span>
                  <p className="text-[12px] text-ink-muted">{lang === "fa" ? "نمایش شلف اخبار تحریریه در صفحه اصلی" : "Show news desk shelf"}</p>
                </div>
                <input
                  type="checkbox"
                  checked={siteSettings.showNews}
                  onChange={(e) => adminApi.updateSiteSettings({ showNews: e.target.checked })}
                  className="h-5 w-5 rounded accent-primary-deep cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between rounded-[16px] border border-line bg-subtle/30 p-3.5 cursor-pointer">
                <div>
                  <span className="font-bold text-[13px] text-ink">{lang === "fa" ? "پلی‌لیست‌ها (Playlists)" : "Playlists Shelf"}</span>
                  <p className="text-[12px] text-ink-muted">{lang === "fa" ? "نمایش پلی‌لیست‌های اختصاصی و منتخب" : "Show curated playlists"}</p>
                </div>
                <input
                  type="checkbox"
                  checked={siteSettings.showPlaylists}
                  onChange={(e) => adminApi.updateSiteSettings({ showPlaylists: e.target.checked })}
                  className="h-5 w-5 rounded accent-primary-deep cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between rounded-[16px] border border-line bg-subtle/30 p-3.5 cursor-pointer">
                <div>
                  <span className="font-bold text-[13px] text-ink">{lang === "fa" ? "بخش آلبوم‌ها (Albums)" : "Albums"}</span>
                  <p className="text-[12px] text-ink-muted">{lang === "fa" ? "نمایش شلف آلبوم‌های تازه" : "Show fresh albums shelf"}</p>
                </div>
                <input
                  type="checkbox"
                  checked={siteSettings.showAlbums}
                  onChange={(e) => adminApi.updateSiteSettings({ showAlbums: e.target.checked })}
                  className="h-5 w-5 rounded accent-primary-deep cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between rounded-[16px] border border-line bg-subtle/30 p-3.5 cursor-pointer">
                <div>
                  <span className="font-bold text-[13px] text-ink">{lang === "fa" ? "امکان ارسال لیریک توسط هواداران" : "Fan Lyrics Submissions"}</span>
                  <p className="text-[12px] text-ink-muted">{lang === "fa" ? "فعال بودن فرم ارسال لیریک در پلیر" : "Allow fan sheet submissions"}</p>
                </div>
                <input
                  type="checkbox"
                  checked={siteSettings.showLyricsSubmissions}
                  onChange={(e) => adminApi.updateSiteSettings({ showLyricsSubmissions: e.target.checked })}
                  className="h-5 w-5 rounded accent-primary-deep cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between rounded-[16px] border border-line bg-subtle/30 p-3.5 cursor-pointer">
                <div>
                  <span className="font-bold text-[13px] text-ink">{lang === "fa" ? "بخش دیدگاه‌ها و گفتگو (Comments)" : "Comments Section"}</span>
                  <p className="text-[12px] text-ink-muted">{lang === "fa" ? "امکان ارسال دیدگاه ذیل آهنگ‌ها و اخبار" : "Allow public comments"}</p>
                </div>
                <input
                  type="checkbox"
                  checked={siteSettings.showCommentsSection}
                  onChange={(e) => adminApi.updateSiteSettings({ showCommentsSection: e.target.checked })}
                  className="h-5 w-5 rounded accent-primary-deep cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 11: USERS & GRANULAR RBAC ===================== */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative min-w-0 max-w-sm flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "fa" ? "جستجو در کاربران بر اساس نام یا نام کاربری..." : "Search users..."}
                className="w-full rounded-[14px] border border-line bg-surface py-2 pe-3 ps-9 text-[12px] text-ink shadow-sm outline-none focus:border-primary-deep"
              />
              <div className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-ink-faint">
                <Icon name="search" size={14} />
              </div>
            </div>

            <button
              type="button"
              onClick={openCreateUser}
              className="flex shrink-0 items-center gap-2 rounded-[14px] bg-primary-deep px-4 py-2 font-bold text-[12px] text-white shadow-sm transition hover:bg-primary-deep/90"
            >
              <Icon name="plus" size={15} />
              <span>{lang === "fa" ? "+ افزودن پرسنل / کاربر" : "+ Add Staff / User"}</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-[20px] border border-line bg-surface shadow-sm scroll-rail">
            <table className="w-full min-w-[750px] text-start text-[13px]">
              <thead className="border-b border-line bg-subtle/40 text-ink-muted">
                <tr>
                  <th className="py-3 ps-4 text-start font-bold">{lang === "fa" ? "کاربر" : "User"}</th>
                  <th className="py-3 text-start font-bold">{lang === "fa" ? "نقش اصلی" : "Primary Role"}</th>
                  <th className="py-3 text-start font-bold">{lang === "fa" ? "دسترسی‌های فعال" : "Permissions"}</th>
                  <th className="py-3 text-start font-bold">{lang === "fa" ? "وضعیت حساب" : "Status"}</th>
                  <th className="py-3 text-start font-bold">{lang === "fa" ? "امتیاز" : "Points"}</th>
                  <th className="py-3 pe-4 text-end font-bold">{lang === "fa" ? "عملیات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {adminApi.getUsers(searchQuery).map((u) => {
                  const perms = u.permissions || getDefaultPermissions(u.role);
                  return (
                    <tr key={u.id} className="transition-colors hover:bg-subtle/50">
                      <td className="py-2.5 ps-4">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar} alt={u.username} className="h-9 w-9 rounded-full object-cover" />
                          <div>
                            <p className="font-bold text-ink">{u.displayName}</p>
                            <p className="font-mono text-[12px] text-ink-faint">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[12px] font-bold capitalize text-primary-deep">
                          {u.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {perms.canApproveNews && (
                            <span className="rounded bg-teal-soft px-1.5 py-0.5 text-[12px] text-teal-deep font-bold">مدیر خبر</span>
                          )}
                          {perms.canWriteNews && !perms.canApproveNews && (
                            <span className="rounded bg-mint-soft px-1.5 py-0.5 text-[12px] text-ink font-bold">نویسنده</span>
                          )}
                          {perms.canModerateComments && (
                            <span className="rounded bg-purple-soft px-1.5 py-0.5 text-[12px] text-purple-deep font-bold">مدیر کامنت</span>
                          )}
                          {perms.canManageTracks && (
                            <span className="rounded bg-subtle px-1.5 py-0.5 text-[12px] text-ink font-bold">موسیقی</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[12px] font-bold",
                          u.status === "active" ? "bg-mint-soft text-teal-deep" : "bg-flame-soft text-flame-deep",
                        )}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-2.5 font-bold text-ink">{u.points.toLocaleString(locale)}</td>
                      <td className="py-2.5 pe-4 text-end">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditUser(u)}
                            className="rounded-lg p-1.5 text-ink-faint hover:text-primary-deep"
                            title="Edit User & Permissions"
                          >
                            <Icon name="edit" size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              adminApi.toggleUserStatus(u.username);
                              notify(lang === "fa" ? "وضعیت حساب کاربری تغییر کرد" : "Status toggled", "primary");
                            }}
                            className="rounded-lg p-1.5 text-ink-faint hover:text-ink"
                            title={u.status === "active" ? "Suspend" : "Activate"}
                          >
                            <Icon name="lock" size={14} />
                          </button>
                          {u.role !== "super_admin" && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(lang === "fa" ? `آیا از حذف حساب @${u.username} اطمینان دارید؟` : `Delete user @${u.username}?`)) {
                                  adminApi.deleteUser(u.username);
                                  notify(lang === "fa" ? "کاربر حذف شد" : "User deleted", "primary");
                                }
                              }}
                              className="rounded-lg p-1.5 text-ink-faint hover:text-flame-deep"
                              title="Delete"
                            >
                              <Icon name="close" size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== MODAL: TRACK (WITH SINGLE TRACK OPTION) ===================== */}
      {trackModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-[620px] flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h3 className="font-extrabold text-[16px] text-ink">
                {editingTrackId
                  ? (lang === "fa" ? "ویرایش کامل قطعه موسیقی" : "Edit Track")
                  : (lang === "fa" ? "افزودن قطعه موسیقی جدید" : "Add New Track")}
              </h3>
              <button
                type="button"
                onClick={() => setTrackModalOpen(false)}
                className="rounded-full p-1.5 text-ink-faint hover:bg-subtle hover:text-ink"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveTrack} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-slim">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "عنوان آهنگ" : "Track Title"}
                  </label>
                  <input
                    type="text"
                    required
                    value={trackTitle}
                    onChange={(e) => setTrackTitle(e.target.value)}
                    placeholder="e.g. Midnight Seoul"
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "هنرمند / گروه" : "Artist"}
                  </label>
                  <select
                    value={trackArtist}
                    onChange={(e) => setTrackArtist(e.target.value)}
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                  >
                    {existingArtists.map((a) => (
                      <option key={a.id} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Single Track Release Option */}
              <div className="rounded-[16px] border border-line bg-subtle/30 p-3.5 space-y-3">
                <label className="flex items-center gap-2 text-[12px] font-bold text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={trackIsSingle}
                    onChange={(e) => setTrackIsSingle(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary-deep cursor-pointer"
                  />
                  <span>{lang === "fa" ? "این اثر تک‌آهنگ است (Single Track Release)" : "This is a Single track"}</span>
                </label>

                {!trackIsSingle ? (
                  <div>
                    <label className="block text-[12px] font-bold text-ink-muted">
                      {lang === "fa" ? "انتخاب آلبوم مربوطه" : "Album"}
                    </label>
                    <select
                      value={trackAlbum}
                      onChange={(e) => setTrackAlbum(e.target.value)}
                      className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                    >
                      {existingAlbums.map((alb) => (
                        <option key={alb.id} value={alb.title}>{alb.title}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-[12px] text-purple-deep font-bold">
                    {lang === "fa" ? "● این اثر به صورت تک‌آهنگ (Single) در دیسکوگرافی منتشر خواهد شد." : "● Track will be published as an independent Single."}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "مدت زمان (دقیقه:ثانیه)" : "Duration (m:ss)"}
                  </label>
                  <input
                    type="text"
                    required
                    value={trackDuration}
                    onChange={(e) => setTrackDuration(e.target.value)}
                    placeholder="3:24"
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "تعداد پخش اولیه" : "Initial Streams"}
                  </label>
                  <input
                    type="number"
                    value={trackPlays}
                    onChange={(e) => setTrackPlays(Number(e.target.value))}
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>
              </div>

              {/* Direct Stream Audio Link from Download Host */}
              <div className="rounded-[16px] border border-line bg-subtle/30 p-3.5 space-y-1.5">
                <label className="block text-[12px] font-bold text-ink">
                  {lang === "fa" ? "لینک مستقیم پخش صوتی (هاست دانلود / CDN)" : "Audio Stream URL (Direct Host / CDN)"}
                </label>
                <input
                  type="text"
                  value={trackAudio}
                  onChange={(e) => setTrackAudio(e.target.value)}
                  placeholder="https://dl.example.com/tracks/song-master.mp3"
                  className="w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] font-mono text-ink outline-none focus:border-primary-deep"
                />
                <p className="text-[12px] text-ink-faint">
                  {lang === "fa"
                    ? "فایل صوتی نیازی به آپلود در سرور سایت ندارد؛ لینک مستقیم MP3 از هاست دانلود یا کلود در اینجا قرار می‌گیرد."
                    : "No upload required: enter direct MP3 stream URL from your download host or CDN."}
                </p>
              </div>

              {/* Featured Image Picker for Track */}
              <FeaturedImagePicker
                value={trackPhoto}
                onChange={setTrackPhoto}
                label={lang === "fa" ? "تصویر شاخص و کاور آهنگ" : "Track Artwork"}
                defaultCategory="albums"
              />

              {/* Lyrics Editor (LRC & Translation) */}
              <div className="rounded-[16px] border border-line bg-subtle/30 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[12px] font-bold text-ink">
                    {lang === "fa" ? "ویرایشگر متن آهنگ و لیریک همگام (LRC / متن ترانه)" : "Lyrics Editor"}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setTrackLyricsOriginal("[00:10.00] Line 1 original text\n[00:15.50] Line 2 chorus");
                      setTrackLyricsTranslation("[00:10.00] ترجمه فارسی سطر اول\n[00:15.50] ترجمه فارسی سطر دوم");
                    }}
                    className="text-[12px] font-bold text-primary-deep hover:underline"
                  >
                    {lang === "fa" ? "درج نمونه LRC" : "Insert LRC Sample"}
                  </button>
                </div>

                <div>
                  <span className="text-[12px] text-ink-muted">
                    {lang === "fa" ? "متن اصلی (کره‌ای / انگلیسی با برچسب زمان اختیاری)" : "Original Text"}
                  </span>
                  <textarea
                    rows={4}
                    value={trackLyricsOriginal}
                    onChange={(e) => setTrackLyricsOriginal(e.target.value)}
                    placeholder="[00:12.4] Signal in the blue rain&#10;[00:16.8] Neon lights fading away"
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface p-2.5 font-mono text-[12px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div>
                  <span className="text-[12px] text-ink-muted">
                    {lang === "fa" ? "ترجمه فارسی متن آهنگ" : "Persian Translation"}
                  </span>
                  <textarea
                    rows={3}
                    value={trackLyricsTranslation}
                    onChange={(e) => setTrackLyricsTranslation(e.target.value)}
                    placeholder="[00:12.4] سیگنال در باران آبی&#10;[00:16.8] نورهای نئونی در حال محو شدن"
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface p-2.5 font-mono text-[12px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setTrackModalOpen(false)}
                  className="rounded-[12px] border border-line bg-surface px-4 py-2 text-[12px] font-bold text-ink hover:bg-subtle"
                >
                  {lang === "fa" ? "انصراف" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="rounded-[12px] bg-primary-deep px-5 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-primary-deep/90"
                >
                  {editingTrackId
                    ? (lang === "fa" ? "ذخیره تغییرات" : "Save Changes")
                    : (lang === "fa" ? "انتشار قطعه" : "Publish Track")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: ALBUM (CREATE & EDIT & TRACK LIST) ===================== */}
      {albumModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-[650px] flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <h3 className="font-extrabold text-[16px] text-ink">
                  {editingAlbumId
                    ? (lang === "fa" ? "ویرایش آلبوم و لیست آهنگ‌ها" : "Edit Album & Tracklist")
                    : (lang === "fa" ? "ایجاد آلبوم جدید و انتخاب آهنگ‌ها" : "Create New Album")}
                </h3>
                <p className="text-[12px] text-ink-muted">
                  {lang === "fa"
                    ? "تعیین عنوان، هنرمند، تصویر شاخص و انتخاب یا جستجوی آهنگ‌های مربوط به این آلبوم"
                    : "Configure album details and link tracks"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAlbumModalOpen(false)}
                className="rounded-full p-1.5 text-ink-faint hover:bg-subtle hover:text-ink"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAlbum} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-slim">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "عنوان آلبوم" : "Album Title"}
                  </label>
                  <input
                    type="text"
                    required
                    value={albumTitle}
                    onChange={(e) => setAlbumTitle(e.target.value)}
                    placeholder="e.g. Neon Horizon"
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "هنرمند" : "Artist"}
                  </label>
                  <select
                    value={albumArtist}
                    onChange={(e) => setAlbumArtist(e.target.value)}
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                  >
                    {existingArtists.map((a) => (
                      <option key={a.id} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-ink-muted">
                  {lang === "fa" ? "سال انتشار" : "Release Year"}
                </label>
                <input
                  type="number"
                  value={albumYear}
                  onChange={(e) => setAlbumYear(Number(e.target.value))}
                  className="mt-1 w-full max-w-[140px] rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                />
              </div>

              {/* Featured Image for Album */}
              <FeaturedImagePicker
                value={albumPhoto}
                onChange={setAlbumPhoto}
                label={lang === "fa" ? "کاور و تصویر شاخص آلبوم" : "Album Cover Artwork"}
                defaultCategory="albums"
              />

              {/* DUAL TRACK SELECTION FOR ALBUM */}
              <div className="rounded-[18px] border border-line bg-subtle/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-[12px] font-extrabold text-ink">
                      {lang === "fa" ? "آهنگ‌های آلبوم (جستجو و انتخاب)" : "Album Tracklist Selection"}
                    </label>
                    <span className="text-[12px] text-ink-muted">
                      {albumSelectedTrackIds.length} {lang === "fa" ? "آهنگ انتخاب شده است" : "tracks selected"}
                    </span>
                  </div>
                </div>

                {/* Track Search Box */}
                <div className="relative">
                  <input
                    type="text"
                    value={albumTrackSearch}
                    onChange={(e) => setAlbumTrackSearch(e.target.value)}
                    placeholder={lang === "fa" ? "جستجو در عنوان قطعات برای افزودن به آلبوم..." : "Search tracks to add..."}
                    className="w-full rounded-[12px] border border-line bg-surface py-2 pe-3 ps-8 text-[12px] text-ink outline-none focus:border-primary-deep"
                  />
                  <div className="pointer-events-none absolute inset-y-0 start-2.5 flex items-center text-ink-faint">
                    <Icon name="search" size={13} />
                  </div>
                </div>

                {/* Checkable Tracks List */}
                <div className="max-h-48 overflow-y-auto rounded-[14px] border border-line bg-surface p-2 divide-y divide-line/40 scroll-slim">
                  {adminApi.getTracks(albumTrackSearch).map((tr) => {
                    const isChecked = albumSelectedTrackIds.includes(tr.id);
                    return (
                      <label
                        key={tr.id}
                        className={cn(
                          "flex cursor-pointer items-center justify-between p-2 rounded-[10px] transition text-[12px]",
                          isChecked ? "bg-primary-soft/40" : "hover:bg-subtle",
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleTrackInAlbum(tr.id)}
                            className="h-4 w-4 rounded accent-primary-deep cursor-pointer"
                          />
                          <img src={tr.photo} alt={tr.title} className="h-7 w-7 rounded object-cover" />
                          <div className="min-w-0 truncate">
                            <span className="font-bold text-ink">{tr.title}</span>
                            <span className="ms-1.5 text-ink-muted">· {tr.artist}</span>
                          </div>
                        </div>
                        <span className="text-ink-faint font-mono text-[12px]">
                          {Math.floor(tr.seconds / 60)}:{String(Math.floor(tr.seconds % 60)).padStart(2, "0")}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setAlbumModalOpen(false)}
                  className="rounded-[12px] border border-line bg-surface px-4 py-2 text-[12px] font-bold text-ink hover:bg-subtle"
                >
                  {lang === "fa" ? "انصراف" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="rounded-[12px] bg-primary-deep px-5 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-primary-deep/90"
                >
                  {editingAlbumId
                    ? (lang === "fa" ? "ذخیره تغییرات آلبوم" : "Save Album")
                    : (lang === "fa" ? "ایجاد آلبوم و اتصال آهنگ‌ها" : "Create Album")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: PLAYLIST (WITH SEARCH & TRACK SELECTION) ===================== */}
      {playlistModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-[620px] flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h3 className="font-extrabold text-[16px] text-ink">
                {editingPlaylistId
                  ? (lang === "fa" ? "ویرایش پلی‌لیست و انتخاب آهنگ‌ها" : "Edit Playlist & Tracks")
                  : (lang === "fa" ? "ساخت پلی‌لیست جدید و انتخاب آهنگ‌ها" : "Create Playlist & Add Tracks")}
              </h3>
              <button
                type="button"
                onClick={() => setPlaylistModalOpen(false)}
                className="rounded-full p-1.5 text-ink-faint hover:bg-subtle hover:text-ink"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePlaylist} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-slim">
              <div>
                <label className="block text-[12px] font-bold text-ink-muted">
                  {lang === "fa" ? "نام پلی‌لیست" : "Playlist Name"}
                </label>
                <input
                  type="text"
                  required
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "گردآورنده / کیوریتور" : "Curator"}
                  </label>
                  <input
                    type="text"
                    value={playlistCurator}
                    onChange={(e) => setPlaylistCurator(e.target.value)}
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "حال و هوا (Mood)" : "Mood"}
                  </label>
                  <input
                    type="text"
                    value={playlistMood}
                    onChange={(e) => setPlaylistMood(e.target.value)}
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>
              </div>

              {/* Featured Image for Playlist */}
              <FeaturedImagePicker
                value={playlistPhoto}
                onChange={setPlaylistPhoto}
                label={lang === "fa" ? "تصویر شاخص پلی‌لیست" : "Playlist Artwork"}
                defaultCategory="playlists"
              />

              {/* SEARCH & TRACK SELECTION FOR PLAYLIST */}
              <div className="rounded-[18px] border border-line bg-subtle/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[12px] font-extrabold text-ink">
                    {lang === "fa" ? "افزودن آهنگ‌ها به پلی‌لیست (با جستجو)" : "Add Tracks to Playlist"}
                  </label>
                  <span className="text-[12px] text-ink-muted">
                    {playlistSelectedTrackIds.length} {lang === "fa" ? "آهنگ انتخاب شده" : "tracks"}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={playlistTrackSearch}
                    onChange={(e) => setPlaylistTrackSearch(e.target.value)}
                    placeholder={lang === "fa" ? "جستجو در آهنگ‌ها برای افزودن به لیست..." : "Search tracks..."}
                    className="w-full rounded-[12px] border border-line bg-surface py-2 pe-3 ps-8 text-[12px] text-ink outline-none focus:border-primary-deep"
                  />
                  <div className="pointer-events-none absolute inset-y-0 start-2.5 flex items-center text-ink-faint">
                    <Icon name="search" size={13} />
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto rounded-[14px] border border-line bg-surface p-2 divide-y divide-line/40 scroll-slim">
                  {adminApi.getTracks(playlistTrackSearch).map((tr) => {
                    const isChecked = playlistSelectedTrackIds.includes(tr.id);
                    return (
                      <label
                        key={tr.id}
                        className={cn(
                          "flex cursor-pointer items-center justify-between p-2 rounded-[10px] transition text-[12px]",
                          isChecked ? "bg-primary-soft/40" : "hover:bg-subtle",
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleTrackInPlaylist(tr.id)}
                            className="h-4 w-4 rounded accent-primary-deep cursor-pointer"
                          />
                          <img src={tr.photo} alt={tr.title} className="h-7 w-7 rounded object-cover" />
                          <div className="min-w-0 truncate">
                            <span className="font-bold text-ink">{tr.title}</span>
                            <span className="ms-1.5 text-ink-muted">· {tr.artist}</span>
                          </div>
                        </div>
                        <span className="text-ink-faint font-mono text-[12px]">
                          {Math.floor(tr.seconds / 60)}:{String(Math.floor(tr.seconds % 60)).padStart(2, "0")}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setPlaylistModalOpen(false)}
                  className="rounded-[12px] border border-line bg-surface px-4 py-2 text-[12px] font-bold text-ink hover:bg-subtle"
                >
                  {lang === "fa" ? "انصراف" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="rounded-[12px] bg-primary-deep px-5 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-primary-deep/90"
                >
                  {editingPlaylistId
                    ? (lang === "fa" ? "ذخیره تغییرات" : "Save")
                    : (lang === "fa" ? "ساخت پلی‌لیست" : "Create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: ARTIST (CREATE & EDIT) ===================== */}
      {artistModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h3 className="font-extrabold text-[16px] text-ink">
                {editingArtistId
                  ? (lang === "fa" ? "ویرایش پروفایل هنرمند" : "Edit Artist Profile")
                  : (lang === "fa" ? "افزودن هنرمند جدید" : "Add Artist")}
              </h3>
              <button
                type="button"
                onClick={() => setArtistModalOpen(false)}
                className="rounded-full p-1.5 text-ink-faint hover:bg-subtle hover:text-ink"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveArtist} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-slim">
              <div>
                <label className="block text-[12px] font-bold text-ink-muted">
                  {lang === "fa" ? "نام هنرمند / گروه" : "Artist Name"}
                </label>
                <input
                  type="text"
                  required
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="e.g. SEORA"
                  className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "نوع ساختار" : "Kind"}
                  </label>
                  <select
                    value={artistKind}
                    onChange={(e) => setArtistKind(e.target.value as Artist["kind"])}
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                  >
                    <option value="Boy group">Boy group</option>
                    <option value="Girl group">Girl group</option>
                    <option value="Soloist">Soloist</option>
                    <option value="Duo">Duo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "سبک موسیقی" : "Genre"}
                  </label>
                  <input
                    type="text"
                    value={artistGenre}
                    onChange={(e) => setArtistGenre(e.target.value)}
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>
              </div>

              {/* Featured Image for Artist */}
              <FeaturedImagePicker
                value={artistPhoto}
                onChange={setArtistPhoto}
                label={lang === "fa" ? "تصویر شاخص هنرمند" : "Artist Photo"}
                defaultCategory="artists"
              />

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-[12px] font-bold text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={artistVerified}
                    onChange={(e) => setArtistVerified(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary-deep"
                  />
                  <span>{lang === "fa" ? "نشان تایید رسمی (Verified Badge)" : "Verified Artist"}</span>
                </label>

                <label className="flex items-center gap-2 text-[12px] font-bold text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={artistNewRelease}
                    onChange={(e) => setArtistNewRelease(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary-deep"
                  />
                  <span>{lang === "fa" ? "نشان انتشار جدید (New Release Flag)" : "New Release Pulse"}</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setArtistModalOpen(false)}
                  className="rounded-[12px] border border-line bg-surface px-4 py-2 text-[12px] font-bold text-ink hover:bg-subtle"
                >
                  {lang === "fa" ? "انصراف" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="rounded-[12px] bg-primary-deep px-5 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-primary-deep/90"
                >
                  {editingArtistId
                    ? (lang === "fa" ? "ذخیره تغییرات" : "Save Changes")
                    : (lang === "fa" ? "ثبت هنرمند" : "Add Artist")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: NEWS (WITH AUTHOR & MANAGER WORKFLOW) ===================== */}
      {newsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-[620px] flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h3 className="font-extrabold text-[16px] text-ink">
                {editingNewsId
                  ? (lang === "fa" ? "ویرایش خبر و مقاله" : "Edit News Article")
                  : (lang === "fa" ? "نگارش یا انتشار خبر جدید" : "Write / Publish Story")}
              </h3>
              <button
                type="button"
                onClick={() => setNewsModalOpen(false)}
                className="rounded-full p-1.5 text-ink-faint hover:bg-subtle hover:text-ink"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveNews} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-slim">
              <div>
                <label className="block text-[12px] font-bold text-ink-muted">
                  {lang === "fa" ? "عنوان خبر" : "Headline"}
                </label>
                <input
                  type="text"
                  required
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "نویسنده / تحریریه" : "Author"}
                  </label>
                  <input
                    type="text"
                    value={newsAuthor}
                    onChange={(e) => setNewsAuthor(e.target.value)}
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "تگ موضوعی" : "Topic Tag"}
                  </label>
                  <select
                    value={newsTag}
                    onChange={(e) => setNewsTag(e.target.value)}
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                  >
                    <option value="Tour">Tour</option>
                    <option value="Comeback">Comeback</option>
                    <option value="Charts">Charts</option>
                    <option value="Editorial">Editorial</option>
                    <option value="Awards">Awards</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-ink-muted">
                  {lang === "fa" ? "خلاصه خبر (چکیده)" : "Excerpt"}
                </label>
                <textarea
                  rows={2}
                  required
                  value={newsExcerpt}
                  onChange={(e) => setNewsExcerpt(e.target.value)}
                  className="mt-1 w-full rounded-[12px] border border-line bg-surface p-2.5 text-[12px] text-ink outline-none focus:border-primary-deep"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-ink-muted">
                  {lang === "fa" ? "متن کامل مقاله" : "Full Story Content"}
                </label>
                <textarea
                  rows={4}
                  value={newsBody}
                  onChange={(e) => setNewsBody(e.target.value)}
                  className="mt-1 w-full rounded-[12px] border border-line bg-surface p-2.5 text-[12px] text-ink outline-none focus:border-primary-deep"
                />
              </div>

              {/* Featured Image for News */}
              <FeaturedImagePicker
                value={newsPhoto}
                onChange={setNewsPhoto}
                label={lang === "fa" ? "تصویر شاخص و بنر خبر" : "News Banner Image"}
                defaultCategory="news"
              />

              {/* Status / Publication Workflow Toggle */}
              <div className="rounded-[16px] border border-line bg-subtle/30 p-3.5">
                <label className="block text-[12px] font-bold text-ink">
                  {lang === "fa" ? "وضعیت انتشار مقاله" : "Publication Workflow Status"}
                </label>
                <div className="mt-2 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-[12px] font-bold text-ink cursor-pointer">
                    <input
                      type="radio"
                      checked={newsStatus === "published"}
                      onChange={() => setNewsStatus("published")}
                      className="accent-primary-deep"
                    />
                    <span>{lang === "fa" ? "انتشار مستقیم (تایید مدیر)" : "Publish Immediately"}</span>
                  </label>

                  <label className="flex items-center gap-2 text-[12px] font-bold text-ink cursor-pointer">
                    <input
                      type="radio"
                      checked={newsStatus === "pending_review"}
                      onChange={() => setNewsStatus("pending_review")}
                      className="accent-primary-deep"
                    />
                    <span>{lang === "fa" ? "پیش‌نویس نویسنده (نیازمند تایید مدیر)" : "Draft (Requires Approval)"}</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setNewsModalOpen(false)}
                  className="rounded-[12px] border border-line bg-surface px-4 py-2 text-[12px] font-bold text-ink hover:bg-subtle"
                >
                  {lang === "fa" ? "انصراف" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="rounded-[12px] bg-primary-deep px-5 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-primary-deep/90"
                >
                  {editingNewsId
                    ? (lang === "fa" ? "ذخیره تغییرات" : "Save")
                    : (newsStatus === "published"
                        ? (lang === "fa" ? "انتشار مستقیم خبر" : "Publish Story")
                        : (lang === "fa" ? "ارسال پیش‌نویس برای مدیر" : "Submit Draft"))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: SHOP (CREATE & EDIT) ===================== */}
      {productModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-[540px] flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h3 className="font-extrabold text-[16px] text-ink">
                {editingProductId
                  ? (lang === "fa" ? "ویرایش محصول فروشگاه" : "Edit Merch Item")
                  : (lang === "fa" ? "افزودن محصول جدید به فروشگاه" : "Add Product")}
              </h3>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="rounded-full p-1.5 text-ink-faint hover:bg-subtle hover:text-ink"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-slim">
              <div>
                <label className="block text-[12px] font-bold text-ink-muted">
                  {lang === "fa" ? "نام محصول" : "Product Name"}
                </label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "دسته‌بندی" : "Category"}
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as any)}
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                  >
                    <option value="apparel">{lang === "fa" ? "پوشاک" : "Apparel"}</option>
                    <option value="lightstick">{lang === "fa" ? "لایت‌استیک" : "Lightstick"}</option>
                    <option value="vinyl">{lang === "fa" ? "آلبوم فیزیکی / دیسک" : "Vinyl & CDs"}</option>
                    <option value="accessories">{lang === "fa" ? "اکسسوری و لوازم" : "Accessories"}</option>
                    <option value="collectibles">{lang === "fa" ? "کلکسیونی" : "Collectibles"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "قیمت (تومان)" : "Price (Toman)"}
                  </label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>
              </div>

              {/* Featured Image for Product */}
              <FeaturedImagePicker
                value={prodPhoto}
                onChange={setProdPhoto}
                label={lang === "fa" ? "تصویر شاخص محصول" : "Product Photo"}
                defaultCategory="shop"
              />

              <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="rounded-[12px] border border-line bg-surface px-4 py-2 text-[12px] font-bold text-ink hover:bg-subtle"
                >
                  {lang === "fa" ? "انصراف" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="rounded-[12px] bg-primary-deep px-5 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-primary-deep/90"
                >
                  {editingProductId
                    ? (lang === "fa" ? "ذخیره تغییرات" : "Save")
                    : (lang === "fa" ? "افزودن محصول" : "Add Product")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: USER & GRANULAR RBAC ===================== */}
      {userModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-[580px] flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <h3 className="font-extrabold text-[16px] text-ink">
                  {editingUsername
                    ? (lang === "fa" ? "ویرایش مشخصات و دسترسی‌های پرسنل" : "Edit User & Granular RBAC")
                    : (lang === "fa" ? "تعریف پرسنل / کاربر با سطوح دسترسی" : "Add Staff / User with Permissions")}
                </h3>
                <p className="text-[12px] text-ink-muted">
                  {lang === "fa" ? "تعیین نقش اصلی و اعطای دسترسی‌های بیشتر و اختصاصی" : "Set primary role and toggle granular permissions"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUserModalOpen(false)}
                className="rounded-full p-1.5 text-ink-faint hover:bg-subtle hover:text-ink"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-slim">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "نام نمایشی" : "Display Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={userDisplayName}
                    onChange={(e) => setUserDisplayName(e.target.value)}
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                {!editingUsername && (
                  <div>
                    <label className="block text-[12px] font-bold text-ink-muted">
                      {lang === "fa" ? "نام کاربری (لاتین)" : "Username"}
                    </label>
                    <input
                      type="text"
                      required
                      value={userUsername}
                      onChange={(e) => setUserUsername(e.target.value)}
                      className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] font-mono text-ink outline-none focus:border-primary-deep"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "نقش اصلی حساب" : "Primary Role"}
                  </label>
                  <select
                    value={userRole}
                    onChange={(e) => handleRoleChange(e.target.value as AdminUserRole)}
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                  >
                    <option value="super_admin">{lang === "fa" ? "مدیر کل ارشد (Super Admin)" : "Super Admin"}</option>
                    <option value="news_manager">{lang === "fa" ? "مدیر اخبار (News Manager & Supervisor)" : "News Manager"}</option>
                    <option value="news_author">{lang === "fa" ? "نویسنده اخبار (News Author)" : "News Author"}</option>
                    <option value="comment_moderator">{lang === "fa" ? "مدیر نظارت دیدگاه‌ها (Comment Moderator)" : "Comment Moderator"}</option>
                    <option value="music_curator">{lang === "fa" ? "مدیر کاتالوگ موسیقی و لیریک (Music Curator)" : "Music Curator"}</option>
                    <option value="shop_manager">{lang === "fa" ? "مدیر فروشگاه (Shop Manager)" : "Shop Manager"}</option>
                    <option value="user">{lang === "fa" ? "کاربر هوادار (Fan User)" : "Fan User"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "امتیاز وفاداری" : "Loyalty Points"}
                  </label>
                  <input
                    type="number"
                    value={userPoints}
                    onChange={(e) => setUserPoints(Number(e.target.value))}
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>
              </div>

              {/* GRANULAR PERMISSIONS MATRIX */}
              <div className="rounded-[18px] border border-line bg-subtle/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[12px] font-extrabold text-ink">
                    {lang === "fa" ? "ماتریس دسترسی‌های اختصاصی (افزودن دسترسی بیشتر)" : "Granular Permissions Matrix"}
                  </label>
                  <span className="text-[12px] text-ink-muted">
                    {lang === "fa" ? "تغییر دسترسی فراتر از نقش پایه" : "Customize perms"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <label className="flex items-center gap-2 rounded-lg border border-line bg-surface p-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userPerms.canManageTracks}
                      onChange={() => handleTogglePermission("canManageTracks")}
                      className="accent-primary-deep"
                    />
                    <span>{lang === "fa" ? "مدیریت آهنگ‌ها" : "Manage Tracks"}</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-lg border border-line bg-surface p-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userPerms.canManageAlbums}
                      onChange={() => handleTogglePermission("canManageAlbums")}
                      className="accent-primary-deep"
                    />
                    <span>{lang === "fa" ? "مدیریت آلبوم‌ها" : "Manage Albums"}</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-lg border border-line bg-surface p-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userPerms.canManagePlaylists}
                      onChange={() => handleTogglePermission("canManagePlaylists")}
                      className="accent-primary-deep"
                    />
                    <span>{lang === "fa" ? "مدیریت پلی‌لیست‌ها" : "Manage Playlists"}</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-lg border border-line bg-surface p-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userPerms.canManageArtists}
                      onChange={() => handleTogglePermission("canManageArtists")}
                      className="accent-primary-deep"
                    />
                    <span>{lang === "fa" ? "مدیریت هنرمندان" : "Manage Artists"}</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-lg border border-line bg-surface p-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userPerms.canWriteNews}
                      onChange={() => handleTogglePermission("canWriteNews")}
                      className="accent-primary-deep"
                    />
                    <span>{lang === "fa" ? "نگارش اخبار (نویسنده)" : "Write News Drafts"}</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-lg border border-line bg-surface p-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userPerms.canApproveNews}
                      onChange={() => handleTogglePermission("canApproveNews")}
                      className="accent-primary-deep"
                    />
                    <span>{lang === "fa" ? "تایید و انتشار اخبار (مدیر)" : "Publish & Approve News"}</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-lg border border-line bg-surface p-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userPerms.canModerateComments}
                      onChange={() => handleTogglePermission("canModerateComments")}
                      className="accent-primary-deep"
                    />
                    <span>{lang === "fa" ? "نظارت بر دیدگاه‌ها" : "Moderate Comments"}</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-lg border border-line bg-surface p-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userPerms.canReviewLyrics}
                      onChange={() => handleTogglePermission("canReviewLyrics")}
                      className="accent-primary-deep"
                    />
                    <span>{lang === "fa" ? "بررسی لیریک‌های ارسالی" : "Review Lyrics Sheets"}</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-lg border border-line bg-surface p-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userPerms.canManageShop}
                      onChange={() => handleTogglePermission("canManageShop")}
                      className="accent-primary-deep"
                    />
                    <span>{lang === "fa" ? "مدیریت فروشگاه" : "Manage Merch Shop"}</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-lg border border-line bg-surface p-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userPerms.canViewAnalytics}
                      onChange={() => handleTogglePermission("canViewAnalytics")}
                      className="accent-primary-deep"
                    />
                    <span>{lang === "fa" ? "مشاهده آمار پیشرفته" : "View Analytics"}</span>
                  </label>
                </div>
              </div>

              {/* Avatar Selector via FeaturedImagePicker */}
              <FeaturedImagePicker
                value={userAvatar}
                onChange={setUserAvatar}
                label={lang === "fa" ? "تصویر آواتار کاربر" : "User Avatar"}
                defaultCategory="all"
              />

              <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="rounded-[12px] border border-line bg-surface px-4 py-2 text-[12px] font-bold text-ink hover:bg-subtle"
                >
                  {lang === "fa" ? "انصراف" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="rounded-[12px] bg-primary-deep px-5 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-primary-deep/90"
                >
                  {editingUsername
                    ? (lang === "fa" ? "ذخیره تغییرات" : "Save")
                    : (lang === "fa" ? "افزودن کاربر" : "Add User")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: BACKUP & RESTORE ===================== */}
      {backupModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h3 className="font-extrabold text-[16px] text-ink">
                {lang === "fa" ? "پشتیبان‌گیری و بازیابی پایگاه داده" : "Database Backup & Restore"}
              </h3>
              <button
                type="button"
                onClick={() => setBackupModalOpen(false)}
                className="rounded-full p-1.5 text-ink-faint hover:bg-subtle hover:text-ink"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto scroll-slim">
              <p className="text-[12px] text-ink-muted leading-relaxed">
                {lang === "fa"
                  ? "متن داده‌های دیتابیس را برای پشتیبان‌گیری کپی کنید، یا فایل پشتیبان JSON قبلی را در کادر زیر جای‌گذاری کرده و دکمه بازیابی را بزنید."
                  : "Copy current JSON database state or paste backup JSON below to restore."}
              </p>
              <textarea
                rows={10}
                value={backupJsonText}
                onChange={(e) => setBackupJsonText(e.target.value)}
                className="w-full rounded-[14px] border border-line bg-subtle/50 p-3 font-mono text-[12px] text-ink outline-none focus:border-primary-deep"
              />
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(backupJsonText);
                    notify(lang === "fa" ? "داده‌ها در کلیپ‌بورد کپی شد" : "Copied to clipboard", "primary");
                  }}
                  className="rounded-[12px] border border-line bg-surface px-4 py-2 text-[12px] font-bold text-ink hover:bg-subtle"
                >
                  {lang === "fa" ? "کپی در کلیپ‌بورد" : "Copy to Clipboard"}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBackupModalOpen(false)}
                    className="rounded-[12px] border border-line bg-surface px-4 py-2 text-[12px] font-bold text-ink hover:bg-subtle"
                  >
                    {lang === "fa" ? "بستن" : "Close"}
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyImport}
                    className="rounded-[12px] bg-primary-deep px-5 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-primary-deep/90"
                  >
                    {lang === "fa" ? "بازیابی دیتابیس" : "Apply Restore"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
