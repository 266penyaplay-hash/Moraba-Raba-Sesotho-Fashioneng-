import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  Lock,
  User,
  Shield,
  Check,
  AlertCircle,
  LogOut,
  Sparkles,
  ArrowRight,
  RefreshCw,
  KeyRound,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  BASOTHO_CLANS,
  TACTICIAN_AVATARS,
  UserProfileData,
} from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  userProfile: UserProfileData | null;
  onGoogleSignIn: () => Promise<void>;
  onEmailSignUp: (
    email: string,
    pass: string,
    displayName: string,
    clanTitle?: string,
    avatarIcon?: string
  ) => Promise<{ success: boolean; error: string | null }>;
  onEmailSignIn: (
    email: string,
    pass: string
  ) => Promise<{ success: boolean; error: string | null }>;
  onPasswordReset: (email: string) => Promise<{ success: boolean; error: string | null }>;
  onUpdateProfile: (data: {
    displayName?: string;
    clanTitle?: string;
    avatarIcon?: string;
  }) => Promise<boolean>;
  onSignOut: () => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userProfile,
  onGoogleSignIn,
  onEmailSignUp,
  onEmailSignIn,
  onPasswordReset,
  onUpdateProfile,
  onSignOut,
}) => {
  const isRegisteredUser = currentUser && !currentUser.isAnonymous;
  const [tab, setTab] = useState<'signin' | 'signup' | 'profile'>(
    isRegisteredUser ? 'profile' : 'signup'
  );

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(
    userProfile?.displayName || currentUser?.displayName || ''
  );
  const [selectedClan, setSelectedClan] = useState(userProfile?.clanTitle || 'Bakoena');
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile?.avatarIcon || 'mokorotlo');

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);

  // If user signs in, switch to profile view if modal stays open
  React.useEffect(() => {
    if (isRegisteredUser && tab !== 'profile') {
      setTab('profile');
      setDisplayName(userProfile?.displayName || currentUser?.displayName || '');
      setSelectedClan(userProfile?.clanTitle || 'Bakoena');
      setSelectedAvatar(userProfile?.avatarIcon || 'mokorotlo');
    }
  }, [isRegisteredUser, currentUser, userProfile]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    const res = await onEmailSignIn(email, password);
    setLoading(false);
    if (res.error) {
      setFormError(res.error);
    } else {
      setFormSuccess('Successfully signed in! Your tactical records are synced.');
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!email || !password) {
      setFormError('Please enter an email and password.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const res = await onEmailSignUp(
      email,
      password,
      displayName || 'Basotho Tactician',
      selectedClan,
      selectedAvatar
    );
    setLoading(false);
    if (res.error) {
      setFormError(res.error);
    } else {
      setFormSuccess('Account created! Welcome to the Royal Morabaraba Arena.');
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!email) {
      setFormError('Please enter your account email address.');
      return;
    }
    setLoading(true);
    const res = await onPasswordReset(email);
    setLoading(false);
    if (res.error) {
      setFormError(res.error);
    } else {
      setFormSuccess('Password reset link sent to your inbox. Please check your email.');
      setIsResetMode(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setLoading(true);
    const ok = await onUpdateProfile({
      displayName: displayName.trim() || 'Basotho Tactician',
      clanTitle: selectedClan,
      avatarIcon: selectedAvatar,
    });
    setLoading(false);
    if (ok) {
      setFormSuccess('Tactician profile updated successfully!');
      setTimeout(() => {
        setFormSuccess(null);
      }, 2500);
    } else {
      setFormError('Failed to update profile. Please try again.');
    }
  };

  const curAvatarObj =
    TACTICIAN_AVATARS.find((a) => a.id === selectedAvatar) || TACTICIAN_AVATARS[0];
  const curClanObj =
    BASOTHO_CLANS.find((c) => c.name === selectedClan || c.id === selectedClan) ||
    BASOTHO_CLANS[0];

  return (
    <AnimatePresence>
      <div
        id="auth-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          id="auth-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-neutral-900 border border-amber-500/20 shadow-2xl text-neutral-100"
        >
          {/* Top Pattern Header */}
          <div className="relative p-6 pb-4 bg-gradient-to-b from-amber-950/40 to-neutral-900 border-b border-white/5">
            <button
              id="auth-modal-close-btn"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-2xl shadow-lg border border-amber-400/30">
                {curAvatarObj.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Basotho Tactician ID</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    {curClanObj.name}
                  </span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Sign up & connect to invite friends to live Morabaraba matches
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mt-5 p-1 bg-black/40 rounded-xl border border-white/5">
              {!isRegisteredUser ? (
                <>
                  <button
                    id="auth-tab-signup"
                    onClick={() => {
                      setTab('signup');
                      setFormError(null);
                      setFormSuccess(null);
                      setIsResetMode(false);
                    }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                      tab === 'signup'
                        ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Create Account
                  </button>
                  <button
                    id="auth-tab-signin"
                    onClick={() => {
                      setTab('signin');
                      setFormError(null);
                      setFormSuccess(null);
                      setIsResetMode(false);
                    }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                      tab === 'signin'
                        ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  <button
                    id="auth-tab-profile"
                    onClick={() => setTab('profile')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                      tab === 'profile'
                        ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Tactician Profile
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Feedback Banners */}
          <div className="px-6 pt-4">
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 mb-3 text-xs bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{formError}</span>
              </motion.div>
            )}

            {formSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 mb-3 text-xs bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 flex items-start gap-2"
              >
                <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{formSuccess}</span>
              </motion.div>
            )}
          </div>

          {/* Modal Body */}
          <div className="p-6 pt-2 max-h-[70vh] overflow-y-auto space-y-5">
            {/* Quick Google Sign In */}
            {!isRegisteredUser && (
              <div className="space-y-3">
                <button
                  id="auth-google-btn"
                  onClick={async () => {
                    setLoading(true);
                    setFormError(null);
                    await onGoogleSignIn();
                    setLoading(false);
                    onClose();
                  }}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink mx-3 text-[11px] text-neutral-500 uppercase tracking-widest font-mono">
                    or with Email
                  </span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>
              </div>
            )}

            {/* TAB: SIGN UP */}
            {tab === 'signup' && !isRegisteredUser && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Tactician Display Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      id="signup-name-input"
                      type="text"
                      placeholder="e.g. Kgosi Lerotholi, SothoWarrior"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-800/80 border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white placeholder-neutral-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      id="signup-email-input"
                      type="email"
                      required
                      placeholder="warrior@lesotho.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-800/80 border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white placeholder-neutral-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Password (min. 6 chars)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      id="signup-password-input"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-800/80 border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white placeholder-neutral-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Basotho Clan Selector */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Select Basotho Totem Clan (Seboko)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {BASOTHO_CLANS.map((clan) => {
                      const isSelected = selectedClan === clan.name;
                      return (
                        <button
                          key={clan.id}
                          type="button"
                          onClick={() => setSelectedClan(clan.name)}
                          className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-neutral-800/40 border-white/5 text-neutral-400 hover:border-white/20'
                          }`}
                        >
                          <span className="text-xl">{clan.symbol}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{clan.name}</p>
                            <p className="text-[10px] text-neutral-400 truncate">{clan.totem}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Avatar Icon Selector */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Tactician Crest & Avatar
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {TACTICIAN_AVATARS.map((av) => {
                      const isSelected = selectedAvatar === av.id;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setSelectedAvatar(av.id)}
                          className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl border transition-all ${
                            isSelected
                              ? 'border-amber-400 bg-amber-500/20 scale-105 shadow-md'
                              : 'border-white/10 bg-neutral-800/50 hover:bg-neutral-800'
                          }`}
                          title={av.label}
                        >
                          {av.icon}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  id="signup-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Create Account & Join Arena</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB: SIGN IN */}
            {tab === 'signin' && !isRegisteredUser && (
              <>
                {!isResetMode ? (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                          id="signin-email-input"
                          type="email"
                          required
                          placeholder="warrior@lesotho.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-800/80 border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white placeholder-neutral-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-neutral-300">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsResetMode(true);
                            setFormError(null);
                            setFormSuccess(null);
                          }}
                          className="text-xs text-amber-400 hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                          id="signin-password-input"
                          type="password"
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-800/80 border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white placeholder-neutral-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      id="signin-submit-btn"
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Sign In to Arena</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                      <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Enter your email to receive a password reset link.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        Account Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="warrior@lesotho.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-800/80 border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white placeholder-neutral-500 outline-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsResetMode(false)}
                        className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md"
                      >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* TAB: TACTICIAN PROFILE (Logged In User) */}
            {(tab === 'profile' || isRegisteredUser) && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="p-3.5 bg-neutral-800/50 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-xl">
                      {curAvatarObj.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {userProfile?.displayName || currentUser?.displayName || 'Tactician'}
                      </p>
                      <p className="text-[11px] text-neutral-400">{currentUser?.email || 'Authenticated'}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                    Online Synced
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Edit Tactician Name
                  </label>
                  <input
                    id="profile-name-input"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-800/80 border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Clan Title (Seboko)
                  </label>
                  <select
                    id="profile-clan-select"
                    value={selectedClan}
                    onChange={(e) => setSelectedClan(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800/80 border border-white/10 text-sm text-white focus:border-amber-500 outline-none"
                  >
                    {BASOTHO_CLANS.map((clan) => (
                      <option key={clan.id} value={clan.name} className="bg-neutral-900 text-white">
                        {clan.symbol} {clan.name} — {clan.totem}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Tactician Avatar Crest
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {TACTICIAN_AVATARS.map((av) => {
                      const isSelected = selectedAvatar === av.id;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setSelectedAvatar(av.id)}
                          className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl border transition-all ${
                            isSelected
                              ? 'border-amber-400 bg-amber-500/20 scale-105 shadow-md'
                              : 'border-white/10 bg-neutral-800/50 hover:bg-neutral-800'
                          }`}
                          title={av.label}
                        >
                          {av.icon}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    id="profile-save-btn"
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    id="profile-signout-btn"
                    type="button"
                    onClick={async () => {
                      await onSignOut();
                      onClose();
                    }}
                    className="py-2.5 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
