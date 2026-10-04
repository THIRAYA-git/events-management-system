import { api } from "@/lib/api";
import type { Report, ReportPeriod } from "@/types/report.types";

export const getReport = async (params: {
  period: ReportPeriod;
  date?: string;
}): Promise<Report> => {
  const res = await api.get<{ report: Report }>("/reports", { params });
  return res.data.report;
};

// FR-022: PDF export. Fetched as a blob so the auth header is sent.
export const downloadReportPdf = async (params: {
  period: ReportPeriod;
  date?: string;
}): Promise<Blob> => {
  const res = await api.get<Blob>("/reports/export", {
    params,
    responseType: "blob",
  });
  return res.data;
};