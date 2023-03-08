import { ref, set, onDisconnect } from "firebase/database";
import { useEffect } from "react";
import { DATABASE } from "../utils";

export function usePresence({ usersPath }: { usersPath: string }) {
  useEffect(() => {
    const reference = ref(DATABASE, usersPath);

    set(reference, true).catch((error) => {
      console.error(`Error setting presence: ${error}`);
    });

    const od = onDisconnect(reference);
    od.set(false).catch((error) => {
      console.error(`Error setting onDisconnect: ${error}`);
    });

    return () => {
      od.cancel().catch((error) => {
        console.error(`Error canceling onDisconnect: ${error}`);
      });
      set(reference, false).catch((error) => {
        console.error(`Error resetting presence: ${error}`);
      });
    };
  }, [usersPath]);
}
