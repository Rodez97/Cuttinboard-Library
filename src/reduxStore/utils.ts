import {
  AnyAction,
  Dispatch,
  ThunkAction,
  ThunkDispatch,
} from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { TypedUseSelectorHook, useSelector } from "react-redux";
import { appReducer } from "./appReducer";

export type RootState = ReturnType<typeof appReducer>;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const rootReducer = (state: RootState, action: AnyAction) =>
  appReducer(action.type === "RESET" ? undefined : state, action);

export const useAppDispatch = () => useDispatch<Dispatch<AnyAction>>();

export const useAppThunkDispatch = () =>
  useDispatch<ThunkDispatch<RootState, void, AnyAction>>();

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;
