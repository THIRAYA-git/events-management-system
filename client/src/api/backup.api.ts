import { api } from "@/lib/api";
import type { BackupFile } from "@/types/backup.types";

export const listBackups = async (): Promise<BackupFile[]> =>
  (await api.get("/admin/backups")).data.data;

export const runBackup = async () =>
  (await api.post("/admin/backups")).data.data;

export const deleteBackup = async (file: string) =>
  (await api.delete(`/admin/backups/${encodeURIComponent(file)}`)).data;