import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Smartphone,
  CheckCircle2,
  Copy,
  ExternalLink,
  Lock,
  Mail,
  LogOut,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  sendResetEmail,
  logout,
} from '../cloudSync';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'local-only';
  isDarkMode: boolean;
  projectCount: number;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  syncStatus,
  isDarkMode,
  projectCount,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Target App URL for phone scanning
  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-mmeynq7ttnu6auhqwifj2o-496791487752.asia-east1.run.app';

  // Generate QR Code for Phone Access
  useEffect(() => {
    QRCode.toDataURL(
      appUrl,
      {
        width: 220,
        margin: 2,
        color: {
          dark: isDarkMode ? '#1e293b' : '#0f172a',
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrCodeDataUrl(url);
        }
      }
    );
  }, [appUrl, isDarkMode]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setAuthError(err?.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAuthError('Please provide an email address.');
      return;
    }

    try {
      setLoading(true);
      setAuthError(null);
      setAuthSuccess(null);

      if (authMode === 'forgot') {
        await sendResetEmail(email);
        setAuthSuccess('Password reset link sent to your email. Check your inbox!');
        return;
      }

      if (!password || password.length < 6) {
        setAuthError('Password must be at least 6 characters.');
        return;
      }

      if (authMode === 'signin') {
        await signInWithEmail(email, password);
        setAuthSuccess('Welcome back! Your files are now syncing across devices.');
      } else {
        await signUpWithEmail(email, password);
        setAuthSuccess('Account created successfully! Your projects are now synced.');
      }
    } catch (err: any) {
      console.error('Email auth error:', err);
      let msg = err?.message || 'Authentication failed.';
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please verify your credentials.';
      } else if (err?.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please sign in instead.';
      }
      setAuthError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl border ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 sm:p-5 border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/70'}`}>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg">
              Account Details
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Access, edit, and export your interior calculation files from any phone or computer.
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* If Logged In */}
          {currentUser ? (
            <div className="space-y-6">
              {/* Account Status Card */}
              <div
                className={`p-4 rounded-xl border ${
                  isDarkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-lg uppercase shadow-sm">
                      {currentUser.email ? currentUser.email[0] : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Active Account
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await logout();
                      setAuthSuccess('Logged out successfully.');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 self-start sm:self-auto ${
                      isDarkMode
                        ? 'border-slate-700 hover:bg-slate-700/80 text-rose-400'
                        : 'border-slate-200 hover:bg-slate-100 text-rose-600'
                    }`}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>

                <div className={`mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-xs ${isDarkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Files in Cloud</span>
                    <span className="font-extrabold text-indigo-500">{projectCount} Projects Ready</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Sync Status</span>
                    <span className="font-extrabold text-emerald-500">Continuous Auto-Sync</span>
                  </div>
                </div>
              </div>

              {/* QR Code Section to Open on Phone */}
              <div
                className={`p-5 rounded-xl border ${
                  isDarkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-blue-50/40 border-blue-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="h-4 w-4 text-indigo-500" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Step 2: Open On Your Phone Right Now
                  </h4>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* QR Code Container */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-md shrink-0 text-center">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="Scan QR Code to open on phone"
                        className="w-40 h-40 object-contain mx-auto"
                      />
                    ) : (
                      <div className="w-40 h-40 flex items-center justify-center bg-slate-100 rounded-lg text-xs text-slate-400">
                        Generating QR Code...
                      </div>
                    )}
                    <p className="text-[10px] font-bold text-slate-600 mt-2">
                      Scan with Phone Camera
                    </p>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-3 flex-1 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0">
                        1
                      </div>
                      <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                        Open your smartphone's camera or QR reader and scan the QR code on the left.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0">
                        2
                      </div>
                      <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                        Sign in with your email <span className="font-bold text-indigo-500">({currentUser.email})</span> or Google on your phone.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0">
                        3
                      </div>
                      <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                        All your projects, rates, and sheets load instantly! Tap "Install" or "Add to Home Screen" on your phone for full app experience.
                      </p>
                    </div>

                    {/* Copy Link Input */}
                    <div className="pt-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Or Share Direct Web Link
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={appUrl}
                          className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono select-all ${
                            isDarkMode
                              ? 'bg-slate-900 border-slate-700 text-slate-300'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        />
                        <button
                          onClick={handleCopyLink}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs ${
                            copiedLink
                              ? 'bg-emerald-600 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          {copiedLink ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              Copy Link
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* If Not Logged In */
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h4 className="font-black text-base text-slate-900 dark:text-white">
                  Sign In to Your Account
                </h4>
                <p className={`text-xs max-w-md mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Sign in with Google or your email to access and sync your interior calculation projects.
                </p>
              </div>

              {/* Feedback messages */}
              {authError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* Google 1-Click Sign-in */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs hover:shadow-md active:scale-[0.99] bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
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

              <div className="flex items-center gap-3">
                <div className={`flex-1 h-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Or with Email
                </span>
                <div className={`flex-1 h-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all ${
                        isDarkMode
                          ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                          : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {authMode !== 'forgot' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all ${
                          isDarkMode
                            ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                            : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  {authMode === 'signin' && 'Sign In to Sync'}
                  {authMode === 'signup' && 'Create Account & Start Syncing'}
                  {authMode === 'forgot' && 'Send Password Reset Link'}
                </button>
              </form>

              {/* Mode Switchers */}
              <div className="flex items-center justify-between text-xs pt-1">
                {authMode === 'signin' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setAuthError(null);
                      }}
                      className="text-indigo-500 hover:underline font-bold"
                    >
                      Need an account? Sign up
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setAuthError(null);
                      }}
                      className="text-slate-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setAuthError(null);
                    }}
                    className="text-indigo-500 hover:underline font-bold"
                  >
                    Already have an account? Sign in
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Security footnote */}
          <div className={`p-3 rounded-xl flex items-center gap-2.5 text-[11px] ${isDarkMode ? 'bg-slate-800/30 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>
              Protected with Google Cloud Firestore security rules. Your interior files are private and only accessible by your authenticated account.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
