import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";

export interface IPrimaryShiftData {
  start: string;
  end: string;
  position?: string;
  notes?: string;
  hourlyWage?: number;
}

export interface IShift extends IPrimaryShiftData {
  status: "draft" | "published";
  pendingUpdate?: Partial<IPrimaryShiftData>;
  deleting?: boolean;
  updatedAt: number;
}

export interface ILocalShift extends IShift {
  parentDocId: string;
  id: string;
}

export interface IEmployeeShiftsDocument {
  id: string;
  locationName: string;
  locationId: string;
  weekId: string;
  employeeId: string;
  weekOrderFactor: number;
  shifts: {
    [key: string]: IShift;
  };
}

export const extractShifts = (
  shiftsDoc: IEmployeeShiftsDocument
): ILocalShift[] => {
  if (!shiftsDoc.shifts) {
    return [];
  }

  return Object.entries(shiftsDoc.shifts).map(([shiftId, shift]) => {
    return {
      ...shift,
      id: shiftId,
      parentDocId: shiftsDoc.id,
    };
  });
};

export const shiftConverter = {
  toFirestore(object: IEmployeeShiftsDocument): DocumentData {
    return object;
  },
  fromFirestore(
    value: QueryDocumentSnapshot<IEmployeeShiftsDocument>,
    options: SnapshotOptions
  ): IEmployeeShiftsDocument {
    const rawData = value.data(options);
    return rawData;
  },
};
