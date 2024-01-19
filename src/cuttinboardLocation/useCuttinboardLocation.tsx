import { useContext } from "react";
import { ILocationContextProps, LocationContext } from "./LocationProvider";
import { ILocation } from "@rodez97/types-helpers";

export const useCuttinboardLocation = (): ILocationContextProps & {
  location: ILocation;
} => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  if (!context.location) {
    throw new Error("No location found.");
  }

  return { ...context, location: context.location };
};

export const useCuttinboardLocationRaw = (): ILocationContextProps => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
