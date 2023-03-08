export interface LoadingStatus {
  loading: "idle" | "succeeded" | "failed" | "pending";
  error?: string;
}
