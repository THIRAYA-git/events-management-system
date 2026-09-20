import { api } from "@/lib/api";
import type {
  Feedback,
  CreateFeedbackPayload,
  FeedbackListParams,
  FeedbackListResponse,
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