import { useState } from 'react';
import { HardDrive, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import type { SystemInfoData } from '../../hooks/useSystemInfo';
import { systemApi } from '../../services/systemApi';

interface GpuStatsProps {
    torch: SystemInfoData['torch'];
    gpu: SystemInfoData['gpu'];
}

export const GpuStats = ({ torch, gpu }: GpuStatsProps) => {
    const [gpuDevices, setGpuDevices] = useState(gpu.gpu_devices);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadGpuDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await systemApi.getGpuDetails();
            setGpuDevices(data.gpu_devices);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load GPU details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-500/10 rounded-lg">
                    <HardDrive className="text-blue-400" size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-100">GPU / Accelerator</h3>
            </div>

            <div className="space-y-4">
                {/* CUDA */}
                <div className="flex items-center gap-4 p-5 bg-slate-900/50 rounded-xl border border-blue-500/30 shadow-[inset_4px_0_0_0_rgba(59,130,246,0.5)]">
                    {torch.cuda_available ? (
                        <>
                            <CheckCircle className="text-emerald-400 flex-shrink-0" size={24} />
                            <div>
                                <p className="font-semibold text-slate-200">CUDA (NVIDIA GPU)</p>
                                <p className="text-sm text-emerald-400/80">Available</p>
                                <p className="text-xs text-slate-500 mt-1 font-mono">Version: {torch.cuda_version}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="text-slate-500 flex-shrink-0" size={24} />
                            <div>
                                <p className="font-semibold text-slate-300">CUDA (NVIDIA GPU)</p>
                                <p className="text-sm text-slate-500">Not available</p>
                            </div>
                        </>
                    )}
                </div>

                {/* MPS */}
                <div className="flex items-center gap-4 p-5 bg-slate-900/50 rounded-xl border border-purple-500/30 shadow-[inset_4px_0_0_0_rgba(168,85,247,0.5)]">
                    {torch.mps_available ? (
                        <>
                            <CheckCircle className="text-emerald-400 flex-shrink-0" size={24} />
                            <div>
                                <p className="font-semibold text-slate-200">MPS (Apple Silicon)</p>
                                <p className="text-sm text-emerald-400/80">Available</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="text-slate-500 flex-shrink-0" size={24} />
                            <div>
                                <p className="font-semibold text-slate-300">MPS (Apple Silicon)</p>
                                <p className="text-sm text-slate-500">Not available</p>
                            </div>
                        </>
                    )}
                </div>

                {/* GPU Device Details — loaded on demand */}
                {torch.cuda_available && (
                    <div className="mt-2">
                        {gpuDevices.length === 0 ? (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={loadGpuDetails}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600/50 rounded-lg text-sm transition disabled:opacity-50"
                                >
                                    {loading
                                        ? <><Loader2 size={14} className="animate-spin" /> Loading GPU details...</>
                                        : <><RefreshCw size={14} /> Load GPU device details</>
                                    }
                                </button>
                                {error && <p className="text-rose-400 text-xs">{error}</p>}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <p className="font-medium text-slate-300">GPU Device Details</p>
                                    <button onClick={loadGpuDetails} disabled={loading} className="text-slate-500 hover:text-slate-300 transition">
                                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                                    </button>
                                </div>
                                {gpuDevices.map((device) => (
                                    <div key={device.index} className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
                                        <p className="font-semibold text-indigo-300 mb-4 pb-2 border-b border-slate-700/50">
                                            {device.name || `GPU ${device.index}`}
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                            <div className="bg-slate-800/50 rounded-lg p-3">
                                                <span className="text-slate-400 text-xs block mb-1">Compute Capability</span>
                                                <p className="text-slate-200 font-medium">{device.compute_capability}</p>
                                            </div>
                                            <div className="bg-slate-800/50 rounded-lg p-3">
                                                <span className="text-slate-400 text-xs block mb-1">Total Memory</span>
                                                <p className="text-slate-200 font-medium">{device.memory_total}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
