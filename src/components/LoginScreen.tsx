import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BadgeCheck,
  KeyRound,
  Radio,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  Activity,
  Terminal,
  Cpu,
  Wifi,
  Lock,
  Layers,
  Sparkles,
  ChevronRight,
  Shield,
  Gauge,
  LogOut,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ThreeBusAnimation } from './ThreeBusAnimation';
import { OperatorSession, DemoOperator } from '../types';
import { sound } from '../utils/audio';

const DEMO_PRESETS: DemoOperator[] = [
  {
    id: 'OP-78429',
    name: 'Cmdr. Satyam Anand',
    role: 'Senior Transit Dispatcher & Telemetry Lead',
    clearance: 'LEVEL-4 (FLEET COMMAND)',
    sector: '01-PACIFIC (Global View)',
    code: 'COMMAND-AUTH-99',
    unitCount: 1204,
  },
  {
    id: 'OP-41092',
    name: 'Lt. Elena Vance',
    role: 'Autonomous Fleet Diagnostics Specialist',
    clearance: 'LEVEL-3 (TELEMETRY / DIAG)',
    sector: '04-METRO CENTRAL',
    code: 'FLEET-SEC-41',
    unitCount: 842,
  },
  {
    id: 'OP-12884',
    name: 'Dispatcher Marcus Brody',
    role: 'Rapid Response & Route Strategist',
    clearance: 'LEVEL-2 (ROUTING DISPATCH)',
    sector: '07-NORTH CORRIDOR',
    code: 'ROUTE-GATE-12',
    unitCount: 519,
  },
];

interface LoginScreenProps {
  onLoginSuccess?: (session: OperatorSession) => void;
  activeSession?: OperatorSession | null;
  onLogout?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  activeSession,
  onLogout,
}) => {
  const [operatorId, setOperatorId] = useState('OP-78429');
  const [accessCode, setAccessCode] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);
  const [isGranted, setIsGranted] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [driveOff, setDriveOff] = useState(false);
  const [busSpeed, setBusSpeed] = useState<number>(1);
  const [isInteractive3D, setIsInteractive3D] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [authStep, setAuthStep] = useState<string>('');
  const [pingTime, setPingTime] = useState<number>(14);

  // Simulated ping fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setPingTime(Math.floor(12 + Math.random() * 8));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    sound.setEnabled(next);
    if (next) sound.playKeyClick();
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, val: string) => {
    setter(val);
    sound.playKeyClick();
  };

  const handleApplyPreset = (preset: DemoOperator) => {
    setOperatorId(preset.id);
    setAccessCode(preset.code);
    sound.playKeyClick();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isGranted) return;

    sound.playAuthStart();
    setIsLoading(true);
    setAuthStep('Encrypting Telemetry Handshake (AES-256)...');

    setTimeout(() => {
      setAuthStep('Verifying Biometric Dispatch Token...');
    }, 400);

    setTimeout(() => {
      setAuthStep('Synchronizing with Pacific Node-09...');
      sound.playDriveOff();
      setDriveOff(true);
    }, 850);

    setTimeout(() => {
      setIsLoading(false);
      setIsGranted(true);
      sound.playAccessGranted();

      try {
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00e5ff', '#3880ff', '#ffffff'],
        });
      } catch {
        // Safe fallback
      }

      const foundPreset = DEMO_PRESETS.find(
        (p) => p.id.toUpperCase() === operatorId.trim().toUpperCase()
      );

      const session: OperatorSession = {
        operatorId: operatorId.toUpperCase() || 'OP-78429',
        name: foundPreset ? foundPreset.name : 'Cmdr. Satyam Anand',
        role: foundPreset ? foundPreset.role : 'Senior Transit Dispatcher & Telemetry Lead',
        clearance: foundPreset ? foundPreset.clearance : 'LEVEL-4 (FLEET COMMAND)',
        sector: foundPreset ? foundPreset.sector : '01-PACIFIC (Global View)',
        loginTime: new Date().toLocaleTimeString(),
        pingMs: pingTime,
        nodeCluster: 'NODE-09-PACIFIC',
        encryptedToken: 'TOKEN_GCM_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      };

      if (onLoginSuccess) {
        onLoginSuccess(session);
      }
    }, 1450);
  };

  const handleResetSession = () => {
    sound.playKeyClick();
    setIsGranted(false);
    setIsLoading(false);
    setDriveOff(false);
    setAuthStep('');
    if (onLogout) {
      onLogout();
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playKeyClick();
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setShowResetModal(false);
    }, 1800);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#051424] text-[#d4e4fa] flex flex-col justify-between items-center overflow-hidden bg-grid-pattern font-sans select-none">
      {/* 3D Background Bus Animation Layer */}
      <div
        className={`absolute inset-0 w-full h-[620px] top-1/2 -translate-y-1/2 z-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-auto ${
          driveOff ? 'translate-x-[120vw] opacity-0' : 'translate-x-0 opacity-100'
        }`}
      >
        <ThreeBusAnimation
          interactive={isInteractive3D}
          speedMultiplier={busSpeed}
          className="w-full h-full"
        />
        {/* Soft edge gradient blends */}
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#051424] via-[#051424]/85 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#051424] via-[#051424]/85 to-transparent pointer-events-none" />
      </div>

      {/* Top Telemetry HUD Header */}
      <header className="relative z-10 pt-5 px-6 w-full max-w-7xl flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0d1c2d]/80 px-3 py-1.5 rounded-full border border-[#3b494c]/70 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5ff] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e5ff]"></span>
            </span>
            <span className="text-xs font-mono tracking-wider text-[#bac9cc]">
              GRID-PACIFIC // NODE-09
            </span>
            <span className="text-[10px] font-mono text-[#00e5ff] bg-[#00e5ff]/10 px-1.5 py-0.5 rounded">
              {pingTime}ms
            </span>
          </div>

          <button
            id="toggle-telemetry-log"
            type="button"
            onClick={() => {
              setShowTerminal(!showTerminal);
              sound.playKeyClick();
            }}
            className={`hidden md:flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full border transition-all ${
              showTerminal
                ? 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]'
                : 'bg-[#0d1c2d]/70 text-[#bac9cc] border-[#3b494c]/60 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Diagnostics</span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 text-xs font-mono text-[#bac9cc]/80">
          <div className="flex items-center gap-1.5 bg-[#0d1c2d]/80 px-3 py-1.5 rounded-full border border-[#3b494c]/60 backdrop-blur-md">
            <span className="text-[11px] text-[#bac9cc] hidden sm:inline">3D SPEED:</span>
            <button
              id="speed-multiplier-btn"
              onClick={() => {
                const next = busSpeed === 1 ? 2 : busSpeed === 2 ? 0.5 : 1;
                setBusSpeed(next);
                sound.playKeyClick();
              }}
              className="text-[#00e5ff] font-bold hover:text-white transition-colors px-1"
            >
              {busSpeed}x
            </button>
          </div>

          <button
            id="toggle-3d-orbit"
            onClick={() => {
              setIsInteractive3D(!isInteractive3D);
              sound.playKeyClick();
            }}
            className={`px-3 py-1.5 rounded-full border transition-all backdrop-blur-md ${
              isInteractive3D
                ? 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                : 'bg-[#0d1c2d]/80 text-[#bac9cc] border-[#3b494c]/60 hover:text-white'
            }`}
          >
            {isInteractive3D ? 'Orbit: ACTIVE' : 'Orbit: AUTO'}
          </button>

          <button
            id="toggle-audio-btn"
            onClick={toggleAudio}
            title={audioEnabled ? 'Mute Interface Sound' : 'Enable Interface Sound'}
            className="p-1.5 rounded-full bg-[#0d1c2d]/80 border border-[#3b494c]/60 text-[#bac9cc] hover:text-[#00e5ff] transition-colors"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-[#00e5ff]" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Login Card Center (Arising Animation) */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 w-full py-6">
        <AnimatePresence mode="wait">
          {!isGranted ? (
            <motion.div
              key="login-box"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md bg-[#051424]/92 backdrop-blur-2xl border border-[#3b494c] rounded-2xl shadow-2xl p-7 sm:p-8 relative overflow-hidden glow-card"
            >
              {/* Subtle Top Cyan Accent Bar */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent opacity-90" />

              {/* Brand Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-[#1c2b3c] border border-[#3b494c] mb-3 glow-active shadow-[0_0_20px_rgba(0,229,255,0.2)]">
                  <Radio className="w-6 h-6 text-[#00e5ff] animate-pulse" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#d4e4fa] mb-1 font-sans">
                  TransitCommand
                </h1>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#bac9cc]">
                  Secure Telemetry Access Portal
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" id="loginForm">
                {/* Operator ID Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="operator-id"
                    className="font-mono text-xs font-semibold uppercase tracking-wider text-[#bac9cc] flex items-center justify-between"
                  >
                    <span>Operator Badge ID</span>
                    <span className="text-[10px] text-[#00e5ff]/90 font-normal">SEC-AUTH</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#bac9cc]">
                      <BadgeCheck className="w-[18px] h-[18px]" />
                    </div>
                    <input
                      id="operator-id"
                      name="operator-id"
                      type="text"
                      autoComplete="username"
                      required
                      value={operatorId}
                      onChange={(e) => handleInputChange(setOperatorId, e.target.value)}
                      placeholder="OP-XXXXX"
                      className="block w-full pl-11 pr-3 py-2.5 bg-[#1c2b3c]/80 border border-[#3b494c] rounded-xl text-[#d4e4fa] placeholder-[#bac9cc]/40 focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] focus:outline-none transition-colors font-mono text-sm leading-5 shadow-inner"
                    />
                  </div>
                </div>

                {/* Access Code Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="access-code"
                      className="font-mono text-xs font-semibold uppercase tracking-wider text-[#bac9cc]"
                    >
                      Security Access Code
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetModal(true);
                        sound.playKeyClick();
                      }}
                      className="text-xs font-mono text-[#00e5ff] hover:text-[#9cf0ff] transition-colors underline"
                    >
                      override / reset
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#bac9cc]">
                      <KeyRound className="w-[18px] h-[18px]" />
                    </div>
                    <input
                      id="access-code"
                      name="access-code"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={accessCode}
                      onChange={(e) => handleInputChange(setAccessCode, e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-11 pr-3 py-2.5 bg-[#1c2b3c]/80 border border-[#3b494c] rounded-xl text-[#d4e4fa] placeholder-[#bac9cc]/40 focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] focus:outline-none transition-colors font-mono text-sm leading-5 shadow-inner"
                    />
                  </div>
                </div>

                {/* Quick Presets Picker */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#bac9cc]/70">
                      Quick Clearance Profiles
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {DEMO_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className={`text-left p-1.5 rounded-lg border text-[11px] font-mono transition-all truncate ${
                          operatorId === preset.id
                            ? 'bg-[#00e5ff]/15 border-[#00e5ff] text-[#00e5ff]'
                            : 'bg-[#1c2b3c]/40 border-[#3b494c]/60 text-[#bac9cc] hover:border-[#bac9cc]'
                        }`}
                      >
                        <div className="font-bold truncate">{preset.id}</div>
                        <div className="text-[9px] text-[#bac9cc]/70 truncate">{preset.name.split(' ')[1]}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    id="initialize-session-btn"
                    type="submit"
                    disabled={isLoading || isGranted}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#00e5ff] hover:bg-[#9cf0ff] text-[#00363d] rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 border border-transparent hover:border-[#9cf0ff] relative overflow-hidden group shadow-lg active:scale-[0.99] disabled:opacity-90 disabled:cursor-not-allowed"
                  >
                    {/* Button Glow / Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer" />

                    <span className="relative z-10 flex items-center justify-center gap-2 font-bold">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#00363d]" />
                          <span>{authStep || 'Authenticating Telemetry...'}</span>
                        </>
                      ) : isGranted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#00363d]" />
                          <span>Access Granted</span>
                        </>
                      ) : (
                        <>
                          <span>Initialize Telemetry Session</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>

              {/* Card Footer Info */}
              <div className="mt-5 pt-3 border-t border-[#3b494c]/50 flex items-center justify-between text-[11px] font-mono text-[#bac9cc]/70">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#00e5ff]" />
                  <span>AES-256 TELEMETRY LINK</span>
                </span>
                <span className="text-[#00e5ff]/90">PACIFIC SECTOR</span>
              </div>
            </motion.div>
          ) : (
            /* Granted State Dashboard Card */
            <motion.div
              key="granted-box"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg bg-[#051424]/95 backdrop-blur-2xl border border-[#00e5ff]/60 rounded-2xl shadow-2xl p-7 relative overflow-hidden glow-card"
            >
              {/* Cyan top bar */}
              <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#00e5ff] via-[#3880ff] to-[#00e5ff]" />

              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#00e5ff]/20 border border-[#00e5ff] flex items-center justify-center text-[#00e5ff] shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                    <CheckCircle2 className="w-7 h-7 text-[#00e5ff]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00e5ff]/15 text-[#00e5ff] font-bold">
                      ACCESS GRANTED // ACTIVE
                    </span>
                    <h2 className="text-xl font-bold text-white mt-1">
                      {activeSession?.name || 'Cmdr. Satyam Anand'}
                    </h2>
                    <p className="text-xs font-mono text-[#bac9cc]">
                      {activeSession?.role || 'Senior Transit Dispatcher'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleResetSession}
                  className="p-2 rounded-xl bg-[#1c2b3c] border border-[#3b494c] text-[#bac9cc] hover:text-white hover:border-[#00e5ff] transition-colors"
                  title="Disconnect Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#0d1c2d] border border-[#3b494c]">
                  <div className="text-[10px] text-[#bac9cc]">BADGE CLEARANCE</div>
                  <div className="text-[#00e5ff] font-bold mt-0.5 truncate">
                    {activeSession?.clearance || 'LEVEL-4'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0d1c2d] border border-[#3b494c]">
                  <div className="text-[10px] text-[#bac9cc]">ACTIVE FLEET</div>
                  <div className="text-white font-bold mt-0.5">1,204 Units</div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0d1c2d] border border-[#3b494c] col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-[#bac9cc]">NODE LATENCY</div>
                  <div className="text-[#4caf50] font-bold mt-0.5">{pingTime}ms (Optimal)</div>
                </div>
              </div>

              {/* Status Message */}
              <div className="p-3.5 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-xs font-mono text-[#d4e4fa] mb-6 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#00e5ff] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#00e5ff]">Autonomous Dispatch Link Synchronized</div>
                  <div className="text-[11px] text-[#bac9cc] mt-0.5">
                    Live telemetry stream is transmitting 3D location matrix, route telemetry, and sensor arrays.
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleResetSession}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#00e5ff] hover:bg-[#9cf0ff] text-[#00363d] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Replay Drive-off Animation</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Diagnostics Terminal Drawer (Collapsible) */}
      <AnimatePresence>
        {showTerminal && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 pointer-events-auto"
          >
            <div className="bg-[#051424]/95 border border-[#3b494c] rounded-2xl p-4 shadow-2xl backdrop-blur-2xl font-mono text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#3b494c]/60">
                <div className="flex items-center gap-2 text-[#00e5ff]">
                  <Terminal className="w-4 h-4" />
                  <span className="font-bold">TRANSIT-LINK TELEMETRY STREAM</span>
                </div>
                <button
                  onClick={() => setShowTerminal(false)}
                  className="text-[#bac9cc] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1 text-[11px] text-[#bac9cc] font-mono max-h-36 overflow-y-auto">
                <p className="text-emerald-400">[00:00:01] SEC-AUTH: Handshake verified over TLS 1.3 // 256-bit AES-GCM</p>
                <p>[00:00:02] TELEMETRY-BUS: 3D Autonomous unit 09-PACIFIC speed multiplier: {busSpeed}x</p>
                <p>[00:00:03] GRID-METRICS: 1,204 active rolling units in sector 01-PACIFIC</p>
                <p>[00:00:04] SENSOR-PULSE: Catenary line voltage 750V DC nominal, wheel velocity sync: OK</p>
                <p className="text-[#00e5ff]">[00:00:05] ACTIVE-NODE: Pacific Edge Gateway responding in {pingTime}ms</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Teaser Pill (Live Fleet Status) */}
      <footer className="relative z-10 w-full p-4 flex justify-center items-center pointer-events-auto">
        <div
          id="fleet-status-footer-pill"
          className="flex items-center gap-3 bg-[#122131]/80 backdrop-blur-md border border-[#3b494c] px-4 py-2 rounded-full shadow-lg glow-pill hover:border-[#00e5ff]/50 transition-colors"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5ff] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00e5ff]"></span>
          </span>
          <span className="font-mono text-xs font-semibold text-[#bac9cc] tracking-wide">
            Live Fleet Status: System Nominal
          </span>
          <div className="h-3.5 w-px bg-[#3b494c] mx-1"></div>
          <span className="font-mono text-xs font-bold text-[#00e5ff] tracking-tight">
            1,204 Active Units
          </span>
        </div>
      </footer>

      {/* Reset Code Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0d1c2d] border border-[#3b494c] rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="absolute top-4 right-4 text-[#bac9cc] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[#93000a]/30 border border-[#93000a]/50 text-[#ffb4ab]">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#d4e4fa]">Reset Dispatch Access</h3>
                  <p className="text-xs font-mono text-[#bac9cc]">Security Token Reissue</p>
                </div>
              </div>

              {resetSent ? (
                <div className="p-4 bg-[#00e5ff]/10 border border-[#00e5ff]/40 rounded-lg text-center font-mono text-xs text-[#c3f5ff] space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-[#00e5ff] mx-auto mb-1" />
                  <p className="font-bold">Re-auth Token Dispatched</p>
                  <p className="text-[#bac9cc]">Sent to supervisor radio terminal.</p>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <p className="text-xs text-[#bac9cc] leading-relaxed">
                    Enter your authorized dispatch badge or registered transit comms address to receive an emergency single-use bypass key.
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="operator@transit.command.gov"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#1c2b3c] border border-[#3b494c] rounded-xl text-xs font-mono text-[#d4e4fa] focus:border-[#00e5ff] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#00e5ff] hover:bg-[#9cf0ff] text-[#00363d] rounded-xl text-xs font-mono font-bold uppercase transition-colors"
                  >
                    Request Security Override
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
