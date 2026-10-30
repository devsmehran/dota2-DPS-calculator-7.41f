import React, { useState } from 'react';
import { X, ExternalLink, Download, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { PATCH_741F_METADATA } from '../data/patch741f';
import { HERO_ROSTER } from '../data/heroes';

interface DataReadinessDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataReadinessDrawer: React.FC<DataReadinessDrawerProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'provenance' | 'changes' | 'formulas' | 'hero_coverage'>('provenance');

  if (!isOpen) return null;

  const exportReport = () => {
    const reportData = {
      patchMetadata: PATCH_741F_METADATA,
      heroVerificationCoverage: HERO_ROSTER.map(h => ({
        heroId: h.id,
        name: h.name,
        primaryAttribute: h.primaryAttribute,
        bat: h.baseAttackTime,
        mechanicsStatus: h.mechanicsStatus,
        notes: h.specialMechanicsDescription
      })),
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dota2-patch-741f-data-readiness-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
                Data-Readiness & Governance
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-mono text-slate-400">
                Patch {PATCH_741F_METADATA.version}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 mt-0.5">
              Empirical Verification & Provenance Report
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportReport}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
              title="Download Data-Readiness Report as JSON"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/30 px-6 gap-6 text-xs font-mono">
          <button
            onClick={() => setActiveTab('provenance')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'provenance'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Authoritative Sources
          </button>
          <button
            onClick={() => setActiveTab('changes')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'changes'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            7.41f Balance Changes
          </button>
          <button
            onClick={() => setActiveTab('formulas')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'formulas'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Mathematical Formulas
          </button>
          <button
            onClick={() => setActiveTab('hero_coverage')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'hero_coverage'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Mechanics Coverage
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'provenance' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Patch Version:</span>
                  <span className="text-cyan-300 font-bold">{PATCH_741F_METADATA.version}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Official Release Date:</span>
                  <span className="text-slate-200">{PATCH_741F_METADATA.releaseDate}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Data Retrieval & Verification Date:</span>
                  <span className="text-slate-200">{PATCH_741F_METADATA.retrievalDate}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Simulation Neutral Items Rule:</span>
                  <span className="text-emerald-400 font-semibold">Strictly Excluded (0 Neutrals)</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-3 font-mono">
                  Authoritative Primary Sources
                </h3>
                <div className="space-y-3">
                  {PATCH_741F_METADATA.authoritativeSources.map((source, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-900/40 border border-slate-800 rounded hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-mono text-cyan-400 font-semibold">
                            {source.organization}
                          </div>
                          <div className="text-sm font-medium text-slate-100 mt-0.5">
                            {source.title}
                          </div>
                        </div>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-cyan-400 transition-colors shrink-0 p-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {source.notes}
                      </p>
                      <div className="text-[11px] font-mono text-slate-500 mt-2 truncate">
                        {source.url}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'changes' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                The following balance changes were documented in Patch 7.41f and are explicitly modeled in this simulation engine:
              </p>
              <div className="space-y-3">
                {PATCH_741F_METADATA.balanceChanges.map((change, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-900/40 border border-slate-800 rounded"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-100">
                        {change.target}
                      </span>
                      <span className="text-xs font-mono text-slate-500 uppercase">
                        {change.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1 font-sans">
                      {change.details}
                    </div>
                    <div className="text-xs font-mono text-amber-400/90 mt-2 bg-amber-950/20 border border-amber-900/30 p-2 rounded">
                      DPS Impact: {change.impactOnDps}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'formulas' && (
            <div className="space-y-5">
              <p className="text-xs text-slate-400">
                Ground-truth mathematical formulas implemented in the discrete-event simulator:
              </p>
              <div className="space-y-4">
                {PATCH_741F_METADATA.verifiedFormulas.map((f, idx) => (
                  <div key={idx} className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-100">
                        {f.name}
                      </h4>
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-950 border border-slate-800/80 rounded font-mono text-xs text-cyan-300 break-words">
                      {f.latex}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {f.explanation}
                    </p>
                    <a
                      href={f.referenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <span>Technical Reference</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'hero_coverage' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Mechanics implementation fidelity across all roster heroes. Heroes with unverified mechanics are explicitly labeled and excluded from authoritative optimum claims.
              </p>
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="px-3 py-2.5">Hero</th>
                      <th className="px-3 py-2.5">BAT</th>
                      <th className="px-3 py-2.5">Passives</th>
                      <th className="px-3 py-2.5">Actives</th>
                      <th className="px-3 py-2.5">Facets</th>
                      <th className="px-3 py-2.5">Talents</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                    {HERO_ROSTER.map(h => (
                      <tr key={h.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="px-3 py-2 font-semibold text-slate-200">
                          {h.name}
                        </td>
                        <td className="px-3 py-2 text-cyan-400">
                          {h.baseAttackTime}s
                        </td>
                        <td className="px-3 py-2">
                          <StatusBadge status={h.mechanicsStatus.passives} />
                        </td>
                        <td className="px-3 py-2">
                          <StatusBadge status={h.mechanicsStatus.actives} />
                        </td>
                        <td className="px-3 py-2">
                          <StatusBadge status={h.mechanicsStatus.facets} />
                        </td>
                        <td className="px-3 py-2">
                          <StatusBadge status={h.mechanicsStatus.talents} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: 'verified' | 'approximate' | 'unsupported' }> = ({ status }) => {
  if (status === 'verified') {
    return (
      <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" />
        Verified
      </span>
    );
  }
  if (status === 'approximate') {
    return (
      <span className="text-amber-400 font-mono text-[11px] flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        Approx
      </span>
    );
  }
  return (
    <span className="text-rose-400 font-mono text-[11px] flex items-center gap-1">
      <HelpCircle className="w-3 h-3" />
      Unverified
    </span>
  );
};
