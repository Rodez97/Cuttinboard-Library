import { ref, set, onDisconnect } from "firebase/database";
import { useEffect } from "react";
import { DATABASE } from "../utils";

export function usePresence(
  accessPath: string | null | undefined,
  options?: {
    disconnected?: () => void;
    connected?: () => void;
  }
) {
  useEffect(() => {
    if (!accessPath) {
      return;
    }
    const reference = ref(DATABASE, accessPath);
    set(reference, true);
    options?.connected?.();

    const od = onDisconnect(reference);
    od.set(false);

    return () => {
      od.cancel();
      set(reference, false);
      options?.disconnected?.();
    };
  }, [accessPath]);
}
