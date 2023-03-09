import {
  createSlice,
  Dispatch,
  Reducer,
  createEntityAdapter,
  EntityState,
} from "@reduxjs/toolkit";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { FIRESTORE } from "../utils";
import { AppThunk, RootState } from "../reduxStore/utils";
import {
  EmployeeLocationInfo,
  getEmployeeFullName,
  IEmployee,
} from "@cuttinboard-solutions/types-helpers";
import { employeeConverter } from "./Employee";

const employeesAdapter = createEntityAdapter<IEmployee>({
  sortComparer: (a, b) => {
    const aRole = a.role;
    const aFullName = getEmployeeFullName(a);
    const bRole = b.role;
    const bFullName = getEmployeeFullName(b);
    if (aRole !== bRole) {
      return Number(aRole) - Number(bRole);
    }
    return aFullName.localeCompare(bFullName);
  },
});

export const deleteEmployeeThunk =
  (employee: IEmployee): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const docRef = doc(FIRESTORE, employee.refPath).withConverter(
      employeeConverter
    );

    // Delete the employee from the local state
    dispatch(deleteEmployee(employee.id));
    try {
      await deleteDoc(docRef);
    } catch (error) {
      dispatch(addEmployee(employee));
      throw error;
    }
  };

export const updateEmployeeThunk =
  (
    employee: IEmployee,
    locationUpdates: Partial<EmployeeLocationInfo>
  ): AppThunk<Promise<void>> =>
  async (dispatch) => {
    // Update the employee on the server
    const docRef = doc(FIRESTORE, employee.refPath).withConverter(
      employeeConverter
    );

    const updatedEmployee = { ...employee, ...locationUpdates };

    // Update the employee in the local state
    dispatch(upsertEmployee(updatedEmployee));
    try {
      await setDoc(docRef, locationUpdates, {
        merge: true,
      });
    } catch (error) {
      dispatch(upsertEmployee(employee));
      throw error;
    }
  };

const employeesSlice = createSlice({
  name: "employees",
  initialState: employeesAdapter.getInitialState(),
  reducers: {
    setEmployees: employeesAdapter.setAll,
    addEmployee: employeesAdapter.addOne,
    deleteEmployee: employeesAdapter.removeOne,
    updateEmployee: employeesAdapter.updateOne,
    upsertEmployee: employeesAdapter.upsertOne,
  },
});

export const {
  setEmployees,
  addEmployee,
  deleteEmployee,
  updateEmployee,
  upsertEmployee,
} = employeesSlice.actions;

export type EmployeesActions =
  | ReturnType<typeof setEmployees>
  | ReturnType<typeof addEmployee>
  | ReturnType<typeof deleteEmployee>
  | ReturnType<typeof updateEmployee>
  | ReturnType<typeof upsertEmployee>;

export const employeesReducer: Reducer<
  EntityState<IEmployee>,
  EmployeesActions
> = employeesSlice.reducer;

export const useEmployeesDispatch = () =>
  useDispatch<Dispatch<EmployeesActions>>();

export const employeesSelectors = employeesAdapter.getSelectors<RootState>(
  (state) => state.employees
);
