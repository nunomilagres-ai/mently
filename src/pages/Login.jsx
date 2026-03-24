import { useSearchParams } from 'react-router-dom'
import { Heart } from 'lucide-react'

const ERROR_LABELS = {
  acesso_negado:     'Acesso negado — esta conta não tem permissão.',
  estado_invalido:   'Erro de segurança (estado CSRF inválido). Tenta novamente.',
  sem_codigo:        'Não foi recebido o código de autorização.',
  token_falhou:      'Não foi possível obter o token de acesso.',
  token_invalido:    'Token inválido devolvido pelo Google.',
  userinfo_falhou:   'Não foi possível obter os dados do utilizador.',
  userinfo_invalido: 'Dados do utilizador inválidos.',
}

export default function Login() {
  const [params] = useSearchParams()
  const error    = params.get('error')

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm text-center space-y-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center shadow-md">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mently</h1>
          <p className="text-sm text-gray-500">O teu painel de saúde pessoal</p>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {ERROR_LABELS[error] || `Erro: ${error}`}
          </div>
        )}

        {/* Botão Google */}
        <a
          href="/api/auth/google"
          className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Entrar com Google
        </a>

        <p className="text-xs text-gray-400">
          Os teus dados ficam na tua conta pessoal e são privados.
        </p>
      </div>
    </div>
  )
}
