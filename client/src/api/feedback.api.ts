import { api } from "@/lib/api";
import type {
  Feedback,
  CreateFeedbackPayload,
  FeedbackListParams,
  FeedbackListResponse,
  AdminFeedback,
  AdminFeedbackListResponse,
  AdminFeedbackQuery,
  FeedbackSummary,
} from "@/types/feedback.types";

export const submitFeedback = async (
  payload: CreateFeedbackPayload
): Promise<Feedback> => {
  const { data } = await api.post("/feedback", payload);
  return data.feedback;
};

export const listFeedback = async (
  params?: FeedbackListParams
): Promise<FeedbackListResponse> => {
  const { data } = await api.get("/feedback", { params });
  return data;
};

export const respondToFeedback = async (
  feedbackId: number,
  adminReply: string
): Promise<Feedback> => {
  const { data } = await api.patch(`/feedback/${feedbackId}/reply`, {
    admin_reply: adminReply,
  });
  return data.feedback;
};

export const listAdminFeedback = async (
  params: AdminFeedbackQuery = {}
): Promise<AdminFeedbackListResponse> => {
  const { data } = await api.get<AdminFeedbackListResponse>("/feedback", {
    params,
  });
  return data;
};

export const getAdminFeedbackSummary = async (): Promise<FeedbackSummary> => {
  const { data } = await api.get<{ summary: FeedbackSummary }>(
    "/feedback/summary"
  );
  return data.summary;
};

export const replyToFeedback = async (
  feedbackId: number,
  admin_reply: string
): Promise<AdminFeedback> => {
  const { data } = await api.patch<{ feedback: AdminFeedback }>(
    `/feedback/${feedbackId}/reply`,
    { admin_reply }
  );
  return data.feedback;
};

export const setFeedbackVisibility = async (
  feedbackId: number,
  is_public: boolean
): Promise<AdminFeedback> => {
  const { data } = await api.patch<{ feedback: AdminFeedback }>(
    `/feedback/${feedbackId}/visibility`,
    { is_public }
  );
  return data.feedback;
};
