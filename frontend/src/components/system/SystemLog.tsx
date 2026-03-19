import { useState } from 'react';
import { FlaskConical, Loader2, RefreshCw } from 'lucide-react';
import type { SystemInfoData } from '../../hooks/useSystemInfo';
import { systemApi } from '../../services/systemApi';

interface SystemLogProps {
    systemInfo: SystemInfoData;
    onRefresh: () => void;
    isLoading: boolean;
}

/**
 * Displays system info as compact monospace log lines.
 */
export const SystemLog = ({ systemInfo, onRefresh, isLoading }: SystemLogProps) => {
    const { system, torch, cpu, gpu } = systemInfo;

    const [gpuDevices, setGpuDevices] = useState(gpu.gpu_devices);
    const [loadingGpu, setLoadingGpu] = useState(false);

    const [testLines, setTestLines] = useState<string[]>([]);
    const [testing, setTesting] = useState(false);

    const loadGpuDetails = async () => {
        setLoadingGpu(true);
        try {
            const data = await systemApi.getGpuDetails();
            setGpuDevices(data.gpu_devices);
        } finally {
            setLoadingGpu(false);
        }
    };

    const handleTestQwen = async () => {
        setTesting(true);
        setTestLines([]);
        try {
            const res = await systemApi.testQwen();
            const data = await res.json();
            setTestLines(data.results.map((r: { model: string; status: string; message: string }) =>
                `[${r.status.toUpperCase()}] ${r.model}: ${r.message}`
            ));
        } finally {
            setTesting(false);
        }
    };

    const gpuStatus = torch.cuda_available
        ? `CUDA ${torch.cuda_version} — available`
        : torch.mps_available
        ? 'MPS (Apple Silicon) — available'
        : 'No GPU acceleration';

    const lines = [
        `platform     ${system.platform} ${system.platform_release}`,
        `python       ${system.python_version}`,
        `pytorch      ${torch.version}`,
        `─`,
        `gpu          ${gpuStatus}`,
        ...gpuDevices.map(d =>
            `  [${d.index}] ${d.name}  cc=${d.compute_capability}  vram=${d.memory_total}`
        ),
        `─`,
        `cpu cores    ${cpu.physical_cores} physical / ${cpu.logical_cores} logical`,
        `cpu usage    ${cpu.cpu_percent}%`,
        `ram total    ${cpu.memory_total_gb.toFixed(1)} GB`,
        `ram free     ${cpu.memory_available_gb.toFixed(1)} GB`,
        ...testLines.map(l => `─\n${l}`),
    ];

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 justify-end">
                {torch.cuda_available && (
                    <button
                        onClick={loadGpuDetails}
                        disabled={loadingGpu}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-700/60 rounded-lg border border-slate-700/40 transition disabled:opacity-50"
                    >
                        {loadingGpu ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                        GPU details
                    </button>
                )}
                <button
                    onClick={handleTestQwen}
                    disabled={testing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-700/60 rounded-lg border border-slate-700/40 transition disabled:opacity-50"
                >
                    {testing ? <Loader2 size={12} className="animate-spin" /> : <FlaskConical size={12} />}
                    Test Qwen3
                </button>
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-700/60 rounded-lg border border-slate-700/40 transition disabled:opacity-50"
                >
                    {isLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                    Refresh
                </button>
            </div>

            <pre className="bg-slate-950/60 border border-slate-700/40 rounded-xl p-4 text-xs text-slate-400 font-mono leading-relaxed whitespace-pre overflow-x-auto">
                {lines.map((line, i) =>
                    line === '─'
                        ? <span key={i} className="block text-slate-700">{'─'.repeat(48)}</span>
                        : <span key={i} className="block">{line}</span>
                )}
            </pre>
        </div>
    );
};
