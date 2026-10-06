import { HomePage } from "../pages/HomePage";
import { ArtistsPage } from "../pages/ArtistsPage";
import { AlbumsPage } from "../pages/AlbumsPage";
import { PlaylistsPage } from "../pages/PlaylistsPage";
import { ShopPage } from "../pages/ShopPage";
import { NewsPage } from "../pages/NewsPage";
import { DownloadPage } from "../pages/DownloadPage";
import { AdminPage } from "../pages/AdminPage";
import { ProfilePage } from "../pages/ProfilePage";

/**
 * Route id → page component. Lives on its own so both shells (the desktop
 * art-board and the compact one) read the same table instead of one
 * importing the other.
 */
export const PAGES = {
  home: HomePage,
  artists: ArtistsPage,
  albums: AlbumsPage,
  playlists: PlaylistsPage,
  shop: ShopPage,
  news: NewsPage,
  download: DownloadPage,
  admin: AdminPage,
  profile: ProfilePage,
} as const;
