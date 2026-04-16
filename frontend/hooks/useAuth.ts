"use client";

import { useEffect, useState } from "react";

import type { AuthUser, TokenResponse } from "@/types";

import { clearStoredToken, getStoredToken, getStoredUser, setStoredToken, setStoredUser } from "@/lib/auth";
import { getCurrentUser, googleSignIn, googleSignUp, login, signup } from "@/lib/api";


export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    setToken(storedToken);
    setUser(storedUser);

    if (!storedToken) {
      setLoading(false);
      return;
    }

    getCurrentUser(storedToken)
      .then((currentUser) => {
        setStoredUser(currentUser);
        setUser(currentUser);
      })
      .catch(() => {
        clearStoredToken();
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function applyAuthResponse(response: TokenResponse) {
    setStoredToken(response.access_token);
    setStoredUser(response.user);
    setToken(response.access_token);
    setUser(response.user);
    return response;
  }

  async function signIn(email: string, password: string) {
    return applyAuthResponse(await login(email, password));
  }

  async function signUp(firstName: string, lastName: string, email: string, password: string) {
    return signup(firstName, lastName, email, password);
  }

  async function signInWithGoogle(idToken: string) {
    return applyAuthResponse(await googleSignIn(idToken));
  }

  async function signUpWithGoogle(idToken: string) {
    return applyAuthResponse(await googleSignUp(idToken));
  }

  function signOut() {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }

  return {
    token,
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signUpWithGoogle,
    signOut,
  };
}
