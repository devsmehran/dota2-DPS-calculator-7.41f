import React, { useState } from 'react';
import { X, Shield, Check } from 'lucide-react';
import { TargetDummy } from '../types';
import { calculateArmorMultiplier } from '../engine/formulas';

interface TargetEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTarget: TargetDummy;
  onSaveTarget: (target: TargetDummy) => void;
}

export const TargetEditorModal: React.FC<TargetEditorModalProps> = ({
  isOpen,
  onClose,
  currentTarget,
  onSaveTarget
}) => {
  const [armor, setArmor] = useState<number>(currentTarget.armor);
  const [magicResPercent, setMagicResPercent] = useState<number>(
    Math.round(currentTarget.magicResistance * 100)
  );
  const [evasionPercent, setEvasionPercent] = useState<number>(
    Math.round(currentTarget.evasion * 100)
  );
  const [maxHp, setMaxHp] = useState<number>(currentTarget.maxHp);
  const [isImmortal, setIsImmortal] = useState<boolean>(currentTarget.isImmortal);

  if (!isOpen) return null;

  const currentArmorMultiplier = calculateArmorMultiplier(armor);
  const damageReductionPercent = Math.round((1 - currentArmorMultiplier) * 1000) / 10;

  const handleSave = () => {
    onSaveTarget({
      name: `Custom Target (${armor} Armor, ${magicResPercent}% Res)`,
      armor,
      magicResistance: magicResPercent / 100,
      evasion: evasionPercent / 100,
      maxHp: isImmortal ? 1000000 : maxHp,
      isImmortal,
      hpRegen: 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-lg shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100 font-mono">
              Custom Target Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs font-mono">
          {/* Armor input */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Target Armor:</span>
              <span className="text-cyan-400 font-bold">{armor}</span>
            </div>
            <input
              type="range"
              min="-20"
              max="100"
              step="1"
              value={armor}
              onChange={e => setArmor(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="text-[11px] text-slate-400 flex justify-between">
              <span>Physical Multiplier: {Math.round(currentArmorMultiplier * 1000) / 1000}x</span>
              <span className={damageReductionPercent >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                {damageReductionPercent >= 0 ? `Reduction: ${damageReductionPercent}%` : `Amplification: +${Math.abs(damageReductionPercent)}%`}
              </span>
            </div>
          </div>

          {/* Magic Resistance */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Magic Resistance (%):</span>
              <span className="text-cyan-400 font-bold">{magicResPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={magicResPercent}
              onChange={e => setMagicResPercent(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="text-[11px] text-slate-400">
              Magical Damage Taken: {100 - magicResPercent}% (Base Hero is 25%)
            </div>
          </div>

          {/* Evasion */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Target Evasion (%):</span>
              <span className="text-cyan-400 font-bold">{evasionPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={evasionPercent}
              onChange={e => setEvasionPercent(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="text-[11px] text-slate-400">
              Monkey King Bar provides 80% Pierce to ignore evasion.
            </div>
          </div>

          {/* Immortal vs Finite HP */}
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded space-y-3">
            <label className="flex items-center gap-2 cursor-pointer text-slate-200">
              <input
                type="checkbox"
                checked={isImmortal}
                onChange={e => setIsImmortal(e.target.checked)}
                className="rounded text-cyan-500 focus:ring-0"
              />
              <span className="font-semibold">Immortal Target Dummy (Infinite HP)</span>
            </label>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Immortal mode prevents premature target death from distorting DPS comparisons over fixed simulation windows.
            </p>

            {!isImmortal && (
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Target Max HP:</span>
                  <span className="text-cyan-400 font-bold">{maxHp.toLocaleString()} HP</span>
                </div>
                <input
                  type="number"
                  min="500"
                  max="50000"
                  step="500"
                  value={maxHp}
                  onChange={e => setMaxHp(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors"
          >
            <Check className="w-4 h-4" />
            Apply Target
          </button>
        </div>
      </div>
    </div>
  );
};
