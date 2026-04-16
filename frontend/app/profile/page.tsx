"use client";

import { useEffect, useMemo, useState } from "react";

import { UserAvatar } from "@/components/account/UserAvatar";
import { AppShell } from "@/components/layout/AppShell";
import type { AuthUser } from "@/types";

import { deleteAvatar, getCurrentUser, uploadAvatar } from "@/lib/api";
import { getStoredToken, getStoredUser, setStoredUser } from "@/lib/auth";
import {
  buttonClass,
  dangerAlertClass,
  eyebrowClass,
  ghostButtonClass,
  inputClass,
  mutedClass,
  nestedPanelClass,
  pageTitleClass,
  panelClass,
  secondaryButtonClass,
  sectionTitleClass,
  splitGridClass,
} from "@/lib/ui";


const MAX_AVATAR_BYTES = 5 * 1024 * 1024;


export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    if (!selectedFile) {
      return null;
    }
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }

    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser(token)
      .then((currentUser) => {
        setStoredUser(currentUser);
        setUser(currentUser);
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : "Unable to load profile.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const avatarFallback = (user?.display_name?.charAt(0) ?? user?.email?.charAt(0) ?? "A").toUpperCase();

  async function handleAvatarUpload() {
    const token = getStoredToken();
    if (!token || !selectedFile) {
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updatedUser = await uploadAvatar(token, selectedFile);
      setStoredUser(updatedUser);
      setUser(updatedUser);
      setSelectedFile(null);
      setSuccessMessage("Profile avatar updated.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to upload avatar.");
    } finally {
      setUploading(false);
    }
  }

  async function handleAvatarDelete() {
    const token = getStoredToken();
    if (!token) {
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updatedUser = await deleteAvatar(token);
      setStoredUser(updatedUser);
      setUser(updatedUser);
      setSelectedFile(null);
      setSuccessMessage("Profile avatar removed.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to remove avatar.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelection(file: File | null) {
    setSuccessMessage(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only PNG, JPEG, and WebP images are supported.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError("Avatar images must be 5 MB or smaller.");
      return;
    }

    setError(null);
    setSelectedFile(file);
  }

  return (
    <AppShell>
      <section className={panelClass}>
        <div className="flex flex-col gap-3">
          <p className={eyebrowClass}>Account</p>
          <h1 className={pageTitleClass}>Profile</h1>
          <p className="text-[0.98rem] leading-7 text-slate-500 dark:text-slate-400">Review the operator details attached to this account.</p>
        </div>
        {error ? <div className={dangerAlertClass}>{error}</div> : null}
        {successMessage ? <div className="rounded-none border border-emerald-600/20 bg-emerald-500/10 px-4 py-3 text-sm text-slate-900 dark:border-emerald-400/25 dark:bg-emerald-400/12 dark:text-zinc-100">{successMessage}</div> : null}
        <div className={splitGridClass}>
          <article className={nestedPanelClass}>
            <h2 className={sectionTitleClass}>Avatar</h2>
            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                <UserAvatar
                  avatarUrl={previewUrl ?? user?.avatar_url}
                  fallback={avatarFallback}
                  className="inline-flex size-24 items-center justify-center overflow-hidden rounded-none border border-indigo-600/20 bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.22),transparent_48%),linear-gradient(145deg,#0078d4,#0a84d0_42%,#005a9e)] text-2xl font-bold tracking-[0.01em] text-[#f8fbff] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_8px_18px_rgba(0,120,212,0.18)] dark:border-indigo-400/25 dark:bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.18),transparent_48%),linear-gradient(145deg,#3794ff,#4fc1ff_42%,#78b7ff)] dark:text-slate-950 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_18px_rgba(55,148,255,0.2)]"
                />
                <div className="grid gap-1">
                  <strong className="text-slate-900 dark:text-zinc-100">{user?.display_name ?? "Operator avatar"}</strong>
                  <p className={mutedClass}>PNG, JPEG, or WebP up to 5 MB. Uploading a new image replaces the current avatar.</p>
                </div>
              </div>
              <label className="grid gap-2">
                <span className={mutedClass}>Choose image</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className={inputClass}
                  onChange={(event) => handleFileSelection(event.target.files?.[0] ?? null)}
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button type="button" className={buttonClass} disabled={!selectedFile || uploading} onClick={handleAvatarUpload}>
                  {uploading ? "Uploading..." : user?.avatar_url ? "Change avatar" : "Upload avatar"}
                </button>
                <button type="button" className={secondaryButtonClass} disabled={!selectedFile || uploading} onClick={() => setSelectedFile(null)}>
                  Clear selection
                </button>
                <button type="button" className={ghostButtonClass} disabled={!user?.avatar_url || uploading} onClick={handleAvatarDelete}>
                  Remove avatar
                </button>
              </div>
            </div>
          </article>
          <article className={nestedPanelClass}>
            <h2 className={sectionTitleClass}>Identity</h2>
            <div className="grid gap-4">
              <div>
                <div className={mutedClass}>Display name</div>
                <strong>{loading ? "Loading..." : (user?.display_name ?? "Unavailable")}</strong>
              </div>
              <div>
                <div className={mutedClass}>Email</div>
                <strong>{loading ? "Loading..." : (user?.email ?? "Unavailable")}</strong>
              </div>
              <div>
                <div className={mutedClass}>Role</div>
                <strong>{loading ? "Loading..." : (user?.role ?? "Operator")}</strong>
              </div>
              <div>
                <div className={mutedClass}>Email verification</div>
                <strong>{loading ? "Loading..." : (user?.email_verified ? "Verified" : "Pending verification")}</strong>
              </div>
            </div>
          </article>
          <article className={nestedPanelClass}>
            <h2 className={sectionTitleClass}>Access</h2>
            <div className="grid gap-4">
              <div>
                <div className={mutedClass}>Authentication</div>
                <strong>Email and password</strong>
              </div>
              <div>
                <div className={mutedClass}>Status</div>
                <strong>{user ? "Active" : "Pending"}</strong>
              </div>
            </div>
          </article>
        </div>
      </section>
    </AppShell>
  );
}