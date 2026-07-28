import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Dumbbell, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

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
      <div className="hidden lg:flex lg:w-1/2 gradient-brand relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Dumbbell className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">GymManager Pro</h1>
                <p className="text-sm text-white/70">by FitTech Solutions</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold leading-tight">
              Gerencie sua<br />
              academia com<br />
              <span className="text-yellow-300">excelência</span>
            </h2>
            <p className="text-lg text-white/80 max-w-md">
              Sistema completo para gestão de alunos, planos, aulas, financeiro e muito mais.
            </p>
            <div className="flex gap-8">
              <div>
                <p className="text-3xl font-bold">500+</p>
                <p className="text-sm text-white/60">Academias ativas</p>
              </div>
              <div>
                <p className="text-3xl font-bold">50k+</p>
                <p className="text-sm text-white/60">Alunos gerenciados</p>
              </div>
              <div>
                <p className="text-3xl font-bold">99.9%</p>
                <p className="text-sm text-white/60">Uptime</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-white/50">
            © 2024 FitTech Solutions. Todos os direitos reservados.
          </p>
        </div>

        {/* Decorative shapes */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute top-20 -right-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute bottom-40 left-10 w-20 h-20 bg-white/5 rounded-full" />
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Dumbbell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">GymManager Pro</h1>
              <p className="text-xs text-gray-400">by FitTech Solutions</p>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Entrar</h2>
            <p className="mt-2 text-gray-500">Acesse o painel da Academia LifeFit</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  data-testid="btn-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-brand-600 focus:ring-brand-500" data-testid="checkbox-remember" />
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

          <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Credenciais de teste</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
              <div><span className="font-medium">Admin:</span> admin@lifefit.com</div>
              <div><span className="font-medium">Senha:</span> admin123</div>
              <div><span className="font-medium">Recepção:</span> recepcao@lifefit.com</div>
              <div><span className="font-medium">Senha:</span> recepcao123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
