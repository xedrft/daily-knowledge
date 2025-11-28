import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useCallback, useRef } from "react";
import { toaster } from "@/components/ui/toaster";

export function useAuthGate() {
  const navigate = useNavigate();
  const hasShownToast = useRef(false);

  const check = useCallback(async (): Promise<{ ok: boolean; currentField?: string | null }> => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      navigate("/signin");
      return { ok: false };
    }
    try {
      const data = await api.get<{ hasField: boolean; currentField?: string | null; onboardingComplete?: boolean }>(endpoints.checkField());
      if (!data.onboardingComplete || !data.hasField) {
        navigate("/onboarding");
        return { ok: false };
      }
      return { ok: true, currentField: data.currentField ?? null };
    } catch (e: any) {
      if (String(e?.message || "").includes("HTTP 401") || String(e?.message || "").includes("HTTP 403")) {
        localStorage.removeItem("jwt");
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          toaster.create({
            title: "Session expired",
            description: "Please sign in again.",
            type: "info",
            duration: 3000,
          });
        }
        navigate("/");
      }
      return { ok: false };
    }
  }, [navigate]);

  return { check };
}
