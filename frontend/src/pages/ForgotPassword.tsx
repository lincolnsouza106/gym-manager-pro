import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import api from '../services/api';
import { Dumbbell, Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      addToast('success', 'Email enviado!', 'Verifique sua caixa de entrada');
    } catch {
      addToast('error', 'Erro', 'Não foi possível enviar o email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-8" data-testid="forgot-password-page">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="flex items-center gap-3 justify-center">
          <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center shadow-glow-brand">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold font-display tracking-tight text-surface-900 dark:text-white">Recuperar Senha</h2>
          <p className="mt-2 text-sm text-gray-500">
            {sent ? 'Verifique sua caixa de entrada' : 'Digite seu email para receber instruções'}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1.5">
                Email cadastrado
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
                  data-testid="input-forgot-email"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3" data-testid="btn-send-reset">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar instruções
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-success-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-success-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Se o email existir em nosso sistema, você receberá instruções para redefinir sua senha.
            </p>
          </div>
        )}

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors" data-testid="link-back-login">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
}
