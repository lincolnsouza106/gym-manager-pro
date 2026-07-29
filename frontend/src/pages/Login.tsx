import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Dumbbell, Mail, Lock, ArrowRight, Eye, EyeOff, Zap, Shield, Users } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      addToast('success', 'Login realizado!', 'Bem-vindo ao GymManager Pro');
      navigate('/dashboard');
    } catch (error: any) {
      addToast('error', 'Erro no login', error.response?.data?.error || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #042f2e 0%, #0f766e 40%, #0d9488 70%, #115e59 100%)' }}>
        {/* Decorative shapes */}
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/5 rounded-full blur-xl animate-float" />
        <div className="absolute top-16 -right-12 w-48 h-48 bg-brand-400/10 rounded-full blur-lg animate-float-delayed" />
        <div className="absolute bottom-32 left-8 w-24 h-24 bg-accent-500/10 rounded-full blur-md animate-float" />
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-white/3 rounded-full blur-2xl" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Dumbbell className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display tracking-tight">GymManager Pro</h1>
                <p className="text-sm text-white/50 font-medium">by FitTech Solutions</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl font-extrabold leading-tight font-display tracking-tight">
              Gerencie sua<br />
              academia com<br />
              <span className="text-accent-400">excelência</span>
            </h2>
            <p className="text-lg text-white/60 max-w-md leading-relaxed">
              Sistema completo para gestão de alunos, planos, aulas, financeiro e muito mais.
            </p>
            <div className="flex gap-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-brand-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">500+</p>
                  <p className="text-xs text-white/40 font-medium">Academias ativas</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">50k+</p>
                  <p className="text-xs text-white/40 font-medium">Alunos gerenciados</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">99.9%</p>
                  <p className="text-xs text-white/40 font-medium">Uptime</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-white/30">
            © 2024 FitTech Solutions. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-50 dark:bg-surface-950">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center shadow-glow-brand">
              <Dumbbell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight gradient-text">GymManager Pro</h1>
              <p className="text-xs text-gray-400 font-medium">by FitTech Solutions</p>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold font-display tracking-tight text-surface-900 dark:text-white">Bem-vindo de volta</h2>
            <p className="mt-2 text-gray-500">Acesse o painel da Academia LifeFit</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="input-base pl-11"
                  required
                  data-testid="input-email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base pl-11 pr-11"
                  required
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-surface-700 dark:hover:text-gray-200 transition-colors"
                  data-testid="btn-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-surface-200 text-brand-600 focus:ring-brand-500" data-testid="checkbox-remember" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Lembrar-me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-brand-600 hover:text-brand-700 font-medium" data-testid="link-forgot-password">
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
              data-testid="btn-login"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="bg-surface-100 dark:bg-surface-800/50 rounded-xl p-4 space-y-2 border border-surface-200/50 dark:border-surface-700/30">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Credenciais de teste</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
              <div><span className="font-semibold text-surface-700 dark:text-gray-300">Admin:</span> admin@lifefit.com</div>
              <div><span className="font-semibold text-surface-700 dark:text-gray-300">Senha:</span> admin123</div>
              <div><span className="font-semibold text-surface-700 dark:text-gray-300">Recepção:</span> recepcao@lifefit.com</div>
              <div><span className="font-semibold text-surface-700 dark:text-gray-300">Senha:</span> recepcao123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
