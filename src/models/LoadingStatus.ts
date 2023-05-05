export type LoadingStatus = {
  loading: "idle" | "succeeded" | "failed" | "pending";
  error?: string;
};
