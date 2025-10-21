import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useCallback } from "react";

export function useAuthGate() {
  const navigate = useNavigate();

  const check = useCallback(async (): Promise<{ ok: boolean; currentField?: string | null }> => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      navigate("/signin");
      return { ok: false };
    }
    try {
      const data = await api.get<{ hasField: boolean; currentField?: string | null }>(endpoints.checkField());
      if (!data.hasField) {
        navigate("/change-field");
        return { ok: false };
      }
      return { ok: true, currentField: data.currentField ?? null };
    } catch (e: any) {
      if (String(e?.message || "").includes("HTTP 401") || String(e?.message || "").includes("HTTP 403")) {
        navigate("/signin");
      }
      return { ok: false };
    }
  }, [navigate]);

  return { check };
}
