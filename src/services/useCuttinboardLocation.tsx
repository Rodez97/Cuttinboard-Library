import { useContext } from "react";
import { LocationContext } from "./LocationProvider";

export const useCuttinboardLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
