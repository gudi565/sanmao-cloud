"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthUser } from "@/lib/auth/types";
import {
  fetchMe,
  loginRequest,
  logoutRequest,
  registerRequest,
  resetPasswordRequest,
  sendCodeRequest,
  type AuthResult,
  type ResetResult,
  type SendCodeResult,
} from "@/lib/auth/client";

type SendCodeInput = {
  account: string;
  captchaId: string;
  captcha: string;
};
type RegisterInput = {
  name: string;
  account: string;
  code: string;
  password: string;
};
type LoginInput = { account: string; password: string; remember?: boolean };
type ResetInput = { account: string; code: string; password: string };

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  sendCode: (input: SendCodeInput) => Promise<SendCodeResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  login: (input: LoginInput) => Promise<AuthResult>;
  resetPassword: (input: ResetInput) => Promise<ResetResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 首屏挂载时拉取当前会话用户（SSR 阶段渲染为 null，避免把整站 layout 拖入动态渲染）
  useEffect(() => {
    let active = true;
    fetchMe()
      .then((u) => {
        if (active) setUser(u);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (input: LoginInput): Promise<AuthResult> => {
    const res = await loginRequest(input);
    if (res.user) setUser(res.user);
    return res;
  }, []);

  const register = useCallback(
    async (input: RegisterInput): Promise<AuthResult> => {
      const res = await registerRequest(input);
      if (res.user) setUser(res.user);
      return res;
    },
    []
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const resetPassword = useCallback(
    (input: ResetInput) => resetPasswordRequest(input),
    []
  );

  const sendCode = useCallback(
    (input: SendCodeInput) => sendCodeRequest(input),
    []
  );

  const value = useMemo(
    () => ({ user, loading, sendCode, register, login, resetPassword, logout }),
    [user, loading, sendCode, register, login, resetPassword, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 必须在 <AuthProvider> 内使用");
  return ctx;
}
