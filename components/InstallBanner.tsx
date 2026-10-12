import React from 'react';
import { Download, Share2, X } from 'lucide-react';
import MaterialButton from './ui/MaterialButton';
import IconButton from './ui/IconButton';

export interface InstallBannerProps {
  onInstall: () => void;
  onDismiss: () => void;
}

/**
 * Material "install app" banner.
 *
 * Android installs PWAs through `beforeinstallprompt`; surfacing it as an
 * in-app banner (rather than relying on the browser's mini-infobar) makes the
 * web app feel like an app store download.
 */
export const InstallBanner: React.FC<InstallBannerProps> = ({ onInstall, onDismiss }) => (
  <div className="animate-pop-in px-3 pt-3 sm:px-4 md:px-6">
    <div className="flex items-start gap-3 rounded-2xl border border-primary-500/20 bg-primary-50 p-3 shadow-m3-1 dark:border-primary-400/20 dark:bg-primary-500/10">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white">
        <Download className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Install on Android</p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-slate-600 dark:text-slate-300">
          Add TSun Chat Viewer to your home screen for full-screen reading and offline access.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <MaterialButton size="sm" icon={<Share2 className="h-4 w-4" />} onClick={onInstall}>
            Install
          </MaterialButton>
          <MaterialButton size="sm" variant="text" onClick={onDismiss}>
            Not now
          </MaterialButton>
        </div>
      </div>
      <IconButton label="Dismiss install banner" size="sm" onClick={onDismiss}>
        <X />
      </IconButton>
    </div>
  </div>
);

export default InstallBanner;
