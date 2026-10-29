import React, { useState } from 'react';
import { X, LogIn, UserPlus, Eye, EyeOff, User, Mail, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { AVATAR_OPTIONS, loginUser, registerUser } from '../services/auth';
import type { UserProfile } from '../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  lang: 'so' | 'en';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, lang }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginId, setLoginId] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🤖');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'login') {
      if (!loginId.trim() || !password) {
        setErrorMessage(
          lang === 'so'
            ? 'Fadlan geli magaca ama email-ka iyo furaha sirta ah'
            : 'Please enter your username/email and password'
        );
        return;
      }

      const res = loginUser({ loginId, password });
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMessage(res.error || 'Cilad baa dhacday');
      }
    } else {
      // Register
      if (password !== confirmPassword) {
        setErrorMessage(
          lang === 'so'
            ? 'Labada fure sir (passwords) isma leha!'
            : 'Passwords do not match!'
        );
        return;
      }

      const res = registerUser({
        username,
        email,
        password,
        avatar: selectedAvatar
      });

      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMessage(res.error || 'Cilad baa dhacday');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative text-slate-100 my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500/20 to-emerald-500/20 border border-sky-500/30 text-sky-400">
            {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-lg font-black text-white">
              {mode === 'login'
                ? lang === 'so'
                  ? 'Soo Gal Koontadaada (Sign In)'
                  : 'Welcome Back'
                : lang === 'so'
                ? 'Sameyso Koonto Cusub (Sign Up)'
                : 'Create Player Profile'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'so'
                ? 'Keydi guulahaaga, dhibcaha XP, iyo shaxda tartanka'
                : 'Save your match history, level up, and climb the leaderboard'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'so' ? 'Soo Gal (Login)' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'so' ? 'Is-Diiwaangali (Register)' : 'Sign Up'}
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <span className="font-bold">✕</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              {/* Avatar Picker */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'so' ? 'Dooro Avatar-kaaga:' : 'Choose Avatar:'}</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatar(av.icon)}
                      className={`h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                        selectedAvatar === av.icon
                          ? 'bg-sky-500/20 border-sky-400 scale-105 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                      title={av.label}
                    >
                      {av.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Username Input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {lang === 'so' ? 'Magaca Cayaaryahanka (Username):' : 'Player Username:'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Shaka_ML"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Email:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="magacaaga@email.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </>
          )}

          {mode === 'login' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {lang === 'so' ? 'Magaca ama Email-ka:' : 'Username or Email:'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder={lang === 'so' ? 'Geli magaca ama email-ka' : 'Enter username or email'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}

          {/* Password Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {lang === 'so' ? 'Furaha Sirta ah (Password):' : 'Password:'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-10 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {lang === 'so' ? 'Xaqiiji Furaha Sirta ah:' : 'Confirm Password:'}
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-sky-950/40'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40'
            }`}
          >
            {mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>{lang === 'so' ? 'Soo Gal' : 'Sign In'}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{lang === 'so' ? 'Sameyso Koonto' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>

        {/* Continue as Guest option */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            {lang === 'so' ? 'Ku sii wad Marti ahaan (Play as Guest) →' : 'Continue as Guest →'}
          </button>
        </div>
      </div>
    </div>
  );
};
