"use client";

import { useEffect, useRef, useState } from "react";
import { deleteAvatar, uploadAvatar } from "@/lib/api";
import { getStoredToken, getStoredUser, setStoredUser } from "@/lib/auth";
import { buttonClass, dangerAlertClass, ghostButtonClass, ledeClass, sectionTitleClass } from "@/lib/ui";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function withCacheBust(url: string | null, version: number): string | null {
  if (!url) return null;
  const sanitizedUrl = url.replace(/([?&])v=[^&]*(&|$)/, "$1").replace(/[?&]$/, "");
  const delimiter = sanitizedUrl.includes("?") ? "&" : "?";
  return `${sanitizedUrl}${delimiter}v=${version}`;
}

export function AvatarUploadDetail() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = preview ?? avatarUrl;

  useEffect(() => {
    const storedUser = getStoredUser();
    setAvatarUrl(storedUser?.avatar_url ?? null);
  }, []);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function applyCandidateFile(file: File) {
    setError(null);
    setSuccess(null);

    if (!ACCEPT.includes(file.type)) {
      setError("Only JPEG, PNG, WebP, or GIF images are supported.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be 5 MB or less.");
      return;
    }

    setPendingFile(file);
    setPreview((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return URL.createObjectURL(file);
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    applyCandidateFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    applyCandidateFile(file);
  }

  async function handleUpload() {
    if (!pendingFile) return;
    const token = getStoredToken();
    if (!token) { setError("Not authenticated."); return; }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = await uploadAvatar(token, pendingFile);
      const nextAvatarUrl = withCacheBust(updatedUser.avatar_url, Date.now());
      setStoredUser({ ...updatedUser, avatar_url: nextAvatarUrl });
      setAvatarUrl(nextAvatarUrl);
      setPreview(null);
      setPendingFile(null);
      setSuccess("Avatar updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleCancelPreview() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setPendingFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleRemove() {
    const token = getStoredToken();
    if (!token) { setError("Not authenticated."); return; }
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const updatedUser = await deleteAvatar(token);
      setStoredUser(updatedUser);
      setAvatarUrl(null);
      setPreview(null);
      setPendingFile(null);
      setSuccess("Avatar removed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className={sectionTitleClass}>Upload Avatar</h2>

      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        <div className="size-20 flex-shrink-0 overflow-hidden rounded-full border border-slate-900/10 bg-slate-200 dark:border-white/10 dark:bg-slate-700">
          {displayUrl ? (
            <img src={displayUrl} alt="Avatar preview" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-2xl text-slate-400 dark:text-slate-500">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-10"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">Profile photo</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">JPEG, PNG, WebP, or GIF · Max 5 MB</p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop image or click to choose file"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
        className="flex min-h-[7rem] cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-slate-900/20 bg-slate-50 text-center transition hover:bg-slate-100/70 dark:border-white/15 dark:bg-slate-800/40 dark:hover:bg-slate-700/30"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-7 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
        <span className="text-xs text-slate-500 dark:text-slate-400">Drop image here or <span className="text-indigo-600 dark:text-indigo-400">browse</span></span>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(",")}
          className="sr-only"
          onChange={handleFileChange}
          aria-hidden="true"
        />
      </div>

      {/* Status messages */}
      {error && <p className={dangerAlertClass}>{error}</p>}
      {success && <p className="rounded-none border border-emerald-600/25 bg-emerald-600/8 px-4 py-3 text-sm text-slate-900 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-zinc-100">{success}</p>}

      {/* Action row */}
      <div className="flex flex-wrap gap-3">
        {pendingFile ? (
          <>
            <button type="button" onClick={handleUpload} disabled={uploading} className={buttonClass}>
              {uploading ? "Uploading…" : "Save avatar"}
            </button>
            <button type="button" onClick={handleCancelPreview} disabled={uploading} className={ghostButtonClass}>
              Cancel
            </button>
          </>
        ) : avatarUrl ? (
          <button type="button" onClick={handleRemove} disabled={uploading} className={ghostButtonClass}>
            {uploading ? "Removing…" : "Remove avatar"}
          </button>
        ) : null}
      </div>

      <p className={ledeClass}>
        Your avatar is displayed in the sidebar and on calls. Square images work best.
      </p>
    </div>
  );
}
