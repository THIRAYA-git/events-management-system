import { useEffect, useState } from "react";
import { DatabaseBackup, Loader2, Trash2 } from "lucide-react";
import { listBackups, runBackup, deleteBackup } from "@/api/backup.api";
import type { BackupFile } from "@/types/backup.types";
import { Button } from "@/components/ui/button";

const formatSize = (b: number) =>
  b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.ceil(b / 1024)} KB`;

export default function AdminBackupsPage() {
  const [files, setFiles] = useState<BackupFile[]>([]);
  const [running, setRunning] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = async () => {
    try {
      setFiles(await listBackups());
    } catch {
      setMsg({ ok: false, text: "Could not load backups" });
    }
  };

  useEffect(() => { load(); }, []);

  const handleRun = async () => {
    setRunning(true);
    setMsg(null);
    try {
      const r = await runBackup();
      setMsg({ ok: true, text: `Backup created: ${r.file}` });
      await load();
    } catch (e: any) {
      setMsg({ ok: false, text: e?.response?.data?.message || "Backup failed" });
    } finally {
      setRunning(false);
    }
  };

  const handleDelete = async (file: string) => {
    if (!window.confirm(`Delete backup "${file}"? This cannot be undone.`)) return;
    setDeleting(file);
    setMsg(null);
    try {
      await deleteBackup(file);
      setMsg({ ok: true, text: `Backup deleted: ${file}` });
      await load();
    } catch (e: any) {
      setMsg({ ok: false, text: e?.response?.data?.message || "Could not delete backup" });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Database Backups</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Automatic backup runs nightly at 02:00. The last 7 are kept.
          </p>
        </div>
        <Button onClick={handleRun} disabled={running}>
          {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DatabaseBackup className="mr-2 h-4 w-4" />}
          {running ? "Backing up..." : "Run backup now"}
        </Button>
      </div>

      {msg && (
        <div className={`rounded-md border px-4 py-2 text-sm ${
          msg.ok
            ? "border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-200"
            : "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200"
        }`}>
          {msg.text}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <tr>
              <th className="px-4 py-2">File</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2">Size</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {files.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  No backups yet
                </td>
              </tr>
            )}
            {files.map((f) => (
              <tr key={f.file} className="text-gray-900 dark:text-gray-100">
                <td className="px-4 py-2 font-mono">{f.file}</td>
                <td className="px-4 py-2">{new Date(f.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2">{formatSize(f.sizeBytes)}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => handleDelete(f.file)}
                    disabled={deleting === f.file}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/30"
                    aria-label={`Delete ${f.file}`}
                    title="Delete backup"
                  >
                    {deleting === f.file ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span>Delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
