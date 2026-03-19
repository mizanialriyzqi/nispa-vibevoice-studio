import { useState, useEffect, useCallback } from 'react';
import { Database, HardDrive, Trash2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { systemApi } from '../../services/systemApi';
import type { MaintenanceStats, OrphanFolder } from '../../services/systemApi';

/**
 * Maintenance panel: DB vacuum, orphaned audio file cleanup.
 */
export const MaintenanceTab = () => {
    const [stats, setStats] = useState<MaintenanceStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);

    const [orphans, setOrphans] = useState<OrphanFolder[] | null>(null);
    const [orphanTotal, setOrphanTotal] = useState(0);
    const [loadingOrphans, setLoadingOrphans] = useState(false);

    const [vacuumResult, setVacuumResult] = useState<{ saved_mb: number; size_after_mb: number } | null>(null);
    const [vacuuming, setVacuuming] = useState(false);

    const [deleting, setDeleting] = useState(false);
    const [deleteResult, setDeleteResult] = useState<{ freed_mb: number; count: number } | null>(null);

    const [error, setError] = useState<string | null>(null);

    const loadStats = useCallback(async () => {
        setLoadingStats(true);
        setError(null);
        try {
            const data = await systemApi.getMaintenanceStats();
            setStats(data);
        } catch {
            setError('Failed to load maintenance stats');
        } finally {
            setLoadingStats(false);
        }
    }, []);

    useEffect(() => { loadStats(); }, [loadStats]);

    const handleVacuum = async () => {
        setVacuuming(true);
        setVacuumResult(null);
        setError(null);
        try {
            const res = await systemApi.vacuumDb();
            const data = await res.json();
            setVacuumResult({ saved_mb: data.saved_mb, size_after_mb: data.size_after_mb });
            // Reload stats to reflect new DB size
            await loadStats();
        } catch {
            setError('VACUUM failed');
        } finally {
            setVacuuming(false);
        }
    };

    const handleScanOrphans = async () => {
        setLoadingOrphans(true);
        setOrphans(null);
        setDeleteResult(null);
        setError(null);
        try {
            const data = await systemApi.listOrphanAudio();
            setOrphans(data.orphans);
            setOrphanTotal(data.total_mb);
        } catch {
            setError('Scan failed');
        } finally {
            setLoadingOrphans(false);
        }
    };

    const handleDeleteOrphans = async () => {
        setDeleting(true);
        setError(null);
        try {
            const res = await systemApi.deleteOrphanAudio();
            const data = await res.json();
            setDeleteResult({ freed_mb: data.total_freed_mb, count: data.deleted.length });
            setOrphans([]);
            setOrphanTotal(0);
            await loadStats();
        } catch {
            setError('Deletion failed');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-3 flex items-center gap-2 text-red-300 text-sm">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                </div>
            )}

            {/* Database section */}
            <section className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                    <Database size={18} className="text-indigo-400" />
                    Database
                </div>

                {loadingStats ? (
                    <div className="text-slate-400 text-sm animate-pulse">Loading…</div>
                ) : stats ? (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <StatCard label="Jobs" value={String(stats.job_count)} />
                        <StatCard label="DB size" value={`${stats.db_size_mb} MB`} />
                    </div>
                ) : null}

                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={handleVacuum}
                        disabled={vacuuming}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg text-sm transition font-medium"
                    >
                        {vacuuming ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />}
                        VACUUM Database
                    </button>

                    {vacuumResult && (
                        <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
                            <CheckCircle size={14} />
                            Freed {vacuumResult.saved_mb} MB → now {vacuumResult.size_after_mb} MB
                        </span>
                    )}
                </div>

                <p className="text-slate-500 text-xs">
                    SQLite doesn't release disk space automatically after deletions. VACUUM rewrites the file and recovers space.
                </p>
            </section>

            {/* Audio files section */}
            <section className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                    <HardDrive size={18} className="text-amber-400" />
                    Audio Rendering Files
                </div>

                {stats && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <StatCard label="Folders on disk" value={String(stats.audio_folder_count)} />
                        <StatCard label="Total size" value={`${stats.audio_size_mb} MB`} />
                    </div>
                )}

                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={handleScanOrphans}
                        disabled={loadingOrphans}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 rounded-lg text-sm transition font-medium"
                    >
                        {loadingOrphans ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        Scan for Orphans
                    </button>

                    {orphans !== null && orphans.length > 0 && (
                        <button
                            onClick={handleDeleteOrphans}
                            disabled={deleting}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg text-sm transition font-medium"
                        >
                            {deleting ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            Delete {orphans.length} orphan{orphans.length !== 1 ? 's' : ''} ({orphanTotal} MB)
                        </button>
                    )}
                </div>

                {deleteResult && (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
                        <CheckCircle size={14} />
                        Deleted {deleteResult.count} folder{deleteResult.count !== 1 ? 's' : ''}, freed {deleteResult.freed_mb} MB
                    </div>
                )}

                {orphans !== null && orphans.length === 0 && !deleteResult && (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
                        <CheckCircle size={14} />
                        No orphaned folders found.
                    </div>
                )}

                {orphans !== null && orphans.length > 0 && (
                    <ul className="space-y-1 max-h-40 overflow-y-auto text-xs text-slate-400 border border-slate-700/40 rounded-lg p-3">
                        {orphans.map(o => (
                            <li key={o.folder} className="flex justify-between">
                                <span className="font-mono truncate">{o.folder}</span>
                                <span className="text-slate-500 shrink-0 ml-3">{o.size_mb} MB</span>
                            </li>
                        ))}
                    </ul>
                )}

                <p className="text-slate-500 text-xs">
                    Orphaned folders are audio files on disk whose job has been deleted from the database.
                </p>
            </section>
        </div>
    );
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-slate-900/60 border border-slate-700/30 rounded-lg px-4 py-3">
        <div className="text-slate-400 text-xs mb-1">{label}</div>
        <div className="text-slate-100 font-semibold">{value}</div>
    </div>
);
