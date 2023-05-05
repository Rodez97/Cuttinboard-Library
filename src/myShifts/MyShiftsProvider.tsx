import { IShift } from "@cuttinboard-solutions/types-helpers";
import React, { ReactNode } from "react";
import { useMyShiftsData } from "./useMyShiftsData";

export interface MyShiftsProviderProps {
  children: ReactNode;
  weekId: string;
  locationId?: string;
}

export interface MyShiftsContextProps {
  loading: boolean;
  error?: Error | undefined;
  groupedByDay: [string, IShift[]][];
  onlyLocation: boolean;
  setOnlyLocation: (value: boolean) => void;
  myShifts: IShift[];
}

export const MyShiftsContext = React.createContext<MyShiftsContextProps>(
  {} as MyShiftsContextProps
);

export function MyShiftsProvider({
  children,
  weekId,
  locationId,
}: MyShiftsProviderProps) {
  const context = useMyShiftsData(weekId, locationId);
  return (
    <MyShiftsContext.Provider value={context}>
      {children}
    </MyShiftsContext.Provider>
  );
}

export function useMyShifts(): MyShiftsContextProps {
  const context = React.useContext(MyShiftsContext);
  if (context === undefined) {
    throw new Error("useMyShifts must be used within a MyShiftsProvider");
  }
  return context;
}
