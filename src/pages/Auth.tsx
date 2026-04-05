import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import logo from '@/assets/logo.png';

export default function Auth() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { register, login, isLoading, error, isAuthenticated } = useAuthContext();

  // Redirect authenticated users to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = (): boolean => {
    setLocalError(null);
    
    if (!formData.email || !formData.password) {
      setLocalError(t("auth.passwordMinLength", "Email e senha são obrigatórios"));
      return false;
    }

    if (!isLogin) {
      if (!formData.name || formData.name.length < 3) {
        setLocalError(t("auth.nameMinLength"));
        return false;
      }
      if (formData.password.length < 6) {
        setLocalError(t("auth.passwordMinLength"));
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setLocalError(t("auth.passwordsDoNotMatch"));
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.name, formData.password, formData.phone, formData.address);
        setSuccessMessage(t("auth.signupSuccess"));
      }
    } catch (err) {
      // Error already set by hook
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
    });
    setLocalError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-orange-500/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl lg:grid-cols-2">
        <div className="hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <img src={logo} alt="VeloTech" className="h-20 w-auto" />
            <p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-orange-100">
              VeloTech Cycling Platform
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight">
              Pedale com estilo, controle e performance.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-orange-50/95">
              Crie sua conta para acompanhar pedidos, montar seu setup ideal e acessar recomendações personalizadas.
            </p>
          </div>

          <ul className="space-y-3 text-sm text-orange-50/95">
            <li>Compra mais rápida com dados salvos</li>
            <li>Histórico completo de pedidos</li>
            <li>Suporte e recomendações inteligentes</li>
          </ul>
        </div>

        <Card className="rounded-none border-0 shadow-none">
          <CardHeader className="space-y-5 px-6 pt-8 sm:px-10 sm:pt-10">
            <div className="flex justify-center lg:hidden">
              <img src={logo} alt="VeloTech" className="h-14 w-auto" />
            </div>

            <div className="mx-auto grid w-full max-w-sm grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  if (!isLogin) {
                    setIsLogin(true);
                    resetForm();
                  }
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t('auth.signIn')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isLogin) {
                    setIsLogin(false);
                    resetForm();
                  }
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  !isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t('auth.signUp')}
              </button>
            </div>

            <div className="text-center">
              <CardTitle className="text-3xl font-black tracking-tight text-slate-900">
                {isLogin ? t('auth.welcome') : t('auth.createAccount')}
              </CardTitle>
              <CardDescription className="mt-2 text-base text-slate-600">
                {isLogin ? 'Acesse sua conta para continuar sua jornada.' : 'Cadastre-se em menos de 1 minuto.'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-8 pt-2 sm:px-10 sm:pb-10">
            {successMessage && (
              <Alert className="mb-5 border-emerald-200 bg-emerald-50">
                <AlertDescription className="text-emerald-800">{successMessage}</AlertDescription>
              </Alert>
            )}

            {(error || localError) && (
              <Alert className="mb-5 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error || localError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-800">
                    {t('auth.name')} *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    placeholder={t('auth.name')}
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-orange-500"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-800">
                  {t('auth.email')} *
                </label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-orange-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-800">
                  {t('auth.password')} *
                </label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder={isLogin ? t('auth.password') : t('auth.passwordMinLength')}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-orange-500"
                />
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-slate-800">
                      {t('auth.confirmPassword')} *
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      placeholder={t('auth.confirmPassword')}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required={!isLogin}
                      className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-orange-500"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-slate-800">
                        {t('auth.phone')}
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        name="phone"
                        placeholder={t('auth.phone')}
                        value={formData.phone}
                        onChange={handleChange}
                        className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="address" className="mb-1.5 block text-sm font-semibold text-slate-800">
                        {t('auth.address')}
                      </label>
                      <Input
                        id="address"
                        type="text"
                        name="address"
                        placeholder={t('auth.address')}
                        value={formData.address}
                        onChange={handleChange}
                        className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-orange-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="mt-2 h-11 w-full bg-slate-900 text-white transition hover:bg-slate-800"
                disabled={isLoading}
              >
                {isLoading ? t('common.loading') : isLogin ? t('auth.signIn') : t('auth.signUp')}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              {isLogin
                ? t('auth.dontHaveAccount', 'Não tem conta? ')
                : t('auth.alreadyHaveAccount', 'Já tem conta? ')}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  resetForm();
                }}
                className="font-semibold text-orange-600 hover:text-orange-700"
              >
                {isLogin ? t('auth.signUp') : t('auth.signIn')}
              </button>
            </p>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
              >
                {t('common.back')}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
