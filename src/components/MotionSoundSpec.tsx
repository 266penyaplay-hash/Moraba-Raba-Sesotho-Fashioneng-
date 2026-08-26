import React from 'react';
import { sound } from '../utils/audio';
import { Volume2, Sparkles, Hand, Shield, Wind } from 'lucide-react';

export const MotionSoundSpec: React.FC = () => {
  const motionSpecs = [
    {
      action: 'Selecting a Cow',
      duration: '160 – 220ms',
      curve: 'cubic-bezier(0.16, 1, 0.3, 1)',
      description: 'Cow rises 2–3mm from the board; its contact shadow separates smoothly with zero neon outline.',
    },
    {
      action: 'Gliding Movement',
      duration: '260 – 380ms',
      curve: 'cubic-bezier(0.25, 1, 0.5, 1)',
      description: 'Physical glide along the engraved sandstone groove with depth persistence.',
    },
    {
      action: 'Placing / Settling',
      duration: '140ms settling',
      curve: 'ease-out with 12ms haptic',
      description: 'Tactile compression as the cow rests inside the carved pit with a deep acoustic stone "tok".',
    },
    {
      action: 'Mill Illumination',
      duration: '600ms pulse',
      curve: 'warm antique gold rise',
      description: 'Warm gold fills the engraved groove between the 3 cattle while a low resonant bronze note resonates.',
    },
    {
      action: 'Capturing',
      duration: '320ms gather',
      curve: 'smooth elevation',
      description: 'Opposing cow lifts and relocates to the captor\'s stone stock area without vaporising.',
    },
  ];

  return (
    <div className="w-full space-y-6 text-[#E9E0CE] select-none">
      <div>
        <span className="text-[11px] font-['Space_Grotesk'] tracking-[0.2em] text-[#A98545] uppercase block">
          DELIVERABLE 08
        </span>
        <h2 className="font-['Syne'] font-extrabold text-xl text-[#F4EAD7] tracking-tight uppercase">
          Motion & Sound Identity
        </h2>
        <p className="text-xs text-[#8C9090] mt-1">
          Acoustic resonance and weighted physical response specification.
        </p>
      </div>

      {/* Interactive Sound Test Pads */}
      <div className="space-y-3">
        <h3 className="font-['Syne'] font-bold text-sm text-[#D1AF7A] uppercase tracking-wider">
          Tactile Audio Test Chamber
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => sound.playPlace()}
            className="flex items-center justify-between p-3 rounded-xl bg-[#171714] hover:bg-[#252522] border border-[#252522] text-left transition-all active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#252522] flex items-center justify-center text-[#D1AF7A]">
                <Hand className="w-4 h-4" />
              </div>
              <div>
                <span className="font-['Space_Grotesk'] font-bold text-xs text-[#F4EAD7] block">
                  Stone "Tok" Contact
                </span>
                <span className="text-[10px] text-[#8C9090]">Lesotho slate placement tap</span>
              </div>
            </div>
            <Volume2 className="w-4 h-4 text-[#A98545]" />
          </button>

          <button
            onClick={() => sound.playMill()}
            className="flex items-center justify-between p-3 rounded-xl bg-[#171714] hover:bg-[#252522] border border-[#252522] text-left transition-all active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#321A12] flex items-center justify-center text-[#C7A864]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-['Space_Grotesk'] font-bold text-xs text-[#C7A864] block">
                  Resonant Bronze Mill
                </span>
                <span className="text-[10px] text-[#8C9090]">196Hz G3 ceremonial bell chord</span>
              </div>
            </div>
            <Volume2 className="w-4 h-4 text-[#C7A864]" />
          </button>

          <button
            onClick={() => sound.playCapture()}
            className="flex items-center justify-between p-3 rounded-xl bg-[#171714] hover:bg-[#252522] border border-[#252522] text-left transition-all active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#252522] flex items-center justify-center text-[#9B4B2D]">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="font-['Space_Grotesk'] font-bold text-xs text-[#F4EAD7] block">
                  Earthen Cow Capture
                </span>
                <span className="text-[10px] text-[#8C9090]">Low muffled stone capture thump</span>
              </div>
            </div>
            <Volume2 className="w-4 h-4 text-[#9B4B2D]" />
          </button>

          <button
            onClick={() => sound.playMountainWind()}
            className="flex items-center justify-between p-3 rounded-xl bg-[#171714] hover:bg-[#252522] border border-[#252522] text-left transition-all active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#252522] flex items-center justify-center text-[#8C9090]">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <span className="font-['Space_Grotesk'] font-bold text-xs text-[#F4EAD7] block">
                  Maloti Mountain Air
                </span>
                <span className="text-[10px] text-[#8C9090]">Filtered high-altitude mist breeze</span>
              </div>
            </div>
            <Volume2 className="w-4 h-4 text-[#8C9090]" />
          </button>
        </div>
      </div>

      {/* Physics & Motion Timing Table */}
      <div className="space-y-3 pt-3 border-t border-[#252522]">
        <h3 className="font-['Syne'] font-bold text-sm text-[#D1AF7A] uppercase tracking-wider">
          Kinetic Weight & Timing Parameters
        </h3>
        <div className="space-y-2.5">
          {motionSpecs.map((spec) => (
            <div
              key={spec.action}
              className="p-3 rounded-xl bg-[#171714]/80 border border-[#252522] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <span className="font-['Space_Grotesk'] font-bold text-xs text-[#F4EAD7] block">
                  {spec.action}
                </span>
                <p className="text-[11px] text-[#8C9090] mt-0.5">{spec.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded-md bg-[#252522] text-[10px] font-mono text-[#D1AF7A]">
                  {spec.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
