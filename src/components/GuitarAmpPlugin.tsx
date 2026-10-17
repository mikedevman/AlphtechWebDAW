import React from 'react';
import { X, Power, Flame, Sliders, Volume2 } from 'lucide-react';
import { Knob } from './Knob';
import type { TrackData, TrackAmpSettings } from '../dsp/DawAudioEngine';
import type { TubeMode } from '../dsp/TubeShaper';
import { FACTORY_PRESETS } from '../dsp/presets';

interface GuitarAmpPluginProps {
  track: TrackData;
  onClose: () => void;
  onUpdateSettings: (settings: TrackAmpSettings) => void;
  onRemovePlugin: () => void;
}

export const GuitarAmpPlugin: React.FC<GuitarAmpPluginProps> = ({
  track,
  onClose,
  onUpdateSettings,
  onRemovePlugin,
}) => {
  const amp = track.ampSettings;
  const tubeGlow = Math.min(1.0, 0.2 + (amp.drive / 30.0) * 0.8);

  const handleModeChange = (mode: TubeMode) => {
    onUpdateSettings({ ...amp, mode });
  };

  const handleDriveChange = (drive: number) => {
    onUpdateSettings({ ...amp, drive });
  };

  const handleTrimChange = (trimDb: number) => {
    onUpdateSettings({ ...amp, trimDb });
  };

  const handleBassChange = (bassDb: number) => {
    onUpdateSettings({ ...amp, bassDb });
  };

  const handleMidChange = (midDb: number) => {
    onUpdateSettings({ ...amp, midDb });
  };

  const handleTrebleChange = (trebleDb: number) => {
    onUpdateSettings({ ...amp, trebleDb });
  };

  const handleMasterChange = (masterDb: number) => {
    onUpdateSettings({ ...amp, masterDb });
  };

  const handleTogglePower = () => {
    onUpdateSettings({ ...amp, enabled: !amp.enabled });
  };

  const handlePresetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = FACTORY_PRESETS.find((p) => p.id === e.target.value);
    if (selected) {
      onUpdateSettings({
        ...amp,
        mode: selected.mode,
        drive: selected.drive,
        trimDb: selected.trimDb,
        bassDb: selected.bassDb,
        midDb: selected.midDb,
        trebleDb: selected.trebleDb,
        masterDb: selected.masterDb,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Plugin Window Chassis */}
      <div className="w-full max-w-2xl bg-[#15171d] border-2 border-[#333a4a] rounded-xl shadow-2xl overflow-hidden flex flex-col select-none animate-in fade-in zoom-in-95 duration-100">
        {/* Plugin Title Bar */}
        <div className="bg-[#1c202a] px-4 py-2.5 border-b border-[#2e3444] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-3 h-3 rounded-full bg-[#ff7700] shadow-[0_0_8px_rgba(255,119,0,0.8)]" />
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm tracking-wider text-slate-100">
                ALPHTECH <span className="text-[#ff7700]">TUBE AMP</span>
              </span>
              <span className="text-[10px] font-mono bg-[#111318] text-slate-400 px-2 py-0.5 rounded border border-[#2b3140]">
                Insert: {track.name} (Track {track.number})
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Bypass / Power Button */}
            <button
              onClick={handleTogglePower}
              title={amp.enabled ? 'Bypass Plugin' : 'Activate Plugin'}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                amp.enabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {amp.enabled ? 'ACTIVE' : 'BYPASS'}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded hover:bg-[#2b3140] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Plugin Body */}
        <div className="p-6 space-y-6 bg-gradient-to-b from-[#181a22] to-[#111318]">
          {/* Header Controls: Presets Dropdown & Saturation Modes */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0f1116] p-3 rounded-lg border border-[#262c3a]">
            {/* Presets */}
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-[#ff7700]" />
              <span className="text-xs font-bold text-slate-300 uppercase">Tone Preset:</span>
              <select
                onChange={handlePresetSelect}
                defaultValue="british-crunch"
                className="bg-[#1b1f29] text-slate-100 border border-[#30384a] rounded px-2 py-1 text-xs font-mono focus:outline-none cursor-pointer"
              >
                {FACTORY_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Selectors */}
            <div className="flex items-center space-x-1 bg-[#191d26] p-1 rounded border border-[#2b3242]">
              {(['warm', 'crunch', 'lead', 'bypass'] as TubeMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleModeChange(mode)}
                  className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-all ${
                    amp.mode === mode
                      ? 'bg-[#ff7700] text-black shadow-sm font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Center Rack: Controls + Vacuum Tube Visual */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Tube Preamp Controls (Drive & Trim) */}
            <div className="md:col-span-5 bg-[#0e1015] p-4 rounded-xl border border-[#242a38] flex items-center justify-around gap-2 shadow-inner">
              <Knob
                label="Trim"
                value={amp.trimDb}
                min={-12}
                max={18}
                unit="dB"
                defaultValue={0}
                glowColor="#38bdf8"
                onChange={handleTrimChange}
              />

              {/* Center Glowing Vacuum Tube */}
              <div className="flex flex-col items-center">
                <div
                  className="w-12 h-24 rounded-t-full bg-gradient-to-b from-[#26211a] via-[#16130f] to-[#0d0d10] border border-amber-900/50 shadow-xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300"
                  style={{
                    boxShadow: amp.enabled
                      ? `0 0 ${tubeGlow * 25}px rgba(255, 119, 0, ${tubeGlow * 0.7})`
                      : 'none',
                  }}
                >
                  {/* Glowing Filament */}
                  <div
                    className="w-2 h-14 rounded-full transition-all duration-150"
                    style={{
                      backgroundColor: `rgb(255, ${Math.floor(140 + tubeGlow * 90)}, 0)`,
                      boxShadow: `0 0 12px rgba(255, 119, 0, ${tubeGlow})`,
                      opacity: amp.enabled && amp.mode !== 'bypass' ? tubeGlow : 0.15,
                    }}
                  />
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase">12AX7 Valve</span>
              </div>

              <Knob
                label="Drive"
                value={amp.drive}
                min={1.0}
                max={30.0}
                step={0.5}
                defaultValue={7.5}
                glowColor="#ff7700"
                onChange={handleDriveChange}
              />
            </div>

            {/* 3-Band EQ */}
            <div className="md:col-span-5 bg-[#0e1015] p-4 rounded-xl border border-[#242a38] flex items-center justify-around gap-2 shadow-inner">
              <Knob
                label="Bass"
                value={amp.bassDb}
                min={-12}
                max={12}
                unit="dB"
                defaultValue={0}
                glowColor="#10b981"
                onChange={handleBassChange}
              />
              <Knob
                label="Mid"
                value={amp.midDb}
                min={-12}
                max={12}
                unit="dB"
                defaultValue={0}
                glowColor="#facc15"
                onChange={handleMidChange}
              />
              <Knob
                label="Treble"
                value={amp.trebleDb}
                min={-12}
                max={12}
                unit="dB"
                defaultValue={0}
                glowColor="#ec4899"
                onChange={handleTrebleChange}
              />
            </div>

            {/* Master Knob */}
            <div className="md:col-span-2 bg-[#0e1015] p-4 rounded-xl border border-[#242a38] flex flex-col items-center justify-center shadow-inner">
              <Knob
                label="Master"
                value={amp.masterDb}
                min={-30}
                max={6}
                unit="dB"
                defaultValue={0}
                glowColor="#38bdf8"
                onChange={handleMasterChange}
              />
            </div>
          </div>

          {/* Plugin Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-[#232834] text-xs">
            <button
              onClick={onRemovePlugin}
              className="text-red-400 hover:text-red-300 font-medium transition-colors"
            >
              Remove Plugin from Track
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-md bg-[#232834] hover:bg-[#2d3444] text-slate-200 font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
