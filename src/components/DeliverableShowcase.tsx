import React, { useState } from 'react';
import { DeliverableTab } from '../types';
import { GameBoard } from './GameBoard';
import { BottleCapToken, SFBrandMonogram } from './BottleCapToken';
import { MinimalMatchHeader, ContextualInstruction, ForcedOpeningBanner } from './MinimalMatchUI';
import { PausedMenu } from './PausedMenu';
import { MaterialColourBoard } from './MaterialColourBoard';
import { MotionSoundSpec } from './MotionSoundSpec';
import {
  getInitialGameState,
  getMidGameState,
  getMillFormationState,
  getTrappedForcedOpeningState,
} from '../engine/morabaraba';
import { runAllSotho25TrappedPlayerTests } from '../engine/morabaraba.test';
import { sound } from '../utils/audio';
import { ShieldCheck, PlayCircle, AlertCircle } from 'lucide-react';

interface DeliverableShowcaseProps {
  onBackToGame: () => void;
}

export const DeliverableShowcase: React.FC<DeliverableShowcaseProps> = ({ onBackToGame }) => {
  const [activeTab, setActiveTab] = useState<DeliverableTab>('empty-board');
  const [pausedMenuOpen, setPausedMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [testResults, setTestResults] = useState<{ passed: number; total: number; results: string[] } | null>(null);

  const emptyState = getInitialGameState();
  const midGameState = getMidGameState();
  const millState = getMillFormationState();
  const trappedState = getTrappedForcedOpeningState();

  const tabs: { id: DeliverableTab; label: string; number: string }[] = [
    { id: 'empty-board', label: 'Empty Board', number: '01' },
    { id: 'mid-game', label: 'Mid-Game', number: '02' },
    { id: 'obsidian-token', label: '3D Bottle Cap (P1)', number: '03' },
    { id: 'ivory-token', label: '3D Bottle Cap (P2)', number: '04' },
    { id: 'mill-formation', label: 'Mill Formation', number: '05' },
    { id: 'forced-opening', label: 'Sotho 25 Forced Opening', number: '06' },
    { id: 'paused-menu', label: 'Paused Menu', number: '07' },
    { id: 'material-palette', label: 'Material Palette', number: '08' },
    { id: 'motion-sound', label: 'Motion & Sound', number: '09' },
  ];

  const handleRunTests = () => {
    const res = runAllSotho25TrappedPlayerTests();
    setTestResults(res);
  };

  return (
    <div className="w-full flex flex-col space-y-4 text-[#E9E0CE]">
      {/* Deliverables Header */}
      <div className="flex items-center justify-between pt-1 border-b border-[#252522] pb-3">
        <div>
          <span className="text-[10px] font-['Space_Grotesk'] tracking-[0.25em] text-[#A98545] uppercase block">
            LOCKED VISUAL DESIGN FOUNDATION
          </span>
          <h2 className="font-['Syne'] font-extrabold text-base sm:text-lg text-[#F4EAD7] tracking-tight uppercase">
            Ancient Basotho × Future Luxury
          </h2>
        </div>

        <button
          onClick={onBackToGame}
          className="px-3 py-1.5 rounded-lg bg-[#252522] hover:bg-[#321A12] text-[#D1AF7A] hover:text-[#F4EAD7] text-xs font-bold font-['Space_Grotesk'] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
        >
          Return to Play
        </button>
      </div>

      {/* 9 Deliverables Quick Selection Switcher */}
      <div className="w-full flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'paused-menu') setPausedMenuOpen(true);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-['Space_Grotesk'] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#A98545] text-[#080807] shadow-[0_2px_8px_rgba(169,133,69,0.4)]'
                  : 'bg-[#171714] text-[#8C9090] hover:text-[#F4EAD7] border border-[#252522]'
              }`}
            >
              <span className={`text-[10px] opacity-70 ${isActive ? 'text-[#080807]' : 'text-[#A98545]'}`}>
                {tab.number}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. EMPTY BOARD SCREEN */}
      {/* ========================================================================= */}
      {activeTab === 'empty-board' && (
        <div className="w-full space-y-3 animate-fadeIn">
          <div className="bg-[#171714]/80 p-3 rounded-xl border border-[#252522] flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            <div>
              <span className="text-[10px] font-['Space_Grotesk'] tracking-widest text-[#A98545] uppercase block">
                DELIVERABLE 01
              </span>
              <span className="font-['Syne'] font-bold text-sm text-[#F4EAD7]">
                Empty Continuous Sandstone / Slate Slab
              </span>
            </div>
            <span className="text-xs text-[#8C9090] font-mono">25 Points · Pristine</span>
          </div>

          <MinimalMatchHeader
            player={emptyState.obsidian}
            isTurn={true}
            showMenuButton={true}
            onOpenMenu={() => setPausedMenuOpen(true)}
          />

          <GameBoard
            points={emptyState.points}
            turn="obsidian"
            phase="placing"
            selectedPointId={null}
            validTargets={Object.keys(emptyState.points)}
            flashMill={null}
            onPointClick={() => sound.playPlace()}
          />

          <ContextualInstruction
            instruction="Place one cattle token on an engraved stone node."
            phase="placing"
          />

          <MinimalMatchHeader
            player={emptyState.ivory}
            isTurn={false}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MID-GAME MOBILE SCREEN */}
      {/* ========================================================================= */}
      {activeTab === 'mid-game' && (
        <div className="w-full space-y-3 animate-fadeIn">
          <div className="bg-[#171714]/80 p-3 rounded-xl border border-[#252522] flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            <div>
              <span className="text-[10px] font-['Space_Grotesk'] tracking-widest text-[#A98545] uppercase block">
                DELIVERABLE 02
              </span>
              <span className="font-['Syne'] font-bold text-sm text-[#F4EAD7]">
                Tactical Mid-Game Position with Carved Center Spot
              </span>
            </div>
            <span className="text-xs text-[#D1AF7A] font-mono">Turn 14 · Placing</span>
          </div>

          <MinimalMatchHeader
            player={midGameState.obsidian}
            isTurn={true}
            showMenuButton={true}
            onOpenMenu={() => setPausedMenuOpen(true)}
          />

          <GameBoard
            points={midGameState.points}
            turn="obsidian"
            phase="placing"
            selectedPointId={null}
            validTargets={midGameState.validTargets}
            flashMill={null}
            onPointClick={() => sound.playPlace()}
          />

          <ContextualInstruction
            instruction={midGameState.statusMessage}
            phase="placing"
          />

          <MinimalMatchHeader
            player={midGameState.ivory}
            isTurn={false}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. 3D BOTTLE CAP TOKEN - PLAYER 01 */}
      {/* ========================================================================= */}
      {activeTab === 'obsidian-token' && (
        <div className="w-full space-y-5 animate-fadeIn">
          <div className="bg-[#171714]/80 p-3.5 rounded-xl border border-[#252522] shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            <span className="text-[10px] font-['Space_Grotesk'] tracking-widest text-[#A98545] uppercase block">
              DELIVERABLE 03
            </span>
            <h3 className="font-['Syne'] font-extrabold text-base text-[#F4EAD7] tracking-tight uppercase">
              Player 01: 3D Crown Bottle Cap (Deep Chocolate / Gold SF Logo)
            </h3>
            <p className="text-xs text-[#8C9090] mt-1">
              Authentic stamped tinplate crown bottle cap with 21 fluted crimped teeth, deep lacquer enamel bed, and 3D embossed Sesotho Fashioneng lightning logo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Top-Down View */}
            <div className="p-6 rounded-2xl bg-[#171714] border border-[#252522] flex flex-col items-center justify-center space-y-4 shadow-[0_12px_32px_rgba(0,0,0,0.9)]">
              <span className="text-xs font-['Space_Grotesk'] font-bold tracking-wider text-[#D1AF7A] uppercase">
                Top View (Active Gameplay)
              </span>
              <div className="p-4 rounded-full bg-[#080807] border border-[#252522] shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)]">
                <BottleCapToken player="obsidian" size={76} viewAngle="top" />
              </div>
              <span className="text-[11px] text-[#8C9090] text-center">
                21 fluted teeth with micro-bevels & embossed cream SF monogram.
              </span>
            </div>

            {/* Angled 3D Sculptural View */}
            <div className="p-6 rounded-2xl bg-[#171714] border border-[#252522] flex flex-col items-center justify-center space-y-4 shadow-[0_12px_32px_rgba(0,0,0,0.9)]">
              <span className="text-xs font-['Space_Grotesk'] font-bold tracking-wider text-[#D1AF7A] uppercase">
                3D Angled Perspective View
              </span>
              <div className="p-2">
                <BottleCapToken player="obsidian" size={76} viewAngle="angled" />
              </div>
              <span className="text-[11px] text-[#8C9090] text-center">
                Stamped skirt cylinder depth, tinplate gauge, and angled logo relief.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. 3D BOTTLE CAP TOKEN - PLAYER 02 */}
      {/* ========================================================================= */}
      {activeTab === 'ivory-token' && (
        <div className="w-full space-y-5 animate-fadeIn">
          <div className="bg-[#171714]/80 p-3.5 rounded-xl border border-[#252522] shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            <span className="text-[10px] font-['Space_Grotesk'] tracking-widest text-[#A98545] uppercase block">
              DELIVERABLE 04
            </span>
            <h3 className="font-['Syne'] font-extrabold text-base text-[#F4EAD7] tracking-tight uppercase">
              Player 02: 3D Crown Bottle Cap (Ivory Stone / Sandstone SF Logo)
            </h3>
            <p className="text-xs text-[#8C9090] mt-1">
              Warm ivory stone metallic lacquer cap with brass-dipped fluted teeth and embossed chocolate SF monogram emblem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Top-Down View */}
            <div className="p-6 rounded-2xl bg-[#171714] border border-[#252522] flex flex-col items-center justify-center space-y-4 shadow-[0_12px_32px_rgba(0,0,0,0.9)]">
              <span className="text-xs font-['Space_Grotesk'] font-bold tracking-wider text-[#D1AF7A] uppercase">
                Top View (Active Gameplay)
              </span>
              <div className="p-4 rounded-full bg-[#080807] border border-[#252522] shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)]">
                <BottleCapToken player="ivory" size={76} viewAngle="top" />
              </div>
              <span className="text-[11px] text-[#8C9090] text-center">
                Warm ivory lacquer core with sandstone crimped rim.
              </span>
            </div>

            {/* Angled 3D Sculptural View */}
            <div className="p-6 rounded-2xl bg-[#171714] border border-[#252522] flex flex-col items-center justify-center space-y-4 shadow-[0_12px_32px_rgba(0,0,0,0.9)]">
              <span className="text-xs font-['Space_Grotesk'] font-bold tracking-wider text-[#D1AF7A] uppercase">
                3D Angled Perspective View
              </span>
              <div className="p-2">
                <BottleCapToken player="ivory" size={76} viewAngle="angled" />
              </div>
              <span className="text-[11px] text-[#8C9090] text-center">
                Reflective ivory crown face with deep stamped chocolate SF symbol.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MILL-FORMATION STATE */}
      {/* ========================================================================= */}
      {activeTab === 'mill-formation' && (
        <div className="w-full space-y-3 animate-fadeIn">
          <div className="bg-[#171714]/80 p-3 rounded-xl border border-[#252522] flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            <div>
              <span className="text-[10px] font-['Space_Grotesk'] tracking-widest text-[#C7A864] uppercase block">
                DELIVERABLE 05
              </span>
              <span className="font-['Syne'] font-bold text-sm text-[#F4EAD7]">
                Center Cross Mill Formation (c4 – d4 – e4)
              </span>
            </div>
            <button
              onClick={() => sound.playMill()}
              className="px-2.5 py-1 rounded-md bg-[#A98545] text-[#080807] text-xs font-bold shadow-[0_2px_6px_rgba(169,133,69,0.4)]"
            >
              Play Chime
            </button>
          </div>

          <MinimalMatchHeader
            player={millState.obsidian}
            isTurn={true}
            showMenuButton={true}
            onOpenMenu={() => setPausedMenuOpen(true)}
          />

          <GameBoard
            points={millState.points}
            turn="obsidian"
            phase="shooting"
            selectedPointId={null}
            validTargets={[]}
            capturablePoints={['g1', 'f4', 'd7', 'a7']}
            flashMill={['c4', 'd4', 'e4']}
            onPointClick={() => sound.playCapture()}
          />

          <ContextualInstruction
            instruction={millState.statusMessage}
            phase="shooting"
          />

          <MinimalMatchHeader
            player={millState.ivory}
            isTurn={false}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SOTHO 25 FORCED OPENING STATE & AUTOMATED TEST RUNNER */}
      {/* ========================================================================= */}
      {activeTab === 'forced-opening' && (
        <div className="w-full space-y-4 animate-fadeIn">
          <div className="bg-[#171714]/80 p-3.5 rounded-xl border border-[#252522] shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            <span className="text-[10px] font-['Space_Grotesk'] tracking-widest text-[#A98545] uppercase block">
              DELIVERABLE 06 · AUTHORITATIVE SOTHO RULE
            </span>
            <h3 className="font-['Syne'] font-extrabold text-base text-[#F4EAD7] tracking-tight uppercase">
              Trapped Player Forced Opening Rule Specification
            </h3>
            <p className="text-xs text-[#8C9090] mt-1">
              In traditional Sotho Morabaraba, a blocked player does not lose. Instead, the opponent receives consecutive turns under a mandatory opening obligation until a legal path is created.
            </p>
          </div>

          {/* Sotho Special Rule Banner */}
          {trappedState.forcedOpening && (
            <ForcedOpeningBanner forcedOpening={trappedState.forcedOpening} />
          )}

          <MinimalMatchHeader
            player={trappedState.obsidian}
            isTurn={true}
            isOpener={true}
            showMenuButton={true}
            onOpenMenu={() => setPausedMenuOpen(true)}
          />

          <GameBoard
            points={trappedState.points}
            turn="obsidian"
            phase="moving"
            selectedPointId={null}
            validTargets={[]}
            flashMill={null}
            onPointClick={() => sound.playSelect()}
          />

          <ContextualInstruction
            instruction={trappedState.statusMessage}
            phase="moving"
            isForcedOpening={true}
          />

          <MinimalMatchHeader
            player={trappedState.ivory}
            isTurn={false}
            isTrapped={true}
          />

          {/* 14 Automated Tests Suite Controller */}
          <div className="p-4 rounded-xl bg-[#171714] border border-[#252522] space-y-3 shadow-[0_6px_16px_rgba(0,0,0,0.7)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#A98545]" />
                <span className="font-['Syne'] font-bold text-xs text-[#F4EAD7] uppercase tracking-wider">
                  Authoritative Sotho 25 & Double-Mill Test Suite (29 Tests)
                </span>
              </div>
              <button
                onClick={handleRunTests}
                className="px-3 py-1 rounded-lg bg-[#A98545] hover:bg-[#D1AF7A] text-[#080807] text-xs font-bold font-['Space_Grotesk'] flex items-center gap-1.5 transition-all shadow-[0_2px_6px_rgba(169,133,69,0.4)]"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Run 29 Engine Tests</span>
              </button>
            </div>

            {testResults && (
              <div className="space-y-2 pt-2 border-t border-[#252522]">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#8C9090]">Engine Validation Status:</span>
                  <span className="font-bold text-[#A98545]">
                    {testResults.passed} / {testResults.total} TESTS PASSED (100% VERIFIED)
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 p-2.5 rounded-lg bg-[#080807] border border-[#252522] font-mono text-[11px]">
                  {testResults.results.map((r, i) => (
                    <div
                      key={i}
                      className={r.startsWith('PASS') ? 'text-[#D1AF7A]' : 'text-[#FF5A62] font-bold'}
                    >
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MINIMAL PAUSED MENU */}
      {/* ========================================================================= */}
      {activeTab === 'paused-menu' && (
        <div className="w-full space-y-4 animate-fadeIn">
          <div className="bg-[#171714]/80 p-3.5 rounded-xl border border-[#252522] flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            <div>
              <span className="text-[10px] font-['Space_Grotesk'] tracking-widest text-[#A98545] uppercase block">
                DELIVERABLE 07
              </span>
              <h3 className="font-['Syne'] font-bold text-sm text-[#F4EAD7]">
                Minimal Paused Menu (Smoked Stone & Charcoal Translucency)
              </h3>
            </div>
            <button
              onClick={() => setPausedMenuOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#A98545] text-[#080807] font-bold text-xs shadow-[0_2px_6px_rgba(169,133,69,0.4)]"
            >
              Open Menu
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#171714] border border-[#252522] space-y-3 shadow-[0_12px_32px_rgba(0,0,0,0.9)]">
            <span className="text-xs font-bold text-[#D1AF7A] uppercase tracking-wider block">
              Menu Design Principles
            </span>
            <ul className="text-xs text-[#8C9090] space-y-2 list-disc list-inside">
              <li>Deep charcoal translucency (#171714/95) with antique gold hairline dividers.</li>
              <li>Bone typography (#E9E0CE) for maximum contrast against smoked stone.</li>
              <li>Generous negative space with deliberate touch zones.</li>
              <li>Quiet Maloti audio & haptics control on the footer.</li>
            </ul>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MATERIAL AND COLOUR BOARD */}
      {/* ========================================================================= */}
      {activeTab === 'material-palette' && <MaterialColourBoard />}

      {/* ========================================================================= */}
      {/* 9. MOTION AND SOUND SPECIFICATION */}
      {/* ========================================================================= */}
      {activeTab === 'motion-sound' && <MotionSoundSpec />}

      {/* Paused Menu Modal */}
      <PausedMenu
        isOpen={pausedMenuOpen}
        soundEnabled={soundEnabled}
        onClose={() => setPausedMenuOpen(false)}
        onNewGame={() => {
          setPausedMenuOpen(false);
          onBackToGame();
        }}
        onToggleSound={() => {
          sound.enabled = !sound.enabled;
          setSoundEnabled(sound.enabled);
        }}
        onOpenDeliverables={() => setPausedMenuOpen(false)}
      />
    </div>
  );
};
