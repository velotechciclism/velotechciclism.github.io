import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import logo from '@/assets/logo.png';

type PhoneCountry = {
  code: string;
  name: string;
  dialCode: string;
  example: string;
};

const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: 'PT', name: 'Portugal', dialCode: '+351', example: '912345678' },
  { code: 'ES', name: 'Espanha', dialCode: '+34', example: '612345678' },
  { code: 'FR', name: 'Franca', dialCode: '+33', example: '612345678' },
  { code: 'DE', name: 'Alemanha', dialCode: '+49', example: '15123456789' },
  { code: 'IT', name: 'Italia', dialCode: '+39', example: '3123456789' },
  { code: 'NL', name: 'Paises Baixos', dialCode: '+31', example: '612345678' },
  { code: 'BE', name: 'Belgica', dialCode: '+32', example: '470123456' },
  { code: 'IE', name: 'Irlanda', dialCode: '+353', example: '851234567' },
  { code: 'GB', name: 'Reino Unido', dialCode: '+44', example: '7400123456' },
  { code: 'CH', name: 'Suica', dialCode: '+41', example: '781234567' },
  { code: 'SE', name: 'Suecia', dialCode: '+46', example: '701234567' },
  { code: 'NO', name: 'Noruega', dialCode: '+47', example: '41234567' },
  { code: 'DK', name: 'Dinamarca', dialCode: '+45', example: '20123456' },
  { code: 'FI', name: 'Finlandia', dialCode: '+358', example: '401234567' },
  { code: 'US', name: 'Estados Unidos', dialCode: '+1', example: '2025550123' },
  { code: 'CA', name: 'Canada', dialCode: '+1', example: '4165550123' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', example: '5512345678' },
  { code: 'BR', name: 'Brasil', dialCode: '+55', example: '11912345678' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', example: '91123456789' },
  { code: 'CL', name: 'Chile', dialCode: '+56', example: '912345678' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', example: '3001234567' },
  { code: 'PE', name: 'Peru', dialCode: '+51', example: '912345678' },
  { code: 'UY', name: 'Uruguai', dialCode: '+598', example: '91234567' },
];

function getCountryByCode(code: string): PhoneCountry {
  return PHONE_COUNTRIES.find((country) => country.code === code) || PHONE_COUNTRIES[0];
}

function normalizePhoneInput(rawPhone: string, countryDialCode: string): string {
  const cleaned = rawPhone.trim();

  if (!cleaned) {
    return '';
  }

  const onlyDigits = cleaned.replace(/\D/g, '');

  if (!onlyDigits) {
    return '';
  }

  if (cleaned.startsWith('+')) {
    return `+${onlyDigits}`;
  }

  const dialDigits = countryDialCode.replace(/\D/g, '');

  if (onlyDigits.startsWith(dialDigits)) {
    return `+${onlyDigits}`;
  }

  return `${countryDialCode}${onlyDigits}`;
}

export default function Auth() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [selectedCountryCode, setSelectedCountryCode] = useState('PT');
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
  const selectedCountry = getCountryByCode(selectedCountryCode);


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
      setLocalError(t("auth.passwordMinLength", "E-mail e senha são obrigatórios"));
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

      if (formData.phone.trim()) {
        const normalizedPhone = normalizePhoneInput(formData.phone, selectedCountry.dialCode);

        if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
          setLocalError('Numero de telefone invalido para o pais selecionado.');
          return false;
        }
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
        const normalizedPhone = normalizePhoneInput(formData.phone, selectedCountry.dialCode);
        await register(
          formData.email,
          formData.name,
          formData.password,
          normalizedPhone || undefined,
          formData.address
        );
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

      <div className="relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-white/15 bg-slate-900/95 shadow-2xl lg:grid-cols-2">
        <div className="hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <img src={logo} alt="VeloTech" className="h-20 w-auto" />
            <p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-orange-100">
              Plataforma de Ciclismo VeloTech
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight">
              Pedale com estilo, controle e desempenho.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-orange-50/95">
              Crie sua conta para acompanhar pedidos, montar seu conjunto ideal e acessar recomendações personalizadas.
            </p>
          </div>

          <ul className="space-y-3 text-sm text-orange-50/95">
            <li>Compra mais rápida com dados salvos</li>
            <li>Histórico completo de pedidos</li>
            <li>Suporte e recomendações inteligentes</li>
          </ul>
        </div>

        <Card className="rounded-none border-0 bg-transparent shadow-none">
          <CardHeader className="space-y-5 px-6 pt-8 sm:px-10 sm:pt-10">
            <div className="flex justify-center lg:hidden">
              <img src={logo} alt="VeloTech" className="h-14 w-auto" />
            </div>

            <div className="mx-auto grid w-full max-w-sm grid-cols-2 rounded-xl bg-slate-800 p-1">
              <button
                type="button"
                onClick={() => {
                  if (!isLogin) {
                    setIsLogin(true);
                    resetForm();
                  }
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isLogin ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-300 hover:text-white'
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
                  !isLogin ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                {t('auth.signUp')}
              </button>
            </div>

            <div className="text-center">
              <CardTitle className="text-3xl font-black tracking-tight text-white">
                {isLogin ? t('auth.welcome') : t('auth.createAccount')}
              </CardTitle>
              <CardDescription className="mt-2 text-base text-slate-200">
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
                  <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-white">
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
                    className="h-11 border-white/20 bg-slate-800/80 text-white placeholder:text-slate-400 focus-visible:ring-orange-500"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-white">
                  {t('auth.email')} *
                </label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="seu@exemplo.pt"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11 border-white/20 bg-slate-800/80 text-white placeholder:text-slate-400 focus-visible:ring-orange-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-white">
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
                  className="h-11 border-white/20 bg-slate-800/80 text-white placeholder:text-slate-400 focus-visible:ring-orange-500"
                />
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-white">
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
                      className="h-11 border-white/20 bg-slate-800/80 text-white placeholder:text-slate-400 focus-visible:ring-orange-500"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-white">
                        {t('auth.phone')}
                      </label>
                      <div className="grid grid-cols-[132px_1fr] gap-2">
                        <select
                          aria-label="Pais do telefone"
                          value={selectedCountryCode}
                          onChange={(e) => setSelectedCountryCode(e.target.value)}
                          className="h-11 rounded-md border border-white/20 bg-slate-800/80 px-2 text-sm text-white outline-none ring-offset-background focus:border-orange-400"
                        >
                          {PHONE_COUNTRIES.map((country) => (
                            <option key={country.code} value={country.code} className="bg-slate-900 text-white">
                              {country.code} {country.dialCode}
                            </option>
                          ))}
                        </select>
                        <Input
                          id="phone"
                          type="tel"
                          name="phone"
                          placeholder={selectedCountry.example}
                          value={formData.phone}
                          onChange={handleChange}
                          className="h-11 border-white/20 bg-slate-800/80 text-white placeholder:text-slate-400 focus-visible:ring-orange-500"
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-300">
                        O número será salvo em formato internacional ({selectedCountry.dialCode}).
                      </p>
                    </div>

                    <div>
                      <label htmlFor="address" className="mb-1.5 block text-sm font-semibold text-white">
                        {t('auth.address')}
                      </label>
                      <Input
                        id="address"
                        type="text"
                        name="address"
                        placeholder={t('auth.address')}
                        value={formData.address}
                        onChange={handleChange}
                        className="h-11 border-white/20 bg-slate-800/80 text-white placeholder:text-slate-400 focus-visible:ring-orange-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="mt-2 h-11 w-full bg-orange-500 text-white transition hover:bg-orange-600"
                disabled={isLoading}
              >
                {isLoading ? t('common.loading') : isLogin ? t('auth.signIn') : t('auth.signUp')}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-200">
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
                className="text-sm font-medium text-slate-300 transition hover:text-white"
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
