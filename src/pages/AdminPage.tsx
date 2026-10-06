import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePreferences } from "../app/PreferencesContext";
import { useApp } from "../app/AppContext";
import { useAuth } from "../app/AuthContext";
import {
  adminApi,
  getDefaultPermissions,
  type AdminAlbum,
  type AdminCommentRecord,
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
import {
  executeCategoryPublish,
  generateGraphicBanner,
  generatePostCaption,
  getAuditLogs,
  getCategoryItems,
  getCategoryTitle,
  publishToBale,
  publishToTelegram,
  testSmsGateway,
  checkAndRunWeeklyAutoPublish,
  downloadDataUrl,
  SAMPLE_RELEASE_ITEMS,
  generateItemSquareBanner,
  generateItemCaption,
  publishItemToChannels,
  type PublishCategory,
  type PublishLogEntry,
  type PublishItemPayload,
  type ItemPublishType,
} from "../api/channelPublisher";
import {
  loadAcademyAd,
  saveAcademyAd,
  loadAllLyricEducation,
  saveLyricEducationItem,
  deleteLyricEducationItem,
  loadEducationSettings,
  saveEducationSettings,
  romanizeHangul,
  type AcademyAd,
  type LyricEducation,
  type EducationSettings,
} from "../data/lyricLearning";
import {
  loadAllStoryBackgrounds,
  saveStoryBackground,
  deleteStoryBackground,
  type StoryBackground,
} from "../data/storyBackgrounds";
import { ARTIST_FANDOMS } from "../api/socialApi";

export function AdminPage() {
  const { t, locale, dir, lang, dataLabel } = usePreferences();
  const { navigate, notify } = useApp();
  const { isAdmin, openAccount } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTabId>(() => getActiveAdminTab());
  const [stats, setStats] = useState<AdminOverviewStats>(() => adminApi.getOverviewStats());
  const [siteSettings, setSiteSettings] = useState<SiteFeatureSettings>(() => adminApi.getSiteSettings());
  const [settingsDraft, setSettingsDraft] = useState<SiteFeatureSettings>(() => adminApi.getSiteSettings());
  const [settingsSubTab, setSettingsSubTab] = useState<
    "branding" | "colors" | "seo" | "texts" | "modules" | "integrations" | "social_automation" | "ads" | "story_backgrounds" | "database"
  >("branding");
  const [importJsonInput, setImportJsonInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statsPeriod, setStatsPeriod] = useState<"today" | "week" | "all">("today");

  // Language Academy Ad State
  const [academyAd, setAcademyAd] = useState<AcademyAd>(() => loadAcademyAd());

  // Story Backgrounds State
  const [adminBackgrounds, setAdminBackgrounds] = useState<StoryBackground[]>(() => loadAllStoryBackgrounds());
  const [newBgTitleFa, setNewBgTitleFa] = useState("");
  const [newBgTitleEn, setNewBgTitleEn] = useState("");
  const [newBgArtistId, setNewBgArtistId] = useState("bts");
  const [newBgPoints, setNewBgPoints] = useState(100);
  const [newBgGradFrom, setNewBgGradFrom] = useState("#9333ea");
  const [newBgGradTo, setNewBgGradTo] = useState("#20063b");
  const [newBgPattern, setNewBgPattern] = useState<StoryBackground["pattern"]>("cosmic_stars");

  // Track Lyric Educational Notes State
  const [eduSettings, setEduSettings] = useState<EducationSettings>(() => loadEducationSettings());
  const [allLyricEdus, setAllLyricEdus] = useState<Record<string, LyricEducation[]>>(() => loadAllLyricEducation());
  const [eduTrackId, setEduTrackId] = useState<string>("nt1");
  const [eduLineIndex, setEduLineIndex] = useState<number>(0);
  const [eduKoreanLine, setEduKoreanLine] = useState("빛나는 밤하늘 아래서");
  const [eduRomanization, setEduRomanization] = useState("Binnaneun bamhaneul araeseo");
  const [eduTranslationFa, setEduTranslationFa] = useState("زیر آسمان درخشان شب");
  const [eduWordKorean, setEduWordKorean] = useState("빛나다");
  const [eduWordPronounce, setEduWordPronounce] = useState("بین‌نادا");
  const [eduWordPronounceEn, setEduWordPronounceEn] = useState("bit-na-da");
  const [eduWordMeaning, setEduWordMeaning] = useState("درخشیدن، تابیدن");
  const [eduGrammarRule, setEduGrammarRule] = useState("پسوند صفت‌ساز فاعلی ~는");
  const [eduGrammarExpl, setEduGrammarExpl] = useState("به ریشه فعل حال اضافه شده و اسم بعدی را توصیف می‌کند.");
  const [eduNotes, setEduNotes] = useState("استعاره از روشنایی امید در اشعار کی‌پاپ.");

  // Integrations & Social Automation State
  const [showSmsKey, setShowSmsKey] = useState(false);
  const [showTgToken, setShowTgToken] = useState(false);
  const [showBaleToken, setShowBaleToken] = useState(false);

  const [testSmsPhone, setTestSmsPhone] = useState("09120000000");
  const [smsTesting, setSmsTesting] = useState(false);
  const [smsTestMsg, setSmsTestMsg] = useState<string | null>(null);

  const [tgTesting, setTgTesting] = useState(false);
  const [tgTestMsg, setTgTestMsg] = useState<string | null>(null);

  const [baleTesting, setBaleTesting] = useState(false);
  const [baleTestMsg, setBaleTestMsg] = useState<string | null>(null);

  // Social Publishing Preview & Audit State
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedPublishCat, setSelectedPublishCat] = useState<PublishCategory | null>(null);
  const [previewIsSquare, setPreviewIsSquare] = useState(false);
  const [previewItemPayload, setPreviewItemPayload] = useState<PublishItemPayload | null>(null);
  const [previewBannerImg, setPreviewBannerImg] = useState<string>("");
  const [previewCaption, setPreviewCaption] = useState<string>("");
  const [publishingCat, setPublishingCat] = useState<string | null>(null);
  const [publishLogs, setPublishLogs] = useState<PublishLogEntry[]>(() => getAuditLogs());

  useEffect(() => {
    checkAndRunWeeklyAutoPublish();
  }, []);

  // Track Hash Route for Admin Tabs
  useEffect(() => {
    const onHashChange = () => {
      setActiveTab(getActiveAdminTab());
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Synchronize with reactive updates from adminApi
  const refreshData = useCallback(() => {
    setStats(adminApi.getOverviewStats());
    const updated = adminApi.getSiteSettings();
    setSiteSettings(updated);
    setSettingsDraft(updated);
  }, []);

  useEffect(() => {
    return adminApi.subscribe(refreshData);
  }, [refreshData]);

  /* ---------------- Comments Real-Time Auto-Refresh & State ---------------- */
  const [commentFilter, setCommentFilter] = useState<"all" | "new" | "reported" | "reviewed">("all");
  const [autoRefreshComments, setAutoRefreshComments] = useState(true);
  const [refreshCountdown, setRefreshCountdown] = useState(5);
  const [commentsRefreshNonce, setCommentsRefreshNonce] = useState(0);

  // Auto-refresh timer for comments in real-time
  useEffect(() => {
    if (!autoRefreshComments || activeTab !== "comments") return;

    const interval = window.setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          setCommentsRefreshNonce((n) => n + 1);
          setStats(adminApi.getOverviewStats());
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [autoRefreshComments, activeTab]);

  const handleManualRefreshComments = () => {
    setCommentsRefreshNonce((n) => n + 1);
    setRefreshCountdown(5);
    setStats(adminApi.getOverviewStats());
    notify(lang === "fa" ? "فهرست دیدگاه‌ها بروزرسانی شد" : "Comments refreshed", "primary");
  };

  /* ---------------- Content Requests State & Handlers ---------------- */
  const [requestFilter, setRequestFilter] = useState<"all" | "pending" | "fulfilled" | "rejected">("all");
  const [requestTypeFilter, setRequestTypeFilter] = useState<"all" | "track" | "album" | "lyrics" | "artist">("all");

  const handleFulfillRequest = (id: string, title: string) => {
    adminApi.fulfillContentRequest(id, "تایید و در آرشیو پلتفرم منتشر شد");
    setStats(adminApi.getOverviewStats());
    notify(
      lang === "fa"
        ? `درخواست «${title}» تایید و ۲۵ امتیاز به کاربر اعطا شد!`
        : `Request "${title}" fulfilled and +25 points awarded!`,
      "mint",
    );
  };

  const handleRejectRequest = (id: string, title: string) => {
    adminApi.rejectContentRequest(id, "به دلیل عدم رعایت قوانین یا محتوای تکراری رد شد");
    setStats(adminApi.getOverviewStats());
    notify(
      lang === "fa"
        ? `درخواست «${title}» رد شد.`
        : `Request "${title}" rejected.`,
      "primary",
    );
  };

  const handleDeleteRequest = (id: string) => {
    adminApi.deleteContentRequest(id);
    setStats(adminApi.getOverviewStats());
    notify(
      lang === "fa" ? "درخواست حذف شد." : "Request removed.",
      "primary",
    );
  };

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
  const [trackLyricsRomanization, setTrackLyricsRomanization] = useState("");

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
    setTrackLyricsRomanization("");
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
    setTrackLyricsRomanization(existingLyrics?.romanization ?? "");
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
        lyricsRomanization: trackLyricsRomanization.trim() || undefined,
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
        lyricsRomanization: trackLyricsRomanization.trim() || undefined,
      });

      // Auto-publish to channels
      publishItemToChannels({
        type: "track",
        title: trackTitle.trim(),
        subtitle: trackArtist.trim(),
        details: trackIsSingle ? "تک‌آهنگ رسمی" : trackAlbum.trim(),
        photo: trackPhoto.trim(),
        link: "https://faimess.ir",
        metaCol1Label: "خواننده",
        metaCol1Value: trackArtist.trim(),
        metaCol2Label: "مدت زمان",
        metaCol2Value: trackDuration.trim() || "3:20",
        metaCol3Label: "کیفیت پخش",
        metaCol3Value: "320K FLAC",
      }).then(() => {
        setPublishLogs(getAuditLogs());
      });

      notify(lang === "fa" ? "آهنگ جدید منتشر و در کانال‌ها اطلاع‌رسانی شد" : "Track published & announced to channels", "primary");
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

      // Auto-publish to channels
      publishItemToChannels({
        type: "album",
        title: albumTitle.trim(),
        subtitle: albumArtist.trim(),
        details: `${albumSelectedTrackIds.length || 1} قطعه • انتشار ${albumYear}`,
        photo: albumPhoto,
        link: "https://faimess.ir/#albums",
        metaCol1Label: "هنرمند",
        metaCol1Value: albumArtist.trim(),
        metaCol2Label: "تعداد قطعات",
        metaCol2Value: `${albumSelectedTrackIds.length || 1} ترک`,
        metaCol3Label: "سال انتشار",
        metaCol3Value: String(albumYear),
      }).then(() => {
        setPublishLogs(getAuditLogs());
      });

      notify(lang === "fa" ? "آلبوم جدید ایجاد و در کانال‌ها اطلاع‌رسانی شد" : "Album created & announced to channels", "primary");
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

      // Auto-publish to channels
      publishItemToChannels({
        type: "playlist",
        title: playlistName.trim(),
        subtitle: `حال و هوا: ${playlistMood.trim()}`,
        details: `کیوریتور: ${playlistCurator.trim()} • ${playlistSelectedTrackIds.length || 10} قطعه`,
        photo: playlistPhoto,
        link: "https://faimess.ir/#playlists",
        metaCol1Label: "کیوریتور",
        metaCol1Value: playlistCurator.trim(),
        metaCol2Label: "حال و هوا",
        metaCol2Value: playlistMood.trim(),
        metaCol3Label: "تعداد قطعات",
        metaCol3Value: `${playlistSelectedTrackIds.length || 10} ترک`,
      }).then(() => {
        setPublishLogs(getAuditLogs());
      });

      notify(lang === "fa" ? "پلی‌لیست ساخته شد و در کانال‌ها منتشر گردید" : "Playlist created & announced to channels", "primary");
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

      // Auto-publish to channels
      publishItemToChannels({
        type: "artist",
        title: artistName.trim(),
        subtitle: `${artistKind} • ${artistGenre.trim()}`,
        details: "پروفایل رسمی و دیسکوگرافی",
        photo: artistPhoto,
        link: "https://faimess.ir/#artists",
        metaCol1Label: "نوع فعالیت",
        metaCol1Value: artistKind,
        metaCol2Label: "سبک اصلی",
        metaCol2Value: artistGenre.trim(),
        metaCol3Label: "وضعیت",
        metaCol3Value: "تایید شده ✓",
      }).then(() => {
        setPublishLogs(getAuditLogs());
      });

      notify(lang === "fa" ? "هنرمند جدید اضافه و در کانال‌ها معرفی گردید" : "Artist added & announced to channels", "primary");
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

      if (newsStatus === "published") {
        // Auto-publish breaking news to channels
        publishItemToChannels({
          type: "news",
          title: newsTitle.trim(),
          subtitle: newsExcerpt.trim(),
          details: newsAuthor.trim(),
          tag: newsTag,
          photo: newsPhoto,
          link: "https://faimess.ir/#news",
          metaCol1Label: "دسته‌بندی",
          metaCol1Value: newsTag,
          metaCol2Label: "نویسنده",
          metaCol2Value: newsAuthor.trim(),
          metaCol3Label: "وضعیت",
          metaCol3Value: "منتشر شد ✓",
        }).then(() => {
          setPublishLogs(getAuditLogs());
        });
      }

      notify(
        newsStatus === "published"
          ? (lang === "fa" ? "مقاله خبری با موفقیت منتشر و در کانال‌ها اطلاع‌رسانی شد" : "Article published & shared to channels")
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

  const openCreateUser = (presetRole: AdminUserRole = "user") => {
    setEditingUsername(null);
    setUserUsername("");
    setUserDisplayName("");
    setUserRole(presetRole);
    setUserPerms(getDefaultPermissions(presetRole));
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
      refreshData();
    } else {
      notify(lang === "fa" ? "خطا در قالب فایل پشتیبان JSON" : "Invalid backup JSON format", "primary");
    }
  };

  const handleSaveAllSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    adminApi.updateSiteSettings(settingsDraft);
    notify(lang === "fa" ? "تنظیمات ۰ تا ۱۰۰ سایت با موفقیت ذخیره شد" : "All site settings updated", "primary");
  };

  const handleTestSms = async () => {
    setSmsTesting(true);
    setSmsTestMsg(null);
    const res = await testSmsGateway(testSmsPhone);
    setSmsTesting(false);
    setSmsTestMsg(res.message);
    notify(res.message, res.success ? "mint" : "primary");
  };

  const handleTestTg = async () => {
    setTgTesting(true);
    setTgTestMsg(null);
    const res = await publishToTelegram(
      "saturday_top_users",
      "🔔 پیام آزمایشی تست اتصال تلگرام به کانال رسمی پلتفرم استریم کی‌پاپ فیمس (@faimessofficial) با موفقیت برقرار شد.",
    );
    setTgTesting(false);
    setTgTestMsg(res.message);
    notify(res.message, res.success ? "mint" : "primary");
  };

  const handleTestBale = async () => {
    setBaleTesting(true);
    setBaleTestMsg(null);
    const res = await publishToBale(
      "saturday_top_users",
      "🔔 پیام آزمایشی تست اتصال بله به کانال رسمی پلتفرم استریم کی‌پاپ فیمس (@faimessofficial) با موفقیت برقرار شد.",
    );
    setBaleTesting(false);
    setBaleTestMsg(res.message);
    notify(res.message, res.success ? "mint" : "primary");
  };

  const handleOpenPublishPreview = async (cat: PublishCategory) => {
    setPreviewIsSquare(false);
    setPreviewItemPayload(null);
    setSelectedPublishCat(cat);
    const cap = generatePostCaption(cat);
    setPreviewCaption(cap);
    setPublishModalOpen(true);
    const img = await generateGraphicBanner(cat);
    setPreviewBannerImg(img);
  };

  const handleOpenItemPreview = async (item: PublishItemPayload) => {
    setPreviewIsSquare(true);
    setPreviewItemPayload(item);
    setSelectedPublishCat(null);
    const cap = generateItemCaption(item);
    setPreviewCaption(cap);
    setPublishModalOpen(true);
    const img = await generateItemSquareBanner(item);
    setPreviewBannerImg(img);
  };

  const handleExecuteItemPublish = async (item: PublishItemPayload) => {
    setPublishingCat(item.type);
    try {
      const res = await publishItemToChannels(item);
      setPublishLogs(getAuditLogs());
      if (res.imageBanner) {
        downloadDataUrl(res.imageBanner, `faimess-${item.type}-${Date.now()}.png`);
      }
      notify(
        lang === "fa"
          ? `پوستر ۱:۱ و پیام ${item.title} دانلود و در کانال‌های تلگرام و بله منتشر شد.`
          : "1:1 Poster and post published to Telegram & Bale channels.",
        "mint",
      );
    } finally {
      setPublishingCat(null);
    }
  };

  const handleDownloadItemBanner = async (item: PublishItemPayload) => {
    setPublishingCat(item.type);
    try {
      const img = await generateItemSquareBanner(item);
      if (img) {
        downloadDataUrl(img, `faimess-${item.type}-${Date.now()}.png`);
        notify(
          lang === "fa"
            ? "تصویر پوستر ۱:۱ مربع (1080x1080) با موفقیت دانلود شد."
            : "1:1 Square poster image downloaded.",
          "mint",
        );
      }
    } finally {
      setPublishingCat(null);
    }
  };

  const handleExecutePublish = async (cat: PublishCategory) => {
    setPublishingCat(cat);
    try {
      const res = await executeCategoryPublish(cat);
      setPublishLogs(getAuditLogs());
      if (res.imageBanner) {
        downloadDataUrl(res.imageBanner, `faimess-${cat}-${Date.now()}.png`);
      }
      notify(
        lang === "fa"
          ? "تصویر گرافیکی پوستر با موفقیت دانلود شد و در صف انتشار کانال‌ها قرار گرفت."
          : "Graphic banner image downloaded and queued for publication.",
        "mint",
      );
    } finally {
      setPublishingCat(null);
    }
  };

  const handleDownloadOnlyBanner = async (cat: PublishCategory) => {
    setPublishingCat(cat);
    try {
      const img = await generateGraphicBanner(cat);
      if (img) {
        downloadDataUrl(img, `faimess-${cat}-${Date.now()}.png`);
        notify(
          lang === "fa"
            ? "تصویر پوستر گرافیکی با کیفیت بالا (PNG) با موفقیت دانلود شد."
            : "High-resolution banner image downloaded.",
          "mint",
        );
      }
    } finally {
      setPublishingCat(null);
    }
  };

  const handleDownloadBackup = () => {
    if (typeof document === "undefined") return;
    try {
      const json = adminApi.exportDatabaseJson();
      const encoded = encodeURIComponent(json);
      const a = document.createElement("a");
      a.href = "data:application/json;charset=utf-8," + encoded;
      a.download = `faimess-db-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      notify(lang === "fa" ? "فایل پشتیبان کامل JSON دانلود شد" : "Backup exported", "primary");
    } catch {
      notify(lang === "fa" ? "خطا در خروجی دیتابیس" : "Failed to export", "primary");
    }
  };

  const handleApplyRestoreJson = () => {
    if (!importJsonInput.trim()) {
      notify(lang === "fa" ? "لطفاً محتوای JSON بک‌آپ را وارد کنید" : "Paste JSON first", "primary");
      return;
    }
    const ok = adminApi.importDatabaseJson(importJsonInput.trim());
    if (ok) {
      notify(lang === "fa" ? "پایگاه داده با موفقیت بازیابی شد" : "Database restored", "primary");
      setImportJsonInput("");
      refreshData();
    } else {
      notify(lang === "fa" ? "فرمت JSON وارد شده نامعتبر است" : "Invalid JSON", "primary");
    }
  };

  const handleFactoryReset = () => {
    const msg = lang === "fa"
      ? "آیا از بازنشانی کلیه داده‌ها به حالت اولیه کارخانه اطمینان دارید؟ تمامی اطلاعات به نسخه اولیه دمو بازمی‌گردد."
      : "Reset database to factory demo defaults?";
    if (typeof window !== "undefined" && window.confirm(msg)) {
      adminApi.resetDatabase();
      notify(lang === "fa" ? "پایگاه داده بازنشانی شد" : "Database reset", "primary");
      refreshData();
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
  const staffUsers = adminApi.getStaffUsers(searchQuery);
  const regularUsers = adminApi.getRegularUsers(searchQuery);
  const allComments = adminApi.getComments(commentFilter, searchQuery);
  const allContentRequests = adminApi.getContentRequests().filter((r) => {
    if (requestFilter !== "all" && r.status !== requestFilter) return false;
    if (requestTypeFilter !== "all" && r.type !== requestTypeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.artistName.toLowerCase().includes(q) ||
        r.requestedBy.toLowerCase().includes(q) ||
        r.requestedByDisplay.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4 lg:p-6 space-y-6">
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
                  onClick={() => openCreateUser("super_admin")}
                  className="flex flex-col items-center justify-center rounded-[16px] border border-line bg-subtle/50 p-3 text-center transition hover:border-primary-deep hover:bg-surface"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-subtle text-ink">
                    <Icon name="users" size={16} />
                  </div>
                  <span className="mt-2 font-bold text-[12px] text-ink">
                    {lang === "fa" ? "+ پرسنل / کاربر" : "+ Add Staff"}
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

      {/* ===================== TAB 7: ALL COMMENTS & REAL-TIME AUTO-REFRESH ===================== */}
      {activeTab === "comments" && (
        <div className="space-y-4">
          <div className="rounded-[22px] border border-line bg-surface p-5 shadow-sm">
            {/* Header with Real-Time Auto-Refresh Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-[16px] text-ink">
                    {lang === "fa" ? "فهرست تمامی دیدگاه‌ها و نظارت برخط" : "All Comments & Real-Time Moderation"}
                  </h3>
                  {autoRefreshComments ? (
                    <span className="flex items-center gap-1 rounded-full bg-teal-soft px-2.5 py-0.5 text-[12px] font-bold text-teal-deep">
                      <span className="h-2 w-2 rounded-full bg-teal-deep animate-ping" />
                      <span>{lang === "fa" ? `بروزرسانی خودکار (${refreshCountdown} ثانیه)` : `Auto-refresh in ${refreshCountdown}s`}</span>
                    </span>
                  ) : (
                    <span className="rounded-full bg-subtle px-2.5 py-0.5 text-[12px] font-bold text-ink-muted">
                      {lang === "fa" ? "بروزرسانی خودکار متوقف" : "Auto-refresh paused"}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {lang === "fa"
                    ? "دیدگاه‌های جدید دارای هایلایت هستند؛ پس از بررسی و تایید از هایلایت خارج می‌شوند."
                    : "New comments are highlighted until approved & reviewed."}
                </p>
              </div>

              {/* Action Buttons: Toggle Auto-Refresh, Refresh Now, Mark All Reviewed */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAutoRefreshComments((prev) => !prev)}
                  className={cn(
                    "rounded-xl border px-3 py-1.5 text-[12px] font-bold transition",
                    autoRefreshComments
                      ? "border-teal-deep/30 bg-teal-soft text-teal-deep hover:bg-teal-soft/80"
                      : "border-line bg-surface text-ink-muted hover:text-ink",
                  )}
                >
                  <Icon name="clock" size={13} className="inline me-1" />
                  <span>{autoRefreshComments ? (lang === "fa" ? "توقف ریفرش" : "Pause Auto-Sync") : (lang === "fa" ? "فعال‌سازی ریفرش خودکار" : "Start Auto-Sync")}</span>
                </button>

                <button
                  type="button"
                  onClick={handleManualRefreshComments}
                  className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-[12px] font-bold text-ink hover:bg-subtle"
                >
                  <Icon name="activity" size={13} />
                  <span>{lang === "fa" ? "ریفرش در لحظه" : "Refresh Now"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    adminApi.markAllCommentsReviewed();
                    notify(lang === "fa" ? "تمامی دیدگاه‌ها تایید و از هایلایت خارج شدند" : "All comments approved & unhighlighted", "primary");
                  }}
                  className="rounded-xl bg-primary-deep px-3.5 py-1.5 text-[12px] font-bold text-white shadow-sm hover:bg-primary-deep/90"
                >
                  <Icon name="check" size={13} className="inline me-1" />
                  <span>{lang === "fa" ? "تایید همه دیدگاه‌های جدید" : "Mark All Reviewed"}</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-line/60 pt-4">
              <div className="flex items-center gap-1.5 overflow-x-auto scroll-rail">
                <button
                  type="button"
                  onClick={() => setCommentFilter("all")}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-[12px] font-bold transition shrink-0",
                    commentFilter === "all" ? "bg-ink text-surface" : "bg-subtle text-ink-muted hover:text-ink",
                  )}
                >
                  {lang === "fa" ? "همه دیدگاه‌ها" : "All"} ({adminApi.getComments("all").length})
                </button>

                <button
                  type="button"
                  onClick={() => setCommentFilter("new")}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-[12px] font-bold transition shrink-0 flex items-center gap-1.5",
                    commentFilter === "new" ? "bg-primary-deep text-white" : "bg-primary-soft/60 text-primary-deep hover:bg-primary-soft",
                  )}
                >
                  <span>{lang === "fa" ? "جدید و هایلایت‌شده" : "New / Highlighted"}</span>
                  <span className="rounded-full bg-white/20 px-1.5 text-[12px]">
                    {adminApi.getComments("new").length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCommentFilter("reported")}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-[12px] font-bold transition shrink-0 flex items-center gap-1.5",
                    commentFilter === "reported" ? "bg-flame-deep text-white" : "bg-flame-soft text-flame-deep hover:bg-flame-soft/80",
                  )}
                >
                  <span>{lang === "fa" ? "صف گزارش‌ها" : "Reported Queue"}</span>
                  <span className="rounded-full bg-white/20 px-1.5 text-[12px]">
                    {stats.reportedComments}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCommentFilter("reviewed")}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-[12px] font-bold transition shrink-0",
                    commentFilter === "reviewed" ? "bg-ink text-surface" : "bg-subtle text-ink-muted hover:text-ink",
                  )}
                >
                  {lang === "fa" ? "تایید و بررسی‌شده" : "Reviewed"} ({adminApi.getComments("reviewed").length})
                </button>
              </div>

              <div className="relative min-w-0 max-w-xs flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === "fa" ? "جستجو در متن یا کاربر..." : "Search comments..."}
                  className="w-full rounded-[12px] border border-line bg-surface py-1.5 pe-3 ps-8 text-[12px] text-ink outline-none focus:border-primary-deep"
                />
                <div className="pointer-events-none absolute inset-y-0 start-2.5 flex items-center text-ink-faint">
                  <Icon name="search" size={13} />
                </div>
              </div>
            </div>

            {/* List of Comments with Distinct Highlighting for New Items */}
            <div className="mt-4 space-y-3">
              {allComments.map((cm) => {
                const isNewAndUnreviewed = cm.isNew && !cm.isReviewed;
                return (
                  <div
                    key={cm.id}
                    className={cn(
                      "rounded-[18px] p-4 transition-all duration-300",
                      isNewAndUnreviewed
                        ? "border-2 border-primary-deep/70 bg-gradient-to-r from-primary-soft/40 via-surface to-primary-soft/20 shadow-md ring-2 ring-primary-deep/20"
                        : "border border-line/80 bg-surface/70 hover:bg-surface",
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[13.5px] text-ink">{cm.author}</span>
                        <span className="font-mono text-[12px] text-ink-faint">{cm.handle}</span>
                        <span className="rounded bg-subtle px-2 py-0.5 text-[12px] text-ink-muted">
                          {cm.sourceType === "track" ? (lang === "fa" ? "در قطعه: " : "Track: ") : (lang === "fa" ? "در خبر: " : "Story: ")}
                          <span className="font-bold text-ink">{cm.targetTitle}</span>
                        </span>
                        <span className="text-[12px] text-ink-faint">· {cm.time}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isNewAndUnreviewed && (
                          <span className="flex items-center gap-1 rounded-full bg-primary-deep px-2.5 py-0.5 text-[12px] font-black text-white shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            <span>{lang === "fa" ? "دیدگاه تازه (نیازمند تایید)" : "New Comment"}</span>
                          </span>
                        )}

                        {cm.isReviewed && (
                          <span className="rounded-full bg-mint-soft px-2.5 py-0.5 text-[12px] font-bold text-teal-deep">
                            ✓ {lang === "fa" ? "تایید و بررسی شده" : "Reviewed"}
                          </span>
                        )}

                        {cm.status === "reported" && (
                          <span className="rounded-full bg-flame-soft px-2.5 py-0.5 text-[12px] font-black text-flame-deep">
                            {lang === "fa" ? `گزارش‌شده: ${cm.reportReason || "تخلف محتوا"}` : `Flagged: ${cm.reportReason}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="mt-2 text-[13px] text-ink leading-relaxed whitespace-pre-wrap">
                      {cm.text}
                    </p>

                    <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-line/50 pt-2.5">
                      <span className="text-[12px] text-ink-faint">
                        {cm.likes} {lang === "fa" ? "پسندیدن" : "likes"} · {cm.repliesCount} {lang === "fa" ? "پاسخ" : "replies"}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Approve / Mark Reviewed Action (Removes Highlight) */}
                        {isNewAndUnreviewed && (
                          <button
                            type="button"
                            onClick={() => {
                              adminApi.markCommentReviewed(cm.id);
                              notify(lang === "fa" ? "دیدگاه تایید و از حالت هایلایت خارج شد" : "Approved & unhighlighted", "primary");
                            }}
                            className="rounded-lg bg-teal-deep px-3 py-1 text-[12px] font-bold text-white shadow-sm hover:bg-teal-deep/90"
                          >
                            <Icon name="check" size={13} className="inline me-1" />
                            <span>{lang === "fa" ? "تایید و خروج از هایلایت" : "Approve & Unhighlight"}</span>
                          </button>
                        )}

                        {cm.status === "reported" && (
                          <button
                            type="button"
                            onClick={() => {
                              adminApi.approveComment(cm.id);
                              notify(lang === "fa" ? "گزارش رد شد و دیدگاه بازگردانده گردید" : "Flag dismissed", "primary");
                            }}
                            className="rounded-lg border border-line bg-surface px-3 py-1 text-[12px] font-bold text-ink hover:bg-subtle"
                          >
                            {lang === "fa" ? "رد گزارش (تایید دیدگاه)" : "Dismiss Flag"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(lang === "fa" ? "دیدگاه و تمام پاسخ‌های آن حذف شود؟" : "Delete comment and replies?")) {
                              adminApi.deleteComment(cm.id);
                              notify(lang === "fa" ? "دیدگاه با موفقیت حذف شد" : "Comment deleted", "primary");
                            }
                          }}
                          className="rounded-lg border border-flame-deep/20 bg-flame-soft px-2.5 py-1 text-[12px] font-bold text-flame-deep hover:bg-flame-soft/80"
                        >
                          <Icon name="close" size={13} className="inline me-0.5" />
                          <span>{lang === "fa" ? "حذف دیدگاه" : "Delete"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {allComments.length === 0 && (
                <div className="py-10 text-center text-ink-muted">
                  <Icon name="message" size={28} className="mx-auto text-ink-faint" />
                  <p className="mt-2 text-[13px] font-bold">
                    {lang === "fa" ? "هیچ دیدگاهی در این بخش یافت نشد" : "No comments found matching filter"}
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

          {/* Educational Notes Editor for Track Lyrics */}
          <div className="rounded-[22px] border border-line bg-surface p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-extrabold text-[15px] text-ink flex items-center gap-2">
                  <Icon name="sparkle" size={16} className="text-primary-deep" />
                  <span>{lang === "fa" ? "تدوین محتوای آموزشی زبان کره‌ای برای خطوط لیریک" : "Korean Language Learning Editor"}</span>
                </h3>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {lang === "fa"
                    ? "برای هر سطر از ترانه‌ها می‌توانید واژگان، گرامر، تلفظ و نکات فرهنگی تعریف کنید تا با کلیک کاربر روی خط لیریک نمایش داده شود (اختیاری است و به مرور تکمیل می‌شود)."
                    : "Add vocabulary, grammar rules & pronunciation notes for any lyric line. Displayed when users click that line."}
                </p>
              </div>
            </div>

            {/* Selector Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[12px] font-bold text-ink-muted mb-1">
                  {lang === "fa" ? "انتخاب آهنگ" : "Select Song"}
                </label>
                <select
                  value={eduTrackId}
                  onChange={(e) => setEduTrackId(e.target.value)}
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                >
                  {adminApi.getTracks().map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {tr.title} ({tr.artist})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-ink-muted mb-1">
                  {lang === "fa" ? "شماره خط لیریک (از ۰)" : "Line Index (0-based)"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={eduLineIndex}
                  onChange={(e) => setEduLineIndex(Number(e.target.value))}
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "تلفظ انگلیسی سطر (Romanization)" : "English Romanization"}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (eduKoreanLine.trim()) {
                        setEduRomanization(romanizeHangul(eduKoreanLine));
                      }
                    }}
                    className="text-[12px] font-extrabold text-primary-deep hover:underline"
                  >
                    {lang === "fa" ? "تولید خودکار تلفظ" : "Auto Romanize"}
                  </button>
                </div>
                <input
                  type="text"
                  value={eduRomanization}
                  onChange={(e) => setEduRomanization(e.target.value)}
                  placeholder="e.g. Binnaneun bamhaneul araeseo"
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className="block text-[12px] font-bold text-ink-muted mb-1">
                  {lang === "fa" ? "متن کره‌ای سطر (Korean Line)" : "Korean Line Text"}
                </label>
                <input
                  type="text"
                  value={eduKoreanLine}
                  onChange={(e) => {
                    setEduKoreanLine(e.target.value);
                    if (!eduRomanization || eduRomanization === romanizeHangul(eduKoreanLine)) {
                      setEduRomanization(romanizeHangul(e.target.value));
                    }
                  }}
                  placeholder="e.g. 빛나는 밤하늘 아래서"
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep font-bold"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className="block text-[12px] font-bold text-ink-muted mb-1">
                  {lang === "fa" ? "ترجمه فارسی سطر" : "Persian Translation"}
                </label>
                <input
                  type="text"
                  value={eduTranslationFa}
                  onChange={(e) => setEduTranslationFa(e.target.value)}
                  placeholder="e.g. زیر آسمان درخشان شب"
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                />
              </div>
            </div>

            {/* Word & Grammar Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 rounded-xl border border-line/70 bg-subtle/40 p-3">
              <div className="sm:col-span-2 md:col-span-4">
                <span className="text-[12px] font-extrabold text-primary-deep block">
                  {lang === "fa" ? "واژهٔ کلیدی این خط:" : "Key Word in Line:"}
                </span>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-ink-muted mb-1">کلمه کره‌ای (Hangul)</label>
                <input
                  type="text"
                  value={eduWordKorean}
                  onChange={(e) => {
                    setEduWordKorean(e.target.value);
                    if (!eduWordPronounceEn) {
                      setEduWordPronounceEn(romanizeHangul(e.target.value));
                    }
                  }}
                  placeholder="빛나다"
                  className="w-full rounded-xl border border-line bg-surface px-3 py-1.5 text-[12px] text-ink font-bold"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-ink-muted mb-1">تلفظ انگلیسی (English Phonetic)</label>
                <input
                  type="text"
                  value={eduWordPronounceEn}
                  onChange={(e) => setEduWordPronounceEn(e.target.value)}
                  placeholder="bit-na-da"
                  className="w-full rounded-xl border border-line bg-surface px-3 py-1.5 text-[12px] text-ink font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-ink-muted mb-1">تلفظ فارسی (اختیاری)</label>
                <input
                  type="text"
                  value={eduWordPronounce}
                  onChange={(e) => setEduWordPronounce(e.target.value)}
                  placeholder="بین‌نادا"
                  className="w-full rounded-xl border border-line bg-surface px-3 py-1.5 text-[12px] text-ink"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-ink-muted mb-1">معنی فارسی</label>
                <input
                  type="text"
                  value={eduWordMeaning}
                  onChange={(e) => setEduWordMeaning(e.target.value)}
                  placeholder="درخشیدن، تابیدن"
                  className="w-full rounded-xl border border-line bg-surface px-3 py-1.5 text-[12px] text-ink"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-line/70 bg-subtle/40 p-3">
              <div className="sm:col-span-2">
                <span className="text-[12px] font-extrabold text-primary-deep block">
                  {lang === "fa" ? "نکته گرامری این خط:" : "Grammar Point:"}
                </span>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-ink-muted mb-1">نام یا عنوان قاعده گرامری</label>
                <input
                  type="text"
                  value={eduGrammarRule}
                  onChange={(e) => setEduGrammarRule(e.target.value)}
                  placeholder="پسوند صفت‌ساز فاعلی ~는"
                  className="w-full rounded-xl border border-line bg-surface px-3 py-1.5 text-[12px] text-ink"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-ink-muted mb-1">توضیح قاعده گرامری</label>
                <input
                  type="text"
                  value={eduGrammarExpl}
                  onChange={(e) => setEduGrammarExpl(e.target.value)}
                  placeholder="به ریشه فعل حال اضافه شده و اسم بعدی را توصیف می‌کند."
                  className="w-full rounded-xl border border-line bg-surface px-3 py-1.5 text-[12px] text-ink"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-ink-muted mb-1">
                {lang === "fa" ? "نکته فرهنگی یا اصطلاح ویژه ترانه (اختیاری)" : "Cultural & Nuance Note"}
              </label>
              <textarea
                rows={2}
                value={eduNotes}
                onChange={(e) => setEduNotes(e.target.value)}
                placeholder="توضیحات مفهومی درباره استعاره‌ها و اصطلاحات روزمره کره‌ای..."
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep resize-none"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => {
                  if (!eduKoreanLine.trim()) {
                    notify(lang === "fa" ? "لطفاً متن کره‌ای سطر را وارد کنید" : "Enter Korean line", "primary");
                    return;
                  }
                  const finalRoman = eduRomanization.trim() || romanizeHangul(eduKoreanLine.trim());
                  const finalWordRom = eduWordPronounceEn.trim() || romanizeHangul(eduWordKorean.trim());
                  const noteItem: LyricEducation = {
                    id: `${eduTrackId}_${eduLineIndex}`,
                    trackId: eduTrackId,
                    lineIndex: eduLineIndex,
                    koreanLine: eduKoreanLine.trim(),
                    romanization: finalRoman,
                    translationFa: eduTranslationFa.trim(),
                    words: eduWordKorean.trim()
                      ? [
                          {
                            korean: eduWordKorean.trim(),
                            pronunciation: eduWordPronounce.trim() || finalWordRom,
                            pronunciationEn: finalWordRom,
                            meaning: eduWordMeaning.trim(),
                            partOfSpeech: "واژه",
                          },
                        ]
                      : [],
                    grammar: eduGrammarRule.trim()
                      ? [
                          {
                            rule: eduGrammarRule.trim(),
                            explanation: eduGrammarExpl.trim(),
                          },
                        ]
                      : [],
                    culturalNotes: eduNotes.trim() || undefined,
                  };

                  saveLyricEducationItem(noteItem);
                  setAllLyricEdus(loadAllLyricEducation());
                  notify(
                    lang === "fa"
                      ? `محتوای آموزشی خط ${eduLineIndex + 1} با تلفظ انگلیسی و واژگان ذخیره شد.`
                      : "Saved educational note with English pronunciation.",
                    "mint",
                  );
                }}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-[12px] font-bold text-white shadow-primary hover:bg-primary-deep transition"
              >
                <Icon name="check" size={14} strokeWidth={2.4} />
                <span>{lang === "fa" ? "ذخیره محتوای آموزشی این سطر" : "Save Lesson Note"}</span>
              </button>
            </div>

            {/* List of existing educational lines for current track */}
            {allLyricEdus[eduTrackId] && allLyricEdus[eduTrackId].length > 0 && (
              <div className="pt-4 border-t border-line/70">
                <h4 className="text-[13px] font-extrabold text-ink mb-2">
                  {lang === "fa" ? `خطوط آموزشی ثبت‌شده برای این آهنگ (${allLyricEdus[eduTrackId].length} سطر):` : `Saved Lyric Lines (${allLyricEdus[eduTrackId].length}):`}
                </h4>

                <div className="space-y-2">
                  {allLyricEdus[eduTrackId]
                    .sort((a, b) => a.lineIndex - b.lineIndex)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-line bg-subtle/30 p-3 hover:border-primary/40 transition"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-primary-soft px-2 py-0.5 text-[12px] font-black text-primary-deep">
                              {lang === "fa" ? `سطر ${item.lineIndex + 1}` : `Line ${item.lineIndex + 1}`}
                            </span>
                            <span className="font-bold text-[13px] text-ink truncate">
                              {item.koreanLine}
                            </span>
                          </div>

                          {item.romanization && (
                            <p className="font-mono text-[12px] font-bold text-primary-deep mt-0.5 truncate">
                              🗣️ {item.romanization}
                            </p>
                          )}
                          <p className="text-[12px] text-ink-muted truncate mt-0.5">
                            {item.translationFa}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEduLineIndex(item.lineIndex);
                              setEduKoreanLine(item.koreanLine);
                              setEduRomanization(item.romanization || "");
                              setEduTranslationFa(item.translationFa);
                              if (item.words[0]) {
                                setEduWordKorean(item.words[0].korean);
                                setEduWordPronounce(item.words[0].pronunciation || "");
                                setEduWordPronounceEn(item.words[0].pronunciationEn || "");
                                setEduWordMeaning(item.words[0].meaning);
                              }
                              if (item.grammar[0]) {
                                setEduGrammarRule(item.grammar[0].rule);
                                setEduGrammarExpl(item.grammar[0].explanation);
                              }
                              setEduNotes(item.culturalNotes || "");
                              notify(lang === "fa" ? `اطلاعات خط ${item.lineIndex + 1} در فرم بارگذاری شد.` : "Loaded line to form.", "primary");
                            }}
                            className="rounded-lg border border-line bg-surface px-2.5 py-1 text-[12px] font-bold text-ink hover:border-primary/40"
                          >
                            {lang === "fa" ? "ویرایش" : "Edit"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteLyricEducationItem(eduTrackId, item.lineIndex);
                              setAllLyricEdus(loadAllLyricEducation());
                              notify(lang === "fa" ? "سطر آموزشی با موفقیت حذف شد." : "Deleted lesson line.", "primary");
                            }}
                            className="rounded-lg border border-rose-500/30 bg-surface px-2.5 py-1 text-[12px] font-bold text-rose-600 hover:bg-rose-500/10"
                          >
                            {lang === "fa" ? "حذف" : "Delete"}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Educational Points Lock Settings */}
            <div className="mt-4 rounded-2xl border border-line/80 bg-subtle/50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">
                  <Icon name="lock" size={14} />
                </span>
                <div>
                  <h4 className="text-[13px] font-extrabold text-ink">
                    {lang === "fa" ? "تنظیمات قفل امتیازی آموزش لیریک" : "Lyric Education Access Rules"}
                  </h4>
                  <p className="text-[12px] text-ink-muted">
                    {lang === "fa" ? "تعیین تعداد خطوط رایگان و حد نصاب امتیاز هواداری برای بازگشایی خطوط بعدی" : "Configure free preview lines & fan points threshold"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "تعداد خطوط رایگان پیش‌نمایش" : "Free Preview Lines Count"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={eduSettings.freeLinesCount}
                    onChange={(e) => setEduSettings({ ...eduSettings, freeLinesCount: Math.max(1, Number(e.target.value)) })}
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                  />
                  <span className="text-[12px] text-ink-faint mt-0.5 block">
                    {lang === "fa" ? "مثلاً ۳ خط اول برای همه رایگان باشد" : "e.g. First 3 lines free"}
                  </span>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "امتیاز لازم برای بازگشایی خطوط پیشرفته" : "Required Fan Points to Unlock"}
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={eduSettings.requiredPoints}
                    onChange={(e) => setEduSettings({ ...eduSettings, requiredPoints: Math.max(10, Number(e.target.value)) })}
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                  />
                  <span className="text-[12px] text-ink-faint mt-0.5 block">
                    {lang === "fa" ? "کاربر با کسب این حد نصاب، آموزش را کامل می‌بیند" : "Points needed for lines after preview"}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    saveEducationSettings(eduSettings);
                    notify(lang === "fa" ? "تنظیمات قفل امتیازی آموزش ذخیره شد." : "Saved education settings.", "mint");
                  }}
                  className="rounded-xl bg-primary px-4 py-1.5 text-[12px] font-bold text-white shadow-primary hover:bg-primary-deep transition"
                >
                  {lang === "fa" ? "ذخیره تنظیمات قفل امتیازی" : "Save Lock Settings"}
                </button>
              </div>
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

      {/* ===================== TAB 10: 360° COMPREHENSIVE SITE CONFIGURATION ===================== */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* Executive Header of Settings */}
          <div className="flex flex-col gap-3 rounded-[22px] border border-line bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-mint" />
                <h2 className="font-black text-[18px] text-ink">
                  {lang === "fa" ? "تنظیمات جامع و پیکربندی ۰ تا ۱۰۰ پلتفرم" : "Platform Master Configuration (0 to 100)"}
                </h2>
              </div>
              <p className="mt-0.5 text-[12px] text-ink-muted">
                {lang === "fa"
                  ? "کنترل کامل بر برندینگ، لوگو، رنگ‌ها، سئو، متاتگ‌ها، متون سایت، ماژول‌ها و پایگاه داده"
                  : "Comprehensive control over branding, logos, colors, SEO, copywriting, features and backup"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSaveAllSettings()}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary-deep px-5 py-2.5 text-[12.5px] font-bold text-white shadow-primary transition hover:bg-primary-deep/90 active:scale-[0.98]"
            >
              <Icon name="check" size={15} strokeWidth={2.4} />
              <span>{lang === "fa" ? "ذخیره تمامی تنظیمات" : "Save All Settings"}</span>
            </button>
          </div>

          {/* Sub-tab Navigation Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scroll-rail">
            {[
              { id: "branding", labelFa: "هویت و برندینگ", labelEn: "Branding", icon: "sparkle" },
              { id: "colors", labelFa: "رنگ‌ها و تم", labelEn: "Colors & Theme", icon: "sun" },
              { id: "seo", labelFa: "سئو و متاتگ‌ها", labelEn: "SEO & Social", icon: "globe" },
              { id: "texts", labelFa: "متن‌های سایت", labelEn: "Copywriting", icon: "message" },
              { id: "modules", labelFa: "بخش‌ها و ماژول‌ها", labelEn: "Modules", icon: "grid" },
              { id: "integrations", labelFa: "کلیدها و توکن‌های API", labelEn: "API Keys & Integrations", icon: "lock" },
              { id: "social_automation", labelFa: "اتوماسیون انتشار در کانال‌ها", labelEn: "Channel Publishing", icon: "sparkle" },
              { id: "ads", labelFa: "تبلیغات آموزشگاه‌ها", labelEn: "Academy Ads", icon: "crown" },
              { id: "story_backgrounds", labelFa: "پس‌زمینه‌های استوری", labelEn: "Story Backgrounds", icon: "gallery" },
              { id: "database", labelFa: "پشتیبان‌گیری و دیتابیس", labelEn: "Database & Backup", icon: "folder" },
            ].map((sub) => {
              const isSubActive = settingsSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSettingsSubTab(sub.id as any)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12.5px] font-bold transition",
                    isSubActive
                      ? "bg-primary-deep text-white shadow-xs"
                      : "bg-surface border border-line text-ink-muted hover:bg-subtle hover:text-ink",
                  )}
                >
                  <Icon name={sub.icon as any} size={14} />
                  <span>{lang === "fa" ? sub.labelFa : sub.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* 1. BRANDING & IDENTITY */}
          {settingsSubTab === "branding" && (
            <div className="rounded-[22px] border border-line bg-surface p-5 shadow-sm space-y-5">
              <div className="border-b border-line pb-3">
                <h3 className="font-extrabold text-[16px] text-ink">
                  {lang === "fa" ? "هویت بصری، نام و نشانک‌های سایت" : "Brand Identity & Visuals"}
                </h3>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {lang === "fa"
                    ? "نام تجاری، شعار، لوگوی رسمی، عنوان در تب مرورگر و متن کپی‌رایت فوتر"
                    : "Site brand name, tagline, official logo, browser tab title and footer notice"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "نام رسمی سایت" : "Site Official Name"}
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.siteName}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, siteName: e.target.value })}
                    className="w-full rounded-xl border border-line bg-subtle/50 px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "شعار و زیرعنوان سایت" : "Site Subtitle & Tagline"}
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.siteSubtitle}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, siteSubtitle: e.target.value })}
                    className="w-full rounded-xl border border-line bg-subtle/50 px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "متن در تب مرورگر (Document Title)" : "Browser Tab Title"}
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.browserTitle}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, browserTitle: e.target.value })}
                    className="w-full rounded-xl border border-line bg-subtle/50 px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "آدرس لوگوی سایت" : "Site Logo Path / URL"}
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.siteLogo}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, siteLogo: e.target.value })}
                    className="w-full rounded-xl border border-line bg-subtle/50 px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "آدرس فاوآیکون و نشانک مرورگر" : "Favicon Path / URL"}
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.siteFavicon}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, siteFavicon: e.target.value })}
                    className="w-full rounded-xl border border-line bg-subtle/50 px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div className="sm:col-span-2">
                  <FeaturedImagePicker
                    value={settingsDraft.siteLogo}
                    onChange={(val) => setSettingsDraft({ ...settingsDraft, siteLogo: val })}
                    label={lang === "fa" ? "انتخاب لوگوی سایت از گالری دارایی‌های سیستم" : "Pick Site Logo from Gallery"}
                    defaultCategory="all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "متن حق کپی‌رایت پاورقی" : "Footer Copyright Text"}
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.footerText}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, footerText: e.target.value })}
                    className="w-full rounded-xl border border-line bg-subtle/50 px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveAllSettings()}
                  className="rounded-xl bg-primary-deep px-4 py-2 text-[12px] font-bold text-white hover:bg-primary-deep/90"
                >
                  {lang === "fa" ? "ذخیره هویت و برندینگ" : "Save Branding"}
                </button>
              </div>
            </div>
          )}

          {/* 2. COLORS & APPEARANCE */}
          {settingsSubTab === "colors" && (
            <div className="rounded-[22px] border border-line bg-surface p-5 shadow-sm space-y-5">
              <div className="border-b border-line pb-3">
                <h3 className="font-extrabold text-[16px] text-ink">
                  {lang === "fa" ? "رنگ‌های برند، تم پیش‌فرض و استایل" : "Brand Colors & Appearance"}
                </h3>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {lang === "fa"
                    ? "شخصی‌سازی پالت رنگ اصلی، رنگ ثانویه، حالت تم پیش‌فرض و اعمال استایل‌های اختصاصی"
                    : "Tune primary brand color, accent tone, default appearance theme and custom CSS"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Primary Color Picker */}
                <div className="rounded-xl border border-line bg-subtle/30 p-3.5 space-y-2">
                  <label className="block text-[12px] font-bold text-ink">
                    {lang === "fa" ? "رنگ اصلی برند (Primary Brand Color)" : "Primary Brand Color"}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settingsDraft.primaryColor}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, primaryColor: e.target.value })}
                      className="size-10 cursor-pointer rounded-lg border border-line bg-transparent p-0.5"
                    />
                    <input
                      type="text"
                      value={settingsDraft.primaryColor}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, primaryColor: e.target.value })}
                      className="flex-1 rounded-xl border border-line bg-surface px-3 py-1.5 font-mono text-[12.5px] text-ink outline-none uppercase"
                    />
                  </div>
                  {/* Presets */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {["#6b4fdd", "#8267f0", "#3b82f6", "#ec4899", "#10b981", "#f59e0b"].map((clr) => (
                      <button
                        key={clr}
                        type="button"
                        onClick={() => setSettingsDraft({ ...settingsDraft, primaryColor: clr })}
                        style={{ backgroundColor: clr }}
                        className="size-5 rounded-full ring-1 ring-black/10 transition hover:scale-110"
                        title={clr}
                      />
                    ))}
                  </div>
                </div>

                {/* Accent Color Picker */}
                <div className="rounded-xl border border-line bg-subtle/30 p-3.5 space-y-2">
                  <label className="block text-[12px] font-bold text-ink">
                    {lang === "fa" ? "رنگ ثانویه و تاکیدی (Accent Color)" : "Accent Tone Color"}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settingsDraft.accentColor}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, accentColor: e.target.value })}
                      className="size-10 cursor-pointer rounded-lg border border-line bg-transparent p-0.5"
                    />
                    <input
                      type="text"
                      value={settingsDraft.accentColor}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, accentColor: e.target.value })}
                      className="flex-1 rounded-xl border border-line bg-surface px-3 py-1.5 font-mono text-[12.5px] text-ink outline-none uppercase"
                    />
                  </div>
                  {/* Presets */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {["#8267f0", "#a78bfa", "#60a5fa", "#f472b6", "#34d399", "#fbbf24"].map((clr) => (
                      <button
                        key={clr}
                        type="button"
                        onClick={() => setSettingsDraft({ ...settingsDraft, accentColor: clr })}
                        style={{ backgroundColor: clr }}
                        className="size-5 rounded-full ring-1 ring-black/10 transition hover:scale-110"
                        title={clr}
                      />
                    ))}
                  </div>
                </div>

                {/* Default Theme Selector */}
                <div>
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "تم پیش‌فرض برای بازدیدکنندگان جدید" : "Default Theme for Visitors"}
                  </label>
                  <select
                    value={settingsDraft.defaultTheme}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, defaultTheme: e.target.value as any })}
                    className="w-full rounded-xl border border-line bg-subtle/50 px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  >
                    <option value="dark">{lang === "fa" ? "تم تاریک (Dark Mode)" : "Dark Mode"}</option>
                    <option value="light">{lang === "fa" ? "تم روشن (Light Mode)" : "Light Mode"}</option>
                    <option value="system">{lang === "fa" ? "هماهنگ با تنظیمات سیستم کاربر (System)" : "System Match"}</option>
                  </select>
                </div>

                {/* Glassmorphism Toggle */}
                <div className="flex items-center justify-between rounded-xl border border-line bg-subtle/30 p-3.5">
                  <div>
                    <span className="font-bold text-[13px] text-ink">
                      {lang === "fa" ? "جلوه شیشه‌ای بلور (Glassmorphism)" : "Glassmorphism Blur"}
                    </span>
                    <p className="text-[12px] text-ink-muted">
                      {lang === "fa" ? "فعال‌سازی افکت مات و شفاف در پشت کارت‌ها" : "Enable translucent blurred surfaces"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsDraft.glassMorphism}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, glassMorphism: e.target.checked })}
                    className="size-5 rounded accent-primary-deep cursor-pointer"
                  />
                </div>

                {/* Custom CSS */}
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "استایل‌های سفارشی CSS (تزریق مستقیم)" : "Custom CSS Overrides"}
                  </label>
                  <textarea
                    rows={4}
                    value={settingsDraft.customCss}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, customCss: e.target.value })}
                    placeholder="/* Custom CSS rules e.g. .brand-glow { ... } */"
                    className="w-full rounded-xl border border-line bg-subtle/50 p-3 font-mono text-[12px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveAllSettings()}
                  className="rounded-xl bg-primary-deep px-4 py-2 text-[12px] font-bold text-white hover:bg-primary-deep/90"
                >
                  {lang === "fa" ? "ذخیره رنگ‌ها و ظاهر" : "Save Colors"}
                </button>
              </div>
            </div>
          )}

          {/* 3. SEO & META TAGS */}
          {settingsSubTab === "seo" && (
            <div className="rounded-[22px] border border-line bg-surface p-5 shadow-sm space-y-5">
              <div className="border-b border-line pb-3">
                <h3 className="font-extrabold text-[16px] text-ink">
                  {lang === "fa" ? "سئو، متاتگ‌ها و پیش‌نمایش شبکه‌های اجتماعی" : "SEO & Social Sharing Meta Tags"}
                </h3>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {lang === "fa"
                    ? "بهینه‌سازی برای رتبه اول در گوگل، کلمات کلیدی، اشتراک‌گذاری در تلگرام/واتساپ و نمایه کانونیکال"
                    : "Tune Google snippets, keywords, OpenGraph previews and search indexing"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "عنوان متای سئو در گوگل (Meta Title)" : "SEO Meta Title"}
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.metaTitle}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, metaTitle: e.target.value })}
                    className="w-full rounded-xl border border-line bg-subtle/50 px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "توضیحات متای سئو (Meta Description)" : "SEO Meta Description"}
                  </label>
                  <textarea
                    rows={2}
                    value={settingsDraft.metaDescription}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, metaDescription: e.target.value })}
                    className="w-full rounded-xl border border-line bg-subtle/50 p-3 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "کلمات کلیدی سئو (Meta Keywords - جداشده با ویرگول)" : "SEO Keywords (comma separated)"}
                  </label>
                  <textarea
                    rows={2}
                    value={settingsDraft.metaKeywords}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, metaKeywords: e.target.value })}
                    className="w-full rounded-xl border border-line bg-subtle/50 p-3 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "آدرس کانونیکال سایت (Canonical URL)" : "Canonical URL"}
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.canonicalUrl}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, canonicalUrl: e.target.value })}
                    className="w-full rounded-xl border border-line bg-subtle/50 px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "شناسه Google Analytics" : "Google Analytics Measurement ID"}
                  </label>
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    value={settingsDraft.googleAnalyticsId}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, googleAnalyticsId: e.target.value })}
                    className="w-full rounded-xl border border-line bg-subtle/50 px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "هندل توییتر / شبکه‌های اجتماعی" : "Social Media / Twitter Handle"}
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.twitterHandle}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, twitterHandle: e.target.value })}
                    className="w-full rounded-xl border border-line bg-subtle/50 px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line bg-subtle/30 p-3.5">
                  <div>
                    <span className="font-bold text-[13px] text-ink">
                      {lang === "fa" ? "ایندکس موتورهای جستجو (Robots Index)" : "Search Engine Indexing"}
                    </span>
                    <p className="text-[12px] text-ink-muted">
                      {lang === "fa" ? "اجازه ثبت صفحات در گوگل و سایر موتورهای جستجو" : "Allow web crawlers to index"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsDraft.robotsIndexing}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, robotsIndexing: e.target.checked })}
                    className="size-5 rounded accent-primary-deep cursor-pointer"
                  />
                </div>

                <div className="sm:col-span-2">
                  <FeaturedImagePicker
                    value={settingsDraft.ogImage}
                    onChange={(val) => setSettingsDraft({ ...settingsDraft, ogImage: val })}
                    label={lang === "fa" ? "تصویر شاخص شبکه‌های اجتماعی (OpenGraph Image)" : "Social Preview Image"}
                    defaultCategory="news"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveAllSettings()}
                  className="rounded-xl bg-primary-deep px-4 py-2 text-[12px] font-bold text-white hover:bg-primary-deep/90"
                >
                  {lang === "fa" ? "ذخیره تنظیمات سئو" : "Save SEO Settings"}
                </button>
              </div>
            </div>
          )}

          {/* 4. SITE COPYWRITING (0 to 100 TEXTS) */}
          {settingsSubTab === "texts" && (
            <div className="rounded-[22px] border border-line bg-surface p-5 shadow-sm space-y-5">
              <div className="border-b border-line pb-3">
                <h3 className="font-extrabold text-[16px] text-ink">
                  {lang === "fa" ? "متن‌های ۰ تا ۱۰۰ بخش‌های مختلف سایت" : "Complete Site Copywriting"}
                </h3>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {lang === "fa"
                    ? "تغییر مستقیم متن عناوین بنر اصلی، شلف‌ها، پیام کلوپ هواداران و راه‌های پشتیبانی"
                    : "Directly customize all site headlines, banners, welcoming copy and support info"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "عنوان اصلی بنر صفحه نخست" : "Home Banner Main Title"}
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.heroTitle}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, heroTitle: e.target.value })}
                    className="w-full rounded-xl border border-line bg-subtle/50 px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "زیرعنوان بنر صفحه نخست" : "Home Banner Subtitle"}
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.heroSubtitle}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, heroSubtitle: e.target.value })}
                    className="w-full rounded-xl border border-line bg-subtle/50 px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "عنوان قفسه مرچ و محصولات" : "Merch Shelf Header Title"}
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.merchShelfTitle}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, merchShelfTitle: e.target.value })}
                    className="w-full rounded-xl border border-line bg-subtle/50 px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "ایمیل رسمی پشتیبانی پلتفرم" : "Official Support Email"}
                  </label>
                  <input
                    type="email"
                    value={settingsDraft.supportContactEmail}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, supportContactEmail: e.target.value })}
                    className="w-full rounded-xl border border-line bg-subtle/50 px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "پیام خوش‌آمدگویی هواداران در بخش حساب" : "Fan Club Welcome Banner Message"}
                  </label>
                  <textarea
                    rows={2}
                    value={settingsDraft.fanClubWelcomeMessage}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, fanClubWelcomeMessage: e.target.value })}
                    className="w-full rounded-xl border border-line bg-subtle/50 p-3 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "متن اعلان حالت تعمیرات و نگهداری" : "Maintenance Notice Message"}
                  </label>
                  <textarea
                    rows={2}
                    value={settingsDraft.maintenanceNotice}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, maintenanceNotice: e.target.value })}
                    className="w-full rounded-xl border border-line bg-subtle/50 p-3 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveAllSettings()}
                  className="rounded-xl bg-primary-deep px-4 py-2 text-[12px] font-bold text-white hover:bg-primary-deep/90"
                >
                  {lang === "fa" ? "ذخیره متن‌های سایت" : "Save Copywriting"}
                </button>
              </div>
            </div>
          )}

          {/* 5. MODULES & FEATURES */}
          {settingsSubTab === "modules" && (
            <div className="rounded-[22px] border border-line bg-surface p-5 shadow-sm space-y-5">
              <div className="border-b border-line pb-3">
                <h3 className="font-extrabold text-[16px] text-ink">
                  {lang === "fa" ? "ماژول‌ها و بخش‌های فعال پلتفرم" : "Platform Modules & Features"}
                </h3>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {lang === "fa"
                    ? "امکان فعال یا غیرفعال‌سازی سریع هر بخش از سایت بدون دستکاری در کد"
                    : "Toggle platform modules and public sections with one click"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {[
                  {
                    key: "showShop" as const,
                    titleFa: "بخش و منوی فروشگاه (Shop)",
                    descFa: "نمایش مسیر فروشگاه و کالاهای رسمی",
                  },
                  {
                    key: "showNews" as const,
                    titleFa: "بخش تحریریه اخبار (News)",
                    descFa: "نمایش شلف و مجله خبری موسیقی",
                  },
                  {
                    key: "showPlaylists" as const,
                    titleFa: "پلی‌لیست‌ها (Playlists)",
                    descFa: "نمایش پلی‌لیست‌های اختصاصی و منتخب",
                  },
                  {
                    key: "showArtists" as const,
                    titleFa: "هنرمندان و خوانندگان (Artists)",
                    descFa: "شلف آرتیست‌های پلتفرم فیمس",
                  },
                  {
                    key: "showAlbums" as const,
                    titleFa: "آلبوم‌ها (Fresh Albums)",
                    descFa: "شلف آلبوم‌های منتشر شده تازه",
                  },
                  {
                    key: "showLyricsSubmissions" as const,
                    titleFa: "ارسال لیریک توسط هواداران (Lyrics)",
                    descFa: "فرم مشارکت و ثبت لیریک در پلیر",
                  },
                  {
                    key: "showCommentsSection" as const,
                    titleFa: "دیدگاه‌ها و گفتگوها (Comments)",
                    descFa: "امکان ثبت نظر ذیل آهنگ‌ها و اخبار",
                  },
                  {
                    key: "showReferralSystem" as const,
                    titleFa: "سیستم دعوت و امتیاز رفرال (Referral)",
                    descFa: "اهدای امتیاز بابت دعوت دوستان",
                  },
                  {
                    key: "maintenanceMode" as const,
                    titleFa: "حالت تعمیرات و نگهداری (Maintenance Mode)",
                    descFa: "نمایش نوار اخطار ارتقای زیرساخت در سایت",
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between rounded-2xl border border-line bg-subtle/30 p-3.5 cursor-pointer transition hover:bg-subtle/60"
                  >
                    <div>
                      <span className="font-bold text-[13px] text-ink">{item.titleFa}</span>
                      <p className="text-[12px] text-ink-muted">{item.descFa}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(settingsDraft[item.key])}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, [item.key]: e.target.checked })}
                      className="size-5 rounded accent-primary-deep cursor-pointer"
                    />
                  </label>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveAllSettings()}
                  className="rounded-xl bg-primary-deep px-4 py-2 text-[12px] font-bold text-white hover:bg-primary-deep/90"
                >
                  {lang === "fa" ? "ذخیره وضعیت ماژول‌ها" : "Save Modules"}
                </button>
              </div>
            </div>
          )}

          {/* 6. API KEYS & GATEWAYS (NO .ENV REQUIRED) */}
          {settingsSubTab === "integrations" && (
            <div className="rounded-[22px] border border-line bg-surface p-5 shadow-sm space-y-6">
              <div className="border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                    <Icon name="lock" size={16} />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-[16px] text-ink">
                      {lang === "fa" ? "تنظیمات کلیدهای API و درگاه‌ها (بدون نیاز به فایل .env)" : "API Keys & Integrations"}
                    </h3>
                    <p className="mt-0.5 text-[12px] text-ink-muted">
                      {lang === "fa"
                        ? "کلیه کلیدها، توکن‌های ربات تلگرام، پیام‌رسان بله و درگاه پیامک را مستقیماً از این پنل وارد و مدیریت کنید."
                        : "Configure SMS, Telegram, and Bale Messenger bot tokens directly inside this panel without touching .env files"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 1: SMS Gateway */}
              <div className="rounded-2xl border border-line/80 bg-subtle/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-lg bg-teal-soft text-teal-deep">
                      <Icon name="message" size={14} />
                    </span>
                    <h4 className="font-bold text-[14px] text-ink">
                      {lang === "fa" ? "سامانه پیامک و OTP (ارسال کد تایید و اطلاعیه‌ها)" : "SMS Gateway & OTP Provider"}
                    </h4>
                  </div>
                  <span className="rounded-full bg-teal-soft/80 px-2.5 py-0.5 text-[12px] font-bold text-teal-deep">
                    {lang === "fa" ? "آماده ارسال" : "Active"}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[12px] font-bold text-ink-muted mb-1">
                      {lang === "fa" ? "ارائه‌دهنده وب‌سرویس پیامک" : "SMS Provider"}
                    </label>
                    <select
                      value={settingsDraft.smsProvider}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, smsProvider: e.target.value as any })}
                      className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:border-primary-deep focus:outline-none"
                    >
                      <option value="kavenegar">کاوه نگار (Kavenegar)</option>
                      <option value="ghasedak">قاصدک (Ghasedak)</option>
                      <option value="farazsms">فراز اس‌ام‌اس (FarazSMS)</option>
                      <option value="custom">وب‌سرویس سفارشی (Custom API)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-ink-muted mb-1">
                      {lang === "fa" ? "شماره خط اختصاصی پیامک" : "Sender Number"}
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.smsSenderNumber}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, smsSenderNumber: e.target.value })}
                      placeholder="10008000"
                      className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:border-primary-deep focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[12px] font-bold text-ink-muted">
                      {lang === "fa" ? "کلید API پنل پیامک (API Key / Token)" : "SMS API Key / Token"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSmsKey(!showSmsKey)}
                      className="text-[12px] font-bold text-primary-deep hover:underline"
                    >
                      {showSmsKey ? (lang === "fa" ? "مخفی کردن" : "Hide") : (lang === "fa" ? "نمایش کلید" : "Show")}
                    </button>
                  </div>
                  <input
                    type={showSmsKey ? "text" : "password"}
                    value={settingsDraft.smsApiKey}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, smsApiKey: e.target.value })}
                    placeholder="e.g. 4B5A6C7D8E9F..."
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-ink font-mono focus:border-primary-deep focus:outline-none"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[12px] font-bold text-ink-muted mb-1">
                      {lang === "fa" ? "کد الگوی پیامک (Pattern / Template Code)" : "OTP Template Pattern Code"}
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.smsOtpPattern}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, smsOtpPattern: e.target.value })}
                      placeholder="faimess-otp"
                      className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:border-primary-deep focus:outline-none"
                    />
                  </div>

                  {/* SMS Test Section */}
                  <div>
                    <label className="block text-[12px] font-bold text-ink-muted mb-1">
                      {lang === "fa" ? "تست ارسال پیامک به شماره" : "Test Phone Number"}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={testSmsPhone}
                        onChange={(e) => setTestSmsPhone(e.target.value)}
                        placeholder="09120000000"
                        className="flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:border-primary-deep focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleTestSms}
                        disabled={smsTesting}
                        className="flex items-center gap-1.5 rounded-xl bg-teal-deep px-3 py-2 text-[12px] font-bold text-white shadow-2xs hover:bg-teal-deep/90 disabled:opacity-50 shrink-0"
                      >
                        <Icon name="send" size={13} />
                        <span>{smsTesting ? (lang === "fa" ? "ارسال..." : "Sending...") : (lang === "fa" ? "تست ارسال" : "Test")}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {smsTestMsg && (
                  <p className="rounded-xl bg-teal-soft/60 p-2.5 text-[12px] font-semibold text-teal-deep">
                    {smsTestMsg}
                  </p>
                )}
              </div>

              {/* Section 2: Telegram Bot Integration */}
              <div className="rounded-2xl border border-line/80 bg-subtle/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-lg bg-sky-soft text-sky-deep">
                      <Icon name="send" size={14} />
                    </span>
                    <h4 className="font-bold text-[14px] text-ink">
                      {lang === "fa" ? "ربات تلگرام (Telegram Bot API)" : "Telegram Bot Integration"}
                    </h4>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[12px] font-bold text-ink-muted">
                      {lang === "fa" ? "ارسال خودکار به کانال" : "Auto Broadcast"}
                    </span>
                    <input
                      type="checkbox"
                      checked={settingsDraft.telegramAutoPublish}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, telegramAutoPublish: e.target.checked })}
                      className="size-4.5 rounded accent-primary-deep cursor-pointer"
                    />
                  </label>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[12px] font-bold text-ink-muted">
                      {lang === "fa" ? "توکن ربات تلگرام (Bot Token)" : "Telegram Bot Token"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowTgToken(!showTgToken)}
                      className="text-[12px] font-bold text-primary-deep hover:underline"
                    >
                      {showTgToken ? (lang === "fa" ? "مخفی کردن" : "Hide") : (lang === "fa" ? "نمایش توکن" : "Show")}
                    </button>
                  </div>
                  <input
                    type={showTgToken ? "text" : "password"}
                    value={settingsDraft.telegramBotToken}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, telegramBotToken: e.target.value })}
                    placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ..."
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-ink font-mono focus:border-primary-deep focus:outline-none"
                  />
                  <p className="mt-1 text-[12px] text-ink-muted">
                    {lang === "fa"
                      ? "توکن دریافتی از BotFather تلگرام را در این فیلد قرار دهید."
                      : "Obtain token from @BotFather on Telegram."}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[12px] font-bold text-ink-muted mb-1">
                      {lang === "fa" ? "شناسه کانال تلگرام (Username یا Chat ID)" : "Telegram Channel ID"}
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.telegramChannelId}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, telegramChannelId: e.target.value })}
                      placeholder="@faimessofficial"
                      className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:border-primary-deep focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-ink-muted mb-1">
                      {lang === "fa" ? "شناسه چت مدیر (جهت دریافت لاگ)" : "Admin Chat ID"}
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.telegramAdminChatId}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, telegramAdminChatId: e.target.value })}
                      placeholder="e.g. 987654321"
                      className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:border-primary-deep focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[12px] text-ink-muted">
                    {lang === "fa" ? "اطمینان حاصل کنید ربات در کانال به عنوان Administrator اضافه شده باشد." : "Ensure bot is added as Administrator in the channel."}
                  </p>
                  <button
                    type="button"
                    onClick={handleTestTg}
                    disabled={tgTesting}
                    className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-1.5 text-[12px] font-bold text-white shadow-2xs hover:bg-sky-700 disabled:opacity-50"
                  >
                    <Icon name="send" size={13} />
                    <span>{tgTesting ? (lang === "fa" ? "تست ارتباط..." : "Testing...") : (lang === "fa" ? "تست ارسال به کانال تلگرام" : "Test Telegram")}</span>
                  </button>
                </div>

                {tgTestMsg && (
                  <p className="rounded-xl bg-sky-soft/60 p-2.5 text-[12px] font-semibold text-sky-deep">
                    {tgTestMsg}
                  </p>
                )}
              </div>

              {/* Section 3: Bale Messenger Bot Integration */}
              <div className="rounded-2xl border border-line/80 bg-subtle/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-lg bg-emerald-soft text-emerald-deep">
                      <Icon name="message" size={14} />
                    </span>
                    <h4 className="font-bold text-[14px] text-ink">
                      {lang === "fa" ? "پیام‌رسان بله (Bale Messenger Bot API)" : "Bale Messenger Bot Integration"}
                    </h4>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[12px] font-bold text-ink-muted">
                      {lang === "fa" ? "ارسال خودکار به کانال بله" : "Auto Broadcast"}
                    </span>
                    <input
                      type="checkbox"
                      checked={settingsDraft.baleAutoPublish}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, baleAutoPublish: e.target.checked })}
                      className="size-4.5 rounded accent-primary-deep cursor-pointer"
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[12px] font-bold text-ink-muted">
                        {lang === "fa" ? "توکن ربات بله (Bale Bot Token)" : "Bale Bot Token"}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowBaleToken(!showBaleToken)}
                        className="text-[12px] font-bold text-primary-deep hover:underline"
                      >
                        {showBaleToken ? (lang === "fa" ? "مخفی" : "Hide") : (lang === "fa" ? "نمایش" : "Show")}
                      </button>
                    </div>
                    <input
                      type={showBaleToken ? "text" : "password"}
                      value={settingsDraft.baleBotToken}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, baleBotToken: e.target.value })}
                      placeholder="bot_token_from_bale..."
                      className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-ink font-mono focus:border-primary-deep focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-ink-muted mb-1">
                      {lang === "fa" ? "شناسه کانال در بله" : "Bale Channel ID"}
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.baleChannelId}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, baleChannelId: e.target.value })}
                      placeholder="@faimessofficial"
                      className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-ink font-mono focus:border-primary-deep focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[12px] text-ink-muted">
                    {lang === "fa" ? "ربات بله را در کانال اضافه و دسترسی پیام‌رسانی اعطا نمایید." : "Add the Bale bot to your channel with admin rights."}
                  </p>
                  <button
                    type="button"
                    onClick={handleTestBale}
                    disabled={baleTesting}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-[12px] font-bold text-white shadow-2xs hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Icon name="send" size={13} />
                    <span>{baleTesting ? (lang === "fa" ? "تست بله..." : "Testing...") : (lang === "fa" ? "تست ارسال به کانال بله" : "Test Bale")}</span>
                  </button>
                </div>

                {baleTestMsg && (
                  <p className="rounded-xl bg-emerald-soft/60 p-2.5 text-[12px] font-semibold text-emerald-deep">
                    {baleTestMsg}
                  </p>
                )}
              </div>

              {/* Save Bar */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveAllSettings()}
                  className="flex items-center gap-2 rounded-xl bg-primary-deep px-5 py-2.5 text-[12.5px] font-bold text-white shadow-primary hover:bg-primary-deep/90"
                >
                  <Icon name="check" size={15} />
                  <span>{lang === "fa" ? "ذخیره تمامی کلیدها و تنظیمات API" : "Save API Settings"}</span>
                </button>
              </div>
            </div>
          )}

          {/* 7. SOCIAL CHANNELS PUBLISHING AUTOMATION */}
          {settingsSubTab === "social_automation" && (
            <div className="rounded-[22px] border border-line bg-surface p-5 shadow-sm space-y-6">
              <div className="border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                    <Icon name="sparkle" size={16} />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-[16px] text-ink">
                      {lang === "fa" ? "اتوماسیون انتشار در شبکه‌ها و کانال‌ها (تلگرام و بله)" : "Channel Publishing Automation"}
                    </h3>
                    <p className="mt-0.5 text-[12px] text-ink-muted">
                      {lang === "fa"
                        ? "تولید خودکار تصویر گرافیکی با رزولوشن بالا و انتشار هفتگی در کانال‌های تلگرام و پیام‌رسان بله"
                        : "Automated graphic banner generation and weekly scheduled publishing to Telegram & Bale channels"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Schedule explanation banner */}
              <div className="rounded-2xl border border-primary/20 bg-primary-faint/60 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="calendar" size={16} className="text-primary-deep" />
                  <span className="font-black text-[13px] text-primary-deep">
                    {lang === "fa" ? "تقویم زمان‌بندی خودکار انتشار هفتگی" : "Weekly Automatic Schedule"}
                  </span>
                </div>
                <div className="grid gap-2 text-[12px] sm:grid-cols-2 text-ink-body">
                  <div className="flex items-center gap-2 rounded-lg bg-surface/70 px-3 py-1.5 border border-line/60">
                    <span className="font-black text-primary-deep shrink-0">شنبه‌ها:</span>
                    <span>پنج کاربر برتر هفته (Top 5 Leaderboard)</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-surface/70 px-3 py-1.5 border border-line/60">
                    <span className="font-black text-primary-deep shrink-0">یکشنبه‌ها:</span>
                    <span>پرکامنت‌ترین کاربران سایت (Top Commenters)</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-surface/70 px-3 py-1.5 border border-line/60">
                    <span className="font-black text-primary-deep shrink-0">دوشنبه‌ها:</span>
                    <span>پرشنیده‌شده‌ترین آهنگ‌های هفته (Top Played Tracks)</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-surface/70 px-3 py-1.5 border border-line/60">
                    <span className="font-black text-primary-deep shrink-0">سه‌شنبه‌ها:</span>
                    <span>پرفالوترین آرتیست‌های پلتفرم (Most Followed Artists)</span>
                  </div>
                </div>
              </div>

              {/* The 4 Event Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    id: "saturday_top_users" as PublishCategory,
                    day: "شنبه‌ها",
                    dayEn: "Saturday",
                    title: "۵ کاربر اول هفته",
                    desc: "پنج کاربر با بالاترین امتیاز هواداری به همراه نشان‌ها و آمار تعاملات",
                    toggleKey: "autoPublishSaturdayUsers" as const,
                    color: "border-amber-400/40 bg-amber-500/5",
                    iconColor: "text-amber-500 bg-amber-500/15",
                  },
                  {
                    id: "sunday_top_comments" as PublishCategory,
                    day: "یکشنبه‌ها",
                    dayEn: "Sunday",
                    title: "پرکامنت‌ترین کاربران",
                    desc: "کاربران با بیشترین دیدگاه روی قطعات موسیقی و مشارکت در نقد و بررسی‌ها",
                    toggleKey: "autoPublishSundayComments" as const,
                    color: "border-sky-400/40 bg-sky-500/5",
                    iconColor: "text-sky-500 bg-sky-500/15",
                  },
                  {
                    id: "monday_top_tracks" as PublishCategory,
                    day: "دوشنبه‌ها",
                    dayEn: "Monday",
                    title: "پرشنیده‌شده‌ترین آهنگ‌ها",
                    desc: "آهنگ‌های صدرنشین با بالاترین تعداد پخش در پلتفرم و لایک کاربران",
                    toggleKey: "autoPublishMondayTracks" as const,
                    color: "border-flame-400/40 bg-flame-500/5",
                    iconColor: "text-flame bg-flame-soft",
                  },
                  {
                    id: "tuesday_top_artists" as PublishCategory,
                    day: "سه‌شنبه‌ها",
                    dayEn: "Tuesday",
                    title: "پرفالوترین آرتیست‌ها",
                    desc: "هنرمندان پلتفرم با بالاترین آمار هواداران فعال و دنبال‌کنندگان",
                    toggleKey: "autoPublishTuesdayArtists" as const,
                    color: "border-primary-400/40 bg-primary-500/5",
                    iconColor: "text-primary-deep bg-primary-soft",
                  },
                ].map((ev) => {
                  const items = getCategoryItems(ev.id);
                  const isPublishing = publishingCat === ev.id;
                  const isEnabled = Boolean(settingsDraft[ev.toggleKey]);

                  return (
                    <div
                      key={ev.id}
                      className={cn(
                        "rounded-2xl border p-4 flex flex-col justify-between gap-3 transition-shadow hover:shadow-sm",
                        ev.color,
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-line/60">
                          <div className="flex items-center gap-2">
                            <span className={cn("flex size-7 items-center justify-center rounded-xl font-black text-[12px]", ev.iconColor)}>
                              {ev.day.slice(0, 1)}
                            </span>
                            <div>
                              <span className="font-extrabold text-[14px] text-ink">{ev.title}</span>
                              <span className="block text-[12px] font-bold text-ink-muted">
                                {lang === "fa" ? ev.day : ev.dayEn}
                              </span>
                            </div>
                          </div>

                          <label className="flex items-center gap-1.5 cursor-pointer" title="فعال/غیرفعال کردن انتشار خودکار">
                            <span className="text-[12px] text-ink-muted font-bold">
                              {isEnabled ? (lang === "fa" ? "خودکار: فعال" : "Auto: On") : (lang === "fa" ? "خودکار: غیرفعال" : "Auto: Off")}
                            </span>
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={(e) => setSettingsDraft({ ...settingsDraft, [ev.toggleKey]: e.target.checked })}
                              className="size-4.5 rounded accent-primary-deep cursor-pointer"
                            />
                          </label>
                        </div>

                        <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
                          {ev.desc}
                        </p>

                        {/* Top 3 Live Preview Items */}
                        <div className="mt-3 space-y-1.5 rounded-xl bg-surface/80 p-2.5 border border-line/70">
                          <span className="block text-[12px] font-black text-ink-muted">
                            {lang === "fa" ? "پیش‌نمایش ۵ رتبه اول هم‌اکنون:" : "Current Top 5 Preview:"}
                          </span>
                          {items.slice(0, 3).map((it) => (
                            <div key={it.rank} className="flex items-center justify-between text-[12px]">
                              <span className="flex items-center gap-1.5 truncate">
                                <span className="font-black text-primary-deep">#{it.rank}</span>
                                <span className="font-bold text-ink truncate">{it.title}</span>
                              </span>
                              <span className="text-ink-muted font-mono">{it.metricValue}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons: Download Graphic PNG, Preview Graphic & Publish Now */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line/50">
                        <button
                          type="button"
                          onClick={() => handleDownloadOnlyBanner(ev.id)}
                          disabled={isPublishing}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-[12px] font-bold text-ink hover:border-primary/40 hover:bg-subtle transition shadow-2xs"
                          title="دانلود مستقیم تصویر بنر گرافیکی با رزولوشن بالا"
                        >
                          <Icon name="download" size={13} />
                          <span>{lang === "fa" ? "دانلود تصویر بنر" : "Download PNG"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenPublishPreview(ev.id)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-[12px] font-bold text-ink hover:bg-subtle transition shadow-2xs"
                        >
                          <Icon name="sparkle" size={13} />
                          <span>{lang === "fa" ? "پیش‌نمایش" : "Preview"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExecutePublish(ev.id)}
                          disabled={isPublishing}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary-deep px-3 py-2 text-[12px] font-bold text-white shadow-xs hover:bg-primary-deep/90 disabled:opacity-50 transition"
                          title="دانلود خودکار بنر و ارسال به کانال‌های تلگرام و بله"
                        >
                          <Icon name="send" size={13} />
                          <span>{isPublishing ? (lang === "fa" ? "در حال ارسال..." : "Publishing...") : (lang === "fa" ? "انتشار و دانلود بنر" : "Publish & Download")}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 1:1 Content Releases (Track, Album, Artist, Playlist, News) */}
              <div className="rounded-[22px] border border-line bg-surface p-5 shadow-sm space-y-5">
                <div className="border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                      <Icon name="sparkle" size={15} />
                    </span>
                    <div>
                      <h3 className="font-extrabold text-[15px] text-ink">
                        {lang === "fa" ? "انتشار خودکار و دستی محتوای جدید در کانال‌ها (پوستر ۱:۱ مربع)" : "New Content Auto-Publishing (1:1 Square Posters)"}
                      </h3>
                      <p className="mt-0.5 text-[12px] text-ink-muted">
                        {lang === "fa"
                          ? "انتشار خودکار آهنگ جدید، آلبوم، آرتیست، پلی‌لیست و اخبار با پوستر مینیمال بنفش و سفید (1080x1080) به همراه خلاصه، تایتل و لینک اختصاصی سایت"
                          : "Automatic broadcast for new tracks, albums, artists, playlists, and breaking news with 1:1 square posters"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
                  {Object.entries(SAMPLE_RELEASE_ITEMS).map(([key, item]) => {
                    const isPublishing = publishingCat === key;
                    const typeIcons: Record<string, any> = {
                      track: "music",
                      album: "disc",
                      artist: "users",
                      playlist: "list",
                      news: "news",
                    };
                    const typeLabels: Record<string, string> = {
                      track: "آهنگ جدید",
                      album: "آلبوم رسمی",
                      artist: "آرتیست جدید",
                      playlist: "پلی‌لیست منتخب",
                      news: "خبر و رویداد",
                    };

                    return (
                      <div key={key} className="rounded-2xl border border-line bg-subtle/30 p-4 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="flex size-8 items-center justify-center rounded-xl bg-primary-soft text-primary-deep font-bold">
                              <Icon name={typeIcons[key] || "sparkle"} size={16} />
                            </span>
                            <div>
                              <span className="inline-block rounded-md bg-primary-soft px-2 py-0.5 text-[12px] font-bold text-primary-deep">
                                {typeLabels[key]}
                              </span>
                              <h4 className="font-bold text-[14px] text-ink mt-0.5">{item.title}</h4>
                            </div>
                          </div>
                          <span className="text-[12px] font-bold text-ink-muted">{item.tag || "1:1 مربع"}</span>
                        </div>

                        <p className="text-[12px] text-ink-muted leading-relaxed line-clamp-2">
                          {item.subtitle}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line/50">
                          <button
                            type="button"
                            onClick={() => handleDownloadItemBanner(item)}
                            disabled={isPublishing}
                            className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-[12px] font-bold text-ink hover:border-primary/40 hover:bg-subtle transition shadow-2xs"
                            title="دانلود مستقیم پوستر مربع ۱:۱ با رزولوشن بالا"
                          >
                            <Icon name="download" size={13} />
                            <span>{lang === "fa" ? "دانلود پوستر ۱:۱" : "Download 1:1"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenItemPreview(item)}
                            className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-[12px] font-bold text-ink hover:bg-subtle transition shadow-2xs"
                          >
                            <Icon name="sparkle" size={13} />
                            <span>{lang === "fa" ? "پیش‌نمایش" : "Preview"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExecuteItemPublish(item)}
                            disabled={isPublishing}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary-deep px-3 py-2 text-[12px] font-bold text-white shadow-xs hover:bg-primary-deep/90 disabled:opacity-50 transition"
                            title="دانلود خودکار پوستر ۱:۱ و ارسال به کانال‌های تلگرام و بله"
                          >
                            <Icon name="send" size={13} />
                            <span>{isPublishing ? (lang === "fa" ? "در حال ارسال..." : "Publishing...") : (lang === "fa" ? "انتشار و دانلود ۱:۱" : "Publish & Download")}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Publication Audit Log Table */}
              <div className="rounded-2xl border border-line bg-subtle/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="clock" size={15} className="text-ink-muted" />
                    <h4 className="font-bold text-[13px] text-ink">
                      {lang === "fa" ? "گزارش و تاریخچه آخرین انتشارهای انجام‌شده" : "Publication Audit Log"}
                    </h4>
                  </div>
                  <span className="text-[12px] text-ink-muted">
                    {lang === "fa" ? `${publishLogs.length} رکورد ثبت شده` : `${publishLogs.length} logs recorded`}
                  </span>
                </div>

                {publishLogs.length === 0 ? (
                  <p className="py-6 text-center text-[12.5px] text-ink-muted">
                    {lang === "fa" ? "هنوز هیچ انتشاری ثبت نشده است. با دکمه‌های بالا اولین انتشار تست را ارسال نمایید." : "No publication logs recorded yet."}
                  </p>
                ) : (
                  <div className="overflow-x-auto scroll-rail">
                    <table className="w-full text-start text-[12px]">
                      <thead>
                        <tr className="border-b border-line text-ink-muted font-bold">
                          <th className="pb-2 text-start">موضوع انتشار</th>
                          <th className="pb-2 text-start">تاریخ و زمان</th>
                          <th className="pb-2 text-center">تلگرام</th>
                          <th className="pb-2 text-center">بله</th>
                          <th className="pb-2 text-start">خلاصه گزارش</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line/60">
                        {publishLogs.slice(0, 10).map((log) => (
                          <tr key={log.id} className="text-ink-body">
                            <td className="py-2.5 font-bold text-ink">{log.categoryLabel}</td>
                            <td className="py-2.5 text-ink-muted font-mono">{log.timestamp}</td>
                            <td className="py-2.5 text-center">
                              <span className={cn(
                                "rounded-full px-2 py-0.5 text-[12px] font-bold",
                                log.telegramStatus === "sent" ? "bg-emerald-soft text-emerald-deep" : "bg-rose-soft text-rose-deep",
                              )}>
                                {log.telegramStatus === "sent" ? "ارسال شد" : "ناموفق"}
                              </span>
                            </td>
                            <td className="py-2.5 text-center">
                              <span className={cn(
                                "rounded-full px-2 py-0.5 text-[12px] font-bold",
                                log.baleStatus === "sent" ? "bg-emerald-soft text-emerald-deep" : "bg-rose-soft text-rose-deep",
                              )}>
                                {log.baleStatus === "sent" ? "ارسال شد" : "ناموفق"}
                              </span>
                            </td>
                            <td className="py-2.5 text-ink-muted truncate max-w-xs">{log.summary}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 8. KOREAN LANGUAGE ACADEMY ADVERTISEMENT SETTINGS */}
          {settingsSubTab === "ads" && (
            <div className="rounded-[22px] border border-line bg-surface p-5 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-3">
                <div>
                  <h3 className="font-extrabold text-[16px] text-ink">
                    {lang === "fa" ? "تنظیمات بنر تبلیغاتی آموزشگاه‌های زبان کره‌ای" : "Korean Language Academy Ad Settings"}
                  </h3>
                  <p className="mt-0.5 text-[12px] text-ink-muted">
                    {lang === "fa"
                      ? "مدیریت نمایش تبلیغ و کدهای تخفیف در زیر پنجرهٔ آموزش زبان کره‌ای لیریک ترانه‌ها"
                      : "Configure promotional card & discount code displayed under the lyric learning modal"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={academyAd.enabled}
                      onChange={(e) => setAcademyAd({ ...academyAd, enabled: e.target.checked })}
                      className="size-4 rounded accent-primary-deep cursor-pointer"
                    />
                    <span className="text-[12.5px] font-bold text-ink">
                      {academyAd.enabled ? (lang === "fa" ? "تبلیغات فعال است" : "Ad Enabled") : (lang === "fa" ? "تبلیغات غیرفعال" : "Ad Disabled")}
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "نام آموزشگاه / موسسه همکار" : "Academy Name"}
                  </label>
                  <input
                    type="text"
                    value={academyAd.academyName}
                    onChange={(e) => setAcademyAd({ ...academyAd, academyName: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "متن برچسب بالای کارت" : "Badge Text"}
                  </label>
                  <input
                    type="text"
                    value={academyAd.badgeText}
                    onChange={(e) => setAcademyAd({ ...academyAd, badgeText: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "عنوان اصلی تبلیغ دوره" : "Ad Headline"}
                  </label>
                  <input
                    type="text"
                    value={academyAd.title}
                    onChange={(e) => setAcademyAd({ ...academyAd, title: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "توضیحات تکمیلی دوره" : "Description"}
                  </label>
                  <textarea
                    rows={2}
                    value={academyAd.description}
                    onChange={(e) => setAcademyAd({ ...academyAd, description: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "کد تخفیف اختصاصی فیمس" : "Promo / Discount Code"}
                  </label>
                  <input
                    type="text"
                    value={academyAd.discountCode}
                    onChange={(e) => setAcademyAd({ ...academyAd, discountCode: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12.5px] font-mono text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "متن درصد تخفیف" : "Discount Badge"}
                  </label>
                  <input
                    type="text"
                    value={academyAd.discountText}
                    onChange={(e) => setAcademyAd({ ...academyAd, discountText: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "متن دکمه ثبت‌نام / اقدام" : "CTA Button Label"}
                  </label>
                  <input
                    type="text"
                    value={academyAd.ctaText}
                    onChange={(e) => setAcademyAd({ ...academyAd, ctaText: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink-muted mb-1">
                    {lang === "fa" ? "لینک ثبت‌نام یا تلگرام" : "CTA Link URL"}
                  </label>
                  <input
                    type="text"
                    value={academyAd.ctaUrl}
                    onChange={(e) => setAcademyAd({ ...academyAd, ctaUrl: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12.5px] font-mono text-ink outline-none focus:border-primary-deep"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="rounded-2xl border border-line/80 bg-subtle/50 p-4">
                <span className="text-[12px] font-extrabold text-ink-muted block mb-2">
                  {lang === "fa" ? "پیش‌نمایش زنده بنر تبلیغاتی در پنجره آموزش لیریک:" : "Live Preview:"}
                </span>

                <div className="rounded-[20px] border-2 border-primary/40 bg-gradient-to-br from-primary-faint/80 via-surface to-surface p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 border-b border-line/70 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-white shadow-primary">
                        <Icon name="crown" size={14} strokeWidth={2.4} />
                      </span>
                      <div>
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[12px] font-black text-primary-deep">
                          {academyAd.badgeText}
                        </span>
                        <h5 className="mt-0.5 text-[13px] font-black text-ink">
                          {academyAd.academyName}
                        </h5>
                      </div>
                    </div>

                    {academyAd.discountCode && (
                      <span className="rounded-xl border border-line bg-surface px-2.5 py-1 text-[12px] font-extrabold text-ink shadow-2xs">
                        {academyAd.discountCode}
                      </span>
                    )}
                  </div>

                  <div className="pt-3">
                    <h6 className="text-[13px] font-extrabold text-ink">{academyAd.title}</h6>
                    <p className="mt-1 text-[12px] text-ink-muted">{academyAd.description}</p>
                    <div className="mt-2.5 flex items-center justify-between text-[12px]">
                      <span className="font-extrabold text-emerald-600">🏷️ {academyAd.discountText}</span>
                      <span className="rounded-lg bg-primary px-3 py-1 font-bold text-white shadow-xs">
                        {academyAd.ctaText}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    saveAcademyAd(academyAd);
                    notify(lang === "fa" ? "تنظیمات تبلیغات آموزشگاه با موفقیت ذخیره شد." : "Saved ad settings.", "mint");
                  }}
                  className="flex items-center gap-2 rounded-xl bg-primary-deep px-5 py-2.5 text-[12.5px] font-bold text-white shadow-primary hover:bg-primary-deep/90"
                >
                  <Icon name="check" size={15} strokeWidth={2.4} />
                  <span>{lang === "fa" ? "ذخیره تنظیمات تبلیغات" : "Save Ad Settings"}</span>
                </button>
              </div>
            </div>
          )}

          {/* 9. STORY BACKGROUNDS MANAGEMENT */}
          {settingsSubTab === "story_backgrounds" && (
            <div className="rounded-[22px] border border-line bg-surface p-5 shadow-sm space-y-6">
              <div className="border-b border-line pb-3">
                <h3 className="font-extrabold text-[16px] text-ink">
                  {lang === "fa" ? "مدیریت پس‌زمینه‌های استوری‌ساز (Story Backgrounds)" : "Story Backgrounds Management"}
                </h3>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {lang === "fa"
                    ? "ایجاد و ویرایش پس‌زمینه‌های متناسب با هر گروه و آرتیست و تعیین شرط حد نصاب امتیاز هواداران برای آزادسازی"
                    : "Manage group-tailored story backgrounds & configure fan points unlock thresholds"}
                </p>
              </div>

              {/* Add New Background Form */}
              <div className="rounded-2xl border border-primary/30 bg-primary-faint/30 p-4 space-y-3.5">
                <h4 className="text-[13.5px] font-extrabold text-ink flex items-center gap-1.5">
                  <Icon name="plus" size={14} strokeWidth={2.4} />
                  <span>{lang === "fa" ? "افزودن پس‌زمینه جدید برای استوری‌ساز" : "Add New Background"}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-ink-muted mb-1">
                      {lang === "fa" ? "عنوان فارسی طرح" : "Title (Persian)"}
                    </label>
                    <input
                      type="text"
                      value={newBgTitleFa}
                      onChange={(e) => setNewBgTitleFa(e.target.value)}
                      placeholder="e.g. استی سرخ"
                      className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-ink-muted mb-1">
                      {lang === "fa" ? "عنوان انگلیسی طرح" : "Title (English)"}
                    </label>
                    <input
                      type="text"
                      value={newBgTitleEn}
                      onChange={(e) => setNewBgTitleEn(e.target.value)}
                      placeholder="e.g. STAY Red"
                      className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-ink-muted mb-1">
                      {lang === "fa" ? "گروه یا هنرمند مربوطه" : "Artist / Group"}
                    </label>
                    <select
                      value={newBgArtistId}
                      onChange={(e) => setNewBgArtistId(e.target.value)}
                      className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                    >
                      <option value="all">FAIMESS (عمومی)</option>
                      {Object.entries(ARTIST_FANDOMS).map(([artistId, info]) => (
                        <option key={artistId} value={artistId}>
                          {info.artistName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-ink-muted mb-1">
                      {lang === "fa" ? "حد نصاب امتیاز برای آزادسازی" : "Points Required"}
                    </label>
                    <input
                      type="number"
                      value={newBgPoints}
                      onChange={(e) => setNewBgPoints(Number(e.target.value))}
                      placeholder="100"
                      className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-ink-muted mb-1">
                      {lang === "fa" ? "رنگ شروع گرادیان (Hex)" : "Gradient From"}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newBgGradFrom}
                        onChange={(e) => setNewBgGradFrom(e.target.value)}
                        className="size-8 rounded-lg border border-line cursor-pointer"
                      />
                      <input
                        type="text"
                        value={newBgGradFrom}
                        onChange={(e) => setNewBgGradFrom(e.target.value)}
                        className="w-full rounded-xl border border-line bg-surface px-3 py-1.5 text-[12px] font-mono text-ink"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-ink-muted mb-1">
                      {lang === "fa" ? "رنگ پایان گرادیان (Hex)" : "Gradient To"}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newBgGradTo}
                        onChange={(e) => setNewBgGradTo(e.target.value)}
                        className="size-8 rounded-lg border border-line cursor-pointer"
                      />
                      <input
                        type="text"
                        value={newBgGradTo}
                        onChange={(e) => setNewBgGradTo(e.target.value)}
                        className="w-full rounded-xl border border-line bg-surface px-3 py-1.5 text-[12px] font-mono text-ink"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-ink-muted mb-1">
                      {lang === "fa" ? "الگوی نوری پس‌زمینه" : "Pattern"}
                    </label>
                    <select
                      value={newBgPattern}
                      onChange={(e) => setNewBgPattern(e.target.value as any)}
                      className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                    >
                      <option value="cosmic_stars">ستارگان کیهانی (Cosmic Stars)</option>
                      <option value="neon_stage">پروژکتورهای استیج (Neon Stage)</option>
                      <option value="prism_glow">درخشش منشوری (Prism Glow)</option>
                      <option value="purple_haze">بنفش برند (Purple Haze)</option>
                      <option value="minimal_dark">میدنایت نوار (Minimal Dark)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!newBgTitleFa.trim()) {
                        notify(lang === "fa" ? "لطفاً عنوان طرح را وارد کنید" : "Enter title", "primary");
                        return;
                      }
                      const artistObj = ARTIST_FANDOMS[newBgArtistId];
                      const newBg: StoryBackground = {
                        id: `bg-custom-${Date.now()}`,
                        titleFa: newBgTitleFa.trim(),
                        titleEn: newBgTitleEn.trim() || newBgTitleFa.trim(),
                        artistId: newBgArtistId,
                        artistName: artistObj ? artistObj.artistName : "FAIMESS",
                        requiredPoints: Number(newBgPoints) || 0,
                        gradientFrom: newBgGradFrom,
                        gradientTo: newBgGradTo,
                        accentColor: "#ffffff",
                        pattern: newBgPattern,
                        isOfficial: false,
                      };
                      const updated = saveStoryBackground(newBg);
                      setAdminBackgrounds(updated);
                      setNewBgTitleFa("");
                      setNewBgTitleEn("");
                      notify(lang === "fa" ? "طرح پس‌زمینه جدید اضافه شد." : "Added new background.", "mint");
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-[12px] font-bold text-white shadow-primary hover:bg-primary-deep"
                  >
                    <Icon name="plus" size={14} strokeWidth={2.4} />
                    <span>{lang === "fa" ? "افزودن طرح به استوری‌ساز" : "Add Background"}</span>
                  </button>
                </div>
              </div>

              {/* Existing Backgrounds Grid */}
              <div className="space-y-2.5">
                <h4 className="text-[13px] font-extrabold text-ink">
                  {lang === "fa" ? `طرح‌های موجود (${adminBackgrounds.length} پس‌زمینه):` : `Backgrounds (${adminBackgrounds.length}):`}
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {adminBackgrounds.map((bg) => (
                    <div
                      key={bg.id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line p-3 shadow-xs transition hover:border-primary/50"
                      style={{
                        background: `linear-gradient(135deg, ${bg.gradientFrom}, ${bg.gradientTo})`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-black/50 px-2 py-0.5 text-[12px] font-black text-white backdrop-blur-2xs">
                          {bg.artistName}
                        </span>
                        {!bg.isOfficial && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = deleteStoryBackground(bg.id);
                              setAdminBackgrounds(updated);
                              notify(lang === "fa" ? "طرح حذف شد." : "Deleted.", "primary");
                            }}
                            className="flex size-6 items-center justify-center rounded-full bg-black/60 text-rose-300 hover:text-rose-100 shadow-sm"
                            title="حذف طرح سفارشی"
                          >
                            <Icon name="close" size={11} />
                          </button>
                        )}
                      </div>

                      <div className="mt-8">
                        <h5 className="truncate text-[12.5px] font-black text-white drop-shadow-sm">
                          {bg.titleFa}
                        </h5>
                        <div className="mt-1 flex items-center justify-between text-[12px] text-white/80">
                          <span>{bg.pattern}</span>
                          <span className="font-bold">{bg.requiredPoints === 0 ? "رایگان" : `${bg.requiredPoints}P`}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. DATABASE, BACKUP & RESTORE */}
          {settingsSubTab === "database" && (
            <div className="rounded-[22px] border border-line bg-surface p-5 shadow-sm space-y-6">
              <div className="border-b border-line pb-3">
                <h3 className="font-extrabold text-[16px] text-ink">
                  {lang === "fa" ? "پشتیبان‌گیری، بازیابی و نگهداری پایگاه داده" : "Database Maintenance & Backup Center"}
                </h3>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {lang === "fa"
                    ? "استخراج خروجی کامل پایگاه داده در قالب فایل JSON، بازیابی اطلاعات و بازنشانی دمو"
                    : "Export JSON backup, restore existing database snapshot, or factory reset defaults"}
                </p>
              </div>

              {/* Database Live Stats Grid */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: "آهنگ‌ها", count: stats.totalTracks, icon: "music" },
                  { label: "آلبوم‌ها", count: stats.totalAlbums, icon: "disc" },
                  { label: "هنرمندان", count: stats.totalArtists, icon: "users" },
                  { label: "اخبار", count: stats.totalNews, icon: "news" },
                  { label: "دیدگاه‌ها", count: stats.totalComments, icon: "message" },
                  { label: "محصولات", count: stats.totalShopProducts, icon: "shop" },
                  { label: "پرسنل و کاربران", count: stats.totalUsers, icon: "users" },
                  { label: "درخواست‌ها", count: stats.pendingRequests, icon: "sparkle" },
                ].map((s, idx) => (
                  <div key={idx} className="rounded-xl border border-line/70 bg-subtle/40 p-2.5 text-center">
                    <span className="text-[12px] font-bold text-ink-muted">{s.label}</span>
                    <p className="text-[16px] font-black text-ink mt-0.5">{s.count}</p>
                  </div>
                ))}
              </div>

              {/* Action 1: Export Backup */}
              <div className="rounded-2xl border border-line bg-subtle/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-[14px] text-ink">
                    {lang === "fa" ? "دانلود فایل پشتیبان کامل دیتابیس (JSON)" : "Export Full Database (JSON)"}
                  </h4>
                  <p className="text-[12px] text-ink-muted">
                    {lang === "fa"
                      ? "شامل تمام آهنگ‌ها، متادیتا، پلی‌لیست‌ها، اخبار، کامنت‌ها و تنظیمات فعلی"
                      : "Complete JSON export containing all entities, catalog and configurations"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="flex items-center gap-1.5 rounded-xl bg-primary-deep px-4 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-primary-deep/90 shrink-0"
                >
                  <Icon name="folder" size={14} />
                  <span>{lang === "fa" ? "دانلود فایل پشتیبان .json" : "Download Backup"}</span>
                </button>
              </div>

              {/* Action 2: Import & Restore Database */}
              <div className="rounded-2xl border border-line bg-subtle/20 p-4 space-y-3">
                <div>
                  <h4 className="font-extrabold text-[14px] text-ink">
                    {lang === "fa" ? "بازیابی اطلاعات از متن یا فایل پشتیبان" : "Restore Database from JSON"}
                  </h4>
                  <p className="text-[12px] text-ink-muted">
                    {lang === "fa"
                      ? "محتوای فایل پشتیبان JSON را در کادر زیر قرار داده و دکمه بازیابی را بزنید."
                      : "Paste exported database JSON content into the area below to restore state."}
                  </p>
                </div>
                <textarea
                  rows={4}
                  value={importJsonInput}
                  onChange={(e) => setImportJsonInput(e.target.value)}
                  placeholder='{"artists": [...], "albums": [...], "tracks": [...]}'
                  className="w-full rounded-xl border border-line bg-surface p-3 font-mono text-[12px] text-ink outline-none focus:border-primary-deep"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleApplyRestoreJson}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-emerald-700"
                  >
                    <Icon name="check" size={14} />
                    <span>{lang === "fa" ? "اعمال و بازیابی دیتابیس" : "Apply Restore"}</span>
                  </button>
                </div>
              </div>

              {/* Action 3: Factory Reset */}
              <div className="rounded-2xl border border-rose-300/40 bg-rose-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-[14px] text-rose-700 dark:text-rose-400">
                    {lang === "fa" ? "بازنشانی کارخانه‌ای به مقادیر اولیه دمو" : "Factory Reset to Initial Demo"}
                  </h4>
                  <p className="text-[12px] text-ink-muted">
                    {lang === "fa"
                      ? "تمامی داده‌های آزمایشی، اخبار، محصولات و تنظیمات به دیتابیس اولیه پلتفرم فیمس بازمی‌گردد."
                      : "Irreversibly restore initial catalogue, artists, news and sample records."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFactoryReset}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-rose-700 shrink-0"
                >
                  <Icon name="close" size={14} />
                  <span>{lang === "fa" ? "بازنشانی کامل دمو" : "Factory Reset"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 11: USERS (STAFF BOX & ALL REGISTERED USERS BOX) ===================== */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* User Metrics & Global Search */}
          <div className="flex flex-col gap-4 rounded-[22px] border border-line bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl bg-subtle px-3 py-1.5">
                <span className="text-[12px] text-ink-muted">{lang === "fa" ? "کل کاربران ثبت‌نام‌شده" : "Total Users"}:</span>
                <span className="ms-1.5 font-black text-ink">{staffUsers.length + regularUsers.length}</span>
              </div>
              <div className="rounded-xl bg-primary-soft px-3 py-1.5 text-primary-deep">
                <span className="text-[12px] font-bold">{lang === "fa" ? "کادر نقش‌دار و پرسنل" : "Staff"}:</span>
                <span className="ms-1.5 font-black">{staffUsers.length}</span>
              </div>
              <div className="rounded-xl bg-teal-soft px-3 py-1.5 text-teal-deep">
                <span className="text-[12px] font-bold">{lang === "fa" ? "هواداران عادی" : "Regular Fans"}:</span>
                <span className="ms-1.5 font-black">{regularUsers.length}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative min-w-0 max-w-xs flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === "fa" ? "جستجو در تمامی کاربران..." : "Search users..."}
                  className="w-full rounded-[14px] border border-line bg-surface py-2 pe-3 ps-8 text-[12px] text-ink shadow-sm outline-none focus:border-primary-deep"
                />
                <div className="pointer-events-none absolute inset-y-0 start-2.5 flex items-center text-ink-faint">
                  <Icon name="search" size={13} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => openCreateUser("super_admin")}
                className="flex shrink-0 items-center gap-1.5 rounded-[14px] bg-primary-deep px-3.5 py-2 font-bold text-[12px] text-white shadow-sm hover:bg-primary-deep/90"
              >
                <Icon name="plus" size={14} />
                <span>{lang === "fa" ? "+ تعریف پرسنل / نقش جدید" : "+ Add Staff"}</span>
              </button>
            </div>
          </div>

          {/* BOX 1: STAFF & ROLE HOLDERS (کاربران دارای نقش سازمانی) */}
          <div className="rounded-[22px] border border-line bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <div>
                <h3 className="font-extrabold text-[15.5px] text-ink flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
                    <Icon name="star" size={13} />
                  </span>
                  <span>{lang === "fa" ? "پرسنل و کاربران دارای نقش مدیریتی (Staff & Role Holders)" : "Staff & Role Holders"}</span>
                </h3>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {lang === "fa"
                    ? "کاربران با نقش‌های مدیر کل، مدیر اخبار، نویسنده، ناظر کامنت، مدیر موسیقی یا فروشگاه"
                    : "Team members with administrative, curation or editorial authority"}
                </p>
              </div>

              <span className="rounded-full bg-primary-soft px-3 py-1 font-extrabold text-[12px] text-primary-deep">
                {staffUsers.length} {lang === "fa" ? "عضو نقش‌دار" : "staff members"}
              </span>
            </div>

            <div className="mt-4 overflow-x-auto rounded-[16px] border border-line bg-surface scroll-rail">
              <table className="w-full min-w-[750px] text-start text-[13px]">
                <thead className="border-b border-line bg-subtle/40 text-ink-muted">
                  <tr>
                    <th className="py-2.5 ps-4 text-start font-bold">{lang === "fa" ? "پرسنل" : "Staff"}</th>
                    <th className="py-2.5 text-start font-bold">{lang === "fa" ? "نقش سازمانی" : "Role"}</th>
                    <th className="py-2.5 text-start font-bold">{lang === "fa" ? "دسترسی‌های فعال" : "Permissions"}</th>
                    <th className="py-2.5 text-start font-bold">{lang === "fa" ? "وضعیت" : "Status"}</th>
                    <th className="py-2.5 text-start font-bold">{lang === "fa" ? "امتیاز" : "Points"}</th>
                    <th className="py-2.5 pe-4 text-end font-bold">{lang === "fa" ? "عملیات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {staffUsers.map((u) => {
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
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
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
                            {perms.canManageShop && (
                              <span className="rounded bg-amber-soft px-1.5 py-0.5 text-[12px] text-ink font-bold">فروشگاه</span>
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
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditUser(u)}
                              className="rounded-lg border border-line bg-surface px-2.5 py-1 text-[12px] font-bold text-ink transition hover:bg-primary-soft hover:text-primary-deep"
                              title="Edit Permissions & Role"
                            >
                              <Icon name="edit" size={13} className="inline me-1" />
                              <span>{lang === "fa" ? "ویرایش دسترسی‌ها" : "Edit RBAC"}</span>
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
                              <Icon name="lock" size={13} />
                            </button>
                            {u.role !== "super_admin" && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(lang === "fa" ? `نقش کاربر @${u.username} لغو و به کاربر عادی تبدیل شود؟` : `Demote @${u.username} to regular user?`)) {
                                    adminApi.updateUserRole(u.username, "user");
                                    notify(lang === "fa" ? "کاربر به کاربر عادی تنزیل یافت" : "Demoted to regular fan", "primary");
                                  }
                                }}
                                className="rounded-lg border border-line bg-surface px-2 py-1 text-[12px] font-bold text-ink-muted hover:text-ink"
                                title="Demote to Regular Fan"
                              >
                                {lang === "fa" ? "لغو نقش" : "Demote"}
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

          {/* BOX 2: ALL REGISTERED PLATFORM USERS (لیست تمام کاربران ثبت‌نام‌شده عادی سایت) */}
          <div className="rounded-[22px] border border-line bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <div>
                <h3 className="font-extrabold text-[15.5px] text-ink flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mint-soft text-teal-deep">
                    <Icon name="users" size={13} />
                  </span>
                  <span>{lang === "fa" ? "فهرست تمامی کاربران ثبت‌نام‌شده در سایت (Registered Fan Users)" : "All Registered Users"}</span>
                </h3>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {lang === "fa"
                    ? "تمام هواداران و کاربرانی که در سایت حساب کاربری دارند (با امکان ارتقا و اعطای نقش سازمانی)"
                    : "All registered consumers and fans with one-click promotion to staff roles"}
                </p>
              </div>

              <span className="rounded-full bg-subtle px-3 py-1 font-extrabold text-[12px] text-ink-muted">
                {regularUsers.length} {lang === "fa" ? "کاربر عادی" : "registered users"}
              </span>
            </div>

            <div className="mt-4 overflow-x-auto rounded-[16px] border border-line bg-surface scroll-rail">
              <table className="w-full min-w-[700px] text-start text-[13px]">
                <thead className="border-b border-line bg-subtle/40 text-ink-muted">
                  <tr>
                    <th className="py-2.5 ps-4 text-start font-bold">{lang === "fa" ? "کاربر عضو" : "Member"}</th>
                    <th className="py-2.5 text-start font-bold">{lang === "fa" ? "تاریخ عضویت" : "Joined"}</th>
                    <th className="py-2.5 text-start font-bold">{lang === "fa" ? "آخرین فعالیت" : "Last Active"}</th>
                    <th className="py-2.5 text-start font-bold">{lang === "fa" ? "امتیاز وفاداری" : "Points"}</th>
                    <th className="py-2.5 text-start font-bold">{lang === "fa" ? "وضعیت حساب" : "Status"}</th>
                    <th className="py-2.5 pe-4 text-end font-bold">{lang === "fa" ? "عملیات و ارتقای نقش" : "Role Promotion"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {regularUsers.map((u) => (
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
                      <td className="py-2.5 text-[12px] text-ink-muted">{u.joinedAt || "Recently"}</td>
                      <td className="py-2.5 text-[12px] text-ink-muted">{u.lastActive || "Recently"}</td>
                      <td className="py-2.5 font-bold text-teal-deep">{u.points.toLocaleString(locale)}</td>
                      <td className="py-2.5">
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[12px] font-bold",
                          u.status === "active" ? "bg-mint-soft text-teal-deep" : "bg-flame-soft text-flame-deep",
                        )}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-2.5 pe-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Assign Role / Promote button */}
                          <button
                            type="button"
                            onClick={() => openEditUser(u)}
                            className="rounded-lg bg-primary-deep px-3 py-1 text-[12px] font-bold text-white shadow-sm hover:bg-primary-deep/90"
                            title="Promote to Staff Role"
                          >
                            <Icon name="plus" size={12} className="inline me-1" />
                            <span>{lang === "fa" ? "اعطای نقش و ارتقا" : "Assign Role"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              adminApi.toggleUserStatus(u.username);
                              notify(lang === "fa" ? "وضعیت کاربر تغییر کرد" : "Status changed", "primary");
                            }}
                            className="rounded-lg p-1.5 text-ink-faint hover:text-ink"
                            title={u.status === "active" ? "Suspend" : "Activate"}
                          >
                            <Icon name="lock" size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(lang === "fa" ? `حذف حساب کاربری @${u.username}؟` : `Delete account @${u.username}?`)) {
                                adminApi.deleteUser(u.username);
                                notify(lang === "fa" ? "کاربر حذف شد" : "User deleted", "primary");
                              }
                            }}
                            className="rounded-lg p-1.5 text-ink-faint hover:text-flame-deep"
                            title="Delete"
                          >
                            <Icon name="close" size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {regularUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-ink-muted">
                        <Icon name="users" size={24} className="mx-auto text-ink-faint" />
                        <p className="mt-2 text-[12px] font-bold">
                          {lang === "fa" ? "کاربر عادی با این مشخصات یافت نشد" : "No users found"}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 12: FAN CONTENT REQUESTS MODERATION ===================== */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          {/* Requests Metric Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-[20px] border border-line bg-surface p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-ink-muted">
                  {lang === "fa" ? "کل درخواست‌ها" : "Total Requests"}
                </span>
                <span className="flex size-7 items-center justify-center rounded-lg bg-subtle text-ink">
                  <Icon name="waveform" size={14} />
                </span>
              </div>
              <div className="mt-2 font-black text-[22px] text-ink">
                {adminApi.getContentRequests().length}
              </div>
            </div>

            <div className="rounded-[20px] border border-amber-500/20 bg-amber-500/5 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-amber-600">
                  {lang === "fa" ? "در انتظار بررسی" : "Pending Review"}
                </span>
                <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600">
                  <Icon name="bell" size={14} />
                </span>
              </div>
              <div className="mt-2 font-black text-[22px] text-amber-600">
                {adminApi.getContentRequests().filter((r) => r.status === "pending").length}
              </div>
            </div>

            <div className="rounded-[20px] border border-mint-deep/20 bg-mint-soft/30 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-mint-deep">
                  {lang === "fa" ? "تایید و اضافه شده" : "Fulfilled"}
                </span>
                <span className="flex size-7 items-center justify-center rounded-lg bg-mint-deep/20 text-mint-deep">
                  <Icon name="check" size={14} />
                </span>
              </div>
              <div className="mt-2 font-black text-[22px] text-mint-deep">
                {adminApi.getContentRequests().filter((r) => r.status === "fulfilled").length}
              </div>
            </div>

            <div className="rounded-[20px] border border-rose-500/20 bg-rose-500/5 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-rose-500">
                  {lang === "fa" ? "رد شده" : "Rejected"}
                </span>
                <span className="flex size-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-500">
                  <Icon name="close" size={14} />
                </span>
              </div>
              <div className="mt-2 font-black text-[22px] text-rose-500">
                {adminApi.getContentRequests().filter((r) => r.status === "rejected").length}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col gap-3 rounded-[22px] border border-line bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-bold text-ink-muted me-1">
                {lang === "fa" ? "وضعیت:" : "Status:"}
              </span>
              {(["all", "pending", "fulfilled", "rejected"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setRequestFilter(st)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-[12px] font-bold transition",
                    requestFilter === st
                      ? "bg-primary text-white"
                      : "bg-subtle text-ink-muted hover:text-ink",
                  )}
                >
                  {st === "all"
                    ? lang === "fa" ? "همه" : "All"
                    : st === "pending"
                      ? lang === "fa" ? "در انتظار بررسی" : "Pending"
                      : st === "fulfilled"
                        ? lang === "fa" ? "تایید شده" : "Fulfilled"
                        : lang === "fa" ? "رد شده" : "Rejected"}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-bold text-ink-muted me-1">
                {lang === "fa" ? "نوع:" : "Type:"}
              </span>
              {(["all", "track", "album", "lyrics", "artist"] as const).map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setRequestTypeFilter(tp)}
                  className={cn(
                    "rounded-xl px-2.5 py-1 text-[12px] font-bold transition",
                    requestTypeFilter === tp
                      ? "bg-ink text-surface"
                      : "bg-subtle text-ink-muted hover:text-ink",
                  )}
                >
                  {tp === "all"
                    ? lang === "fa" ? "همه انواع" : "All"
                    : tp === "track"
                      ? lang === "fa" ? "قطعه موسیقی" : "Track"
                      : tp === "album"
                        ? lang === "fa" ? "آلبوم" : "Album"
                        : tp === "lyrics"
                          ? lang === "fa" ? "متن / ترجمه" : "Lyrics"
                          : lang === "fa" ? "هنرمند" : "Artist"}
                </button>
              ))}
            </div>
          </div>

          {/* Requests Table */}
          <div className="overflow-hidden rounded-[22px] border border-line bg-surface shadow-sm">
            <div className="overflow-x-auto scroll-rail">
              <table className="w-full min-w-[750px] text-start text-[13px]">
                <thead>
                  <tr className="border-b border-line bg-subtle/50 text-ink-faint">
                    <th className="px-4 py-3 text-start font-bold">{lang === "fa" ? "نوع اثر" : "Type"}</th>
                    <th className="px-4 py-3 text-start font-bold">{lang === "fa" ? "عنوان و هنرمند درخواستی" : "Title & Artist"}</th>
                    <th className="px-4 py-3 text-start font-bold">{lang === "fa" ? "ثبت‌کننده" : "Submitted By"}</th>
                    <th className="px-4 py-3 text-start font-bold">{lang === "fa" ? "توضیحات / لینک" : "Notes"}</th>
                    <th className="px-4 py-3 text-start font-bold">{lang === "fa" ? "وضعیت" : "Status"}</th>
                    <th className="px-4 py-3 text-end font-bold">{lang === "fa" ? "عملیات مدیر" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {allContentRequests.map((req) => (
                    <tr key={req.id} className="transition hover:bg-subtle/40">
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-bold text-white",
                            req.type === "track" && "bg-primary",
                            req.type === "album" && "bg-teal-deep",
                            req.type === "lyrics" && "bg-mint-deep",
                            req.type === "artist" && "bg-amber-600",
                          )}
                        >
                          <Icon
                            name={
                              req.type === "track"
                                ? "music"
                                : req.type === "album"
                                  ? "disc"
                                  : req.type === "lyrics"
                                    ? "waveform"
                                    : "mic"
                            }
                            size={12}
                          />
                          <span>
                            {req.type === "track"
                              ? lang === "fa" ? "موسیقی" : "Track"
                              : req.type === "album"
                                ? lang === "fa" ? "آلبوم" : "Album"
                                : req.type === "lyrics"
                                  ? lang === "fa" ? "لیریک" : "Lyrics"
                                  : lang === "fa" ? "هنرمند" : "Artist"}
                          </span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-extrabold text-ink">{req.title}</div>
                        <div className="text-[12px] font-semibold text-ink-muted">{req.artistName}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-ink">@{req.requestedBy}</div>
                        <div className="text-[12px] text-ink-faint">{req.submittedAt}</div>
                      </td>

                      <td className="px-4 py-3.5 max-w-[240px]">
                        <p className="truncate text-[12px] text-ink-body" title={req.notes}>
                          {req.notes || (lang === "fa" ? "— بدون یادداشت —" : "— None —")}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        {req.status === "pending" && (
                          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-[12px] font-bold text-amber-600 ring-1 ring-amber-500/30">
                            {lang === "fa" ? "در انتظار بررسی" : "Pending"}
                          </span>
                        )}
                        {req.status === "fulfilled" && (
                          <span className="inline-flex items-center rounded-full bg-mint-soft px-2.5 py-1 text-[12px] font-extrabold text-mint-deep ring-1 ring-mint-deep/30">
                            ✓ {lang === "fa" ? "تایید و اضافه شد" : "Fulfilled"}
                          </span>
                        )}
                        {req.status === "rejected" && (
                          <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-1 text-[12px] font-bold text-rose-500 ring-1 ring-rose-500/30">
                            {lang === "fa" ? "رد شده" : "Rejected"}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          {req.status === "pending" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleFulfillRequest(req.id, req.title)}
                                className="flex items-center gap-1 rounded-xl bg-mint-deep px-2.5 py-1.5 text-[12px] font-bold text-white shadow-2xs transition hover:bg-mint-deep/90"
                                title={lang === "fa" ? "تایید و اهدای ۲۵ امتیاز" : "Fulfill"}
                              >
                                <Icon name="check" size={13} />
                                <span>{lang === "fa" ? "تایید" : "Fulfill"}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRejectRequest(req.id, req.title)}
                                className="flex items-center gap-1 rounded-xl bg-rose-500/10 px-2.5 py-1.5 text-[12px] font-bold text-rose-600 transition hover:bg-rose-500/20"
                                title={lang === "fa" ? "رد درخواست" : "Reject"}
                              >
                                <Icon name="close" size={13} />
                                <span>{lang === "fa" ? "رد" : "Reject"}</span>
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(lang === "fa" ? `حذف درخواست «${req.title}»؟` : `Delete request "${req.title}"?`)) {
                                handleDeleteRequest(req.id);
                              }
                            }}
                            className="rounded-lg p-1.5 text-ink-faint hover:text-flame-deep"
                            title={lang === "fa" ? "حذف درخواست" : "Delete"}
                          >
                            <Icon name="close" size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {allContentRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-ink-muted">
                        <Icon name="waveform" size={26} className="mx-auto text-ink-faint" />
                        <p className="mt-2 text-[12px] font-bold">
                          {lang === "fa" ? "هیچ درخواستی با این فیلتر یافت نشد" : "No requests found"}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-bold text-ink-muted">
                      {lang === "fa" ? "تلفظ انگلیسی لیریک (Romanization Lines)" : "English Pronunciation Lines"}
                    </span>
                    <span className="text-[12px] font-extrabold text-primary-deep">
                      {lang === "fa" ? "برای کاربران بدون دانش کره‌ای" : "Phonetic guide"}
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={trackLyricsRomanization}
                    onChange={(e) => setTrackLyricsRomanization(e.target.value)}
                    placeholder="[00:12.4] Binnaneun bamhaneul araeseo&#10;[00:16.8] Uri dulmane noraereul bulleo"
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface p-2.5 font-mono text-[12px] text-ink outline-none focus:border-primary-deep"
                  />
                </div>

                {editingTrackId && (
                  <div className="rounded-xl border border-primary/30 bg-primary-faint/30 p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[12.5px] font-black text-ink">
                        {lang === "fa" ? "محتوای آموزشی زبان کره‌ای (لغات و گرامر)" : "Korean Lyric Learning Notes"}
                      </p>
                      <p className="text-[12px] text-ink-muted">
                        {lang === "fa" ? "برای این قطعه می‌توانید خط‌به‌خط واژگان و تلفظ انگلیسی تعریف کنید." : "Add line-by-line vocabulary & grammar for this track."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEduTrackId(editingTrackId);
                        setTrackModalOpen(false);
                        setActiveTab("tracks");
                        notify(lang === "fa" ? "به ویرایشگر آموزش خط‌به‌خط لیریک منتقل شدید." : "Opened lyric lesson editor.", "primary");
                      }}
                      className="rounded-xl bg-primary px-3 py-1.5 text-[12px] font-bold text-white shadow-primary hover:bg-primary-deep transition shrink-0"
                    >
                      {lang === "fa" ? "تدوین آموزش" : "Edit Lessons"}
                    </button>
                  </div>
                )}
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
                    ? (lang === "fa" ? "ویرایش نقش و دسترسی‌های کاربر" : "Edit User & Granular RBAC")
                    : (lang === "fa" ? "تعریف یا ارتقای کاربر به نقش جدید" : "Add / Promote User")}
                </h3>
                <p className="text-[12px] text-ink-muted">
                  {lang === "fa" ? "تعیین نقش سازمانی و اعطای دسترسی‌های بیشتر و اختصاصی" : "Set role and toggle granular permissions"}
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
                    {lang === "fa" ? "نقش سازمانی حساب" : "Role"}
                  </label>
                  <select
                    value={userRole}
                    onChange={(e) => handleRoleChange(e.target.value as AdminUserRole)}
                    className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-primary-deep"
                  >
                    <option value="super_admin">{lang === "fa" ? "مدیر کل ارشد (Super Admin)" : "Super Admin"}</option>
                    <option value="news_manager">{lang === "fa" ? "مدیر اخبار (News Manager)" : "News Manager"}</option>
                    <option value="news_author">{lang === "fa" ? "نویسنده اخبار (News Author)" : "News Author"}</option>
                    <option value="comment_moderator">{lang === "fa" ? "مدیر نظارت دیدگاه‌ها (Comment Moderator)" : "Comment Moderator"}</option>
                    <option value="music_curator">{lang === "fa" ? "مدیر موسیقی و لیریک (Music Curator)" : "Music Curator"}</option>
                    <option value="shop_manager">{lang === "fa" ? "مدیر فروشگاه (Shop Manager)" : "Shop Manager"}</option>
                    <option value="user">{lang === "fa" ? "کاربر هوادار عادی (Fan User)" : "Fan User"}</option>
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
                    : (lang === "fa" ? "ذخیره و ثبت کاربر" : "Add User")}
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

      {/* ===================== GRAPHIC BANNER & CAPTION PREVIEW MODAL ===================== */}
      {publishModalOpen && (selectedPublishCat || (previewIsSquare && previewItemPayload)) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-[620px] flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                  <Icon name="sparkle" size={15} />
                </span>
                <div>
                  <h3 className="font-extrabold text-[15px] text-ink">
                    {lang === "fa" ? "پیش‌نمایش پوستر گرافیکی و کپشن انتشار" : "Graphic Banner & Caption Preview"}
                  </h3>
                  <span className="text-[12px] text-ink-muted">
                    {previewIsSquare && previewItemPayload
                      ? `${previewItemPayload.title} (${previewItemPayload.type})`
                      : (selectedPublishCat ? getCategoryTitle(selectedPublishCat, "fa") : "")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPublishModalOpen(false)}
                className="rounded-full p-1.5 text-ink-faint hover:bg-subtle hover:text-ink"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scroll-slim">
              {/* Graphic Banner Display (16:9 Vertical OR 1:1 Square) */}
              <div>
                <span className="block text-[12px] font-bold text-ink-muted mb-1.5">
                  {previewIsSquare
                    ? (lang === "fa" ? "تصویر پوستر محتوای جدید (1:1 مربع 1080x1080):" : "Generated 1:1 Square Poster (1080x1080):")
                    : (lang === "fa" ? "تصویر پوستر جدول رتبه‌بندی (16:9 عمودی 1080x1920):" : "Generated 9:16 Vertical Poster (1080x1920):")}
                </span>
                <div className={cn(
                  "relative mx-auto overflow-hidden rounded-2xl border border-line bg-[#5833e6] shadow-2xl flex items-center justify-center",
                  previewIsSquare ? "aspect-square max-h-[480px] w-auto" : "aspect-[9/16] max-h-[560px] w-auto",
                )}>
                  {previewBannerImg ? (
                    <img
                      src={previewBannerImg}
                      alt="Banner Preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-[13px] text-white/50 animate-pulse font-medium">
                      {lang === "fa" ? "در حال رندر و تولید تصویر گرافیکی..." : "Rendering Graphic Banner..."}
                    </span>
                  )}
                </div>
              </div>

              {/* Caption Text Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="block text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "متن و کپشن کانال (تلگرام و بله):" : "Telegram & Bale Caption:"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        navigator.clipboard?.writeText?.(previewCaption);
                        notify(lang === "fa" ? "کپشن در کلیپ‌بورد کپی شد" : "Caption copied", "mint");
                      }
                    }}
                    className="text-[12px] font-bold text-primary-deep hover:underline"
                  >
                    {lang === "fa" ? "کپی متن کپشن" : "Copy Caption"}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={previewCaption}
                  rows={7}
                  className="w-full rounded-xl border border-line bg-subtle/50 p-3 text-[12px] leading-relaxed text-ink font-sans focus:outline-none"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between border-t border-line bg-subtle/30 px-5 py-3.5">
              {previewBannerImg && (
                <a
                  href={previewBannerImg}
                  download={
                    previewIsSquare && previewItemPayload
                      ? `faimess-${previewItemPayload.type}-${Date.now()}.png`
                      : `faimess-leaderboard-${selectedPublishCat || "poster"}-${Date.now()}.png`
                  }
                  className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 py-2 text-[12px] font-bold text-ink hover:bg-subtle transition shadow-2xs"
                >
                  <Icon name="download" size={14} />
                  <span>{lang === "fa" ? "دانلود تصویر PNG" : "Download PNG"}</span>
                </a>
              )}

              <div className="flex items-center gap-2 ms-auto">
                <button
                  type="button"
                  onClick={() => setPublishModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-[12px] font-bold text-ink-muted hover:bg-subtle"
                >
                  {lang === "fa" ? "بستن" : "Close"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (previewIsSquare && previewItemPayload) {
                      handleExecuteItemPublish(previewItemPayload);
                    } else if (selectedPublishCat) {
                      handleExecutePublish(selectedPublishCat);
                    }
                    setPublishModalOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-primary-deep px-4 py-2 text-[12px] font-bold text-white shadow-primary hover:bg-primary-deep/90 transition"
                >
                  <Icon name="send" size={14} />
                  <span>{lang === "fa" ? "ارسال و انتشار مستقیم به کانال‌ها" : "Send & Publish to Channels"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
