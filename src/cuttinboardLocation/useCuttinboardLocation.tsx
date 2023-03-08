import { useContext } from "react";
import { LocationContext } from "./LocationProvider";

export const useCuttinboardLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  if (!context.location) {
    throw new Error("No location found.");
  }

  return { ...context, location: context.location };
};

export const useCuttinboardLocationRaw = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
