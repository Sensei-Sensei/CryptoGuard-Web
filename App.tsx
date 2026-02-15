
import React, { useState, useEffect } from 'react';
import { PasswordInput } from './components/PasswordInput';
import { IconButton } from './components/IconButton';
import { encryptText, decryptText, generatePassword } from './services/cryptoService';

const App: React.FC = () => {
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleAction = async (action: 'encrypt' | 'decrypt') => {
    if (!message || !password) {
      setError('Mensagem e Chave Secreta são obrigatórias.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResult('');
    try {
      const output =
        action === 'encrypt'
          ? await encryptText(message, password)
          : await decryptText(message, password);
      setResult(output);
      setMessage(output);
    } catch (e: any) {
      setError(e.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setMessage(text);
      setToast('Colado da área de transferência');
    } catch (err) {
      setError('Falha ao ler da área de transferência.');
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setToast('Resultado copiado para a área de transferência');
  };
  
  const handleShare = () => {
    if (!result) return;
    if (navigator.share) {
      navigator.share({
        title: 'Resultado do CryptoGuard',
        text: result,
      }).catch((err) => setError('O compartilhamento falhou ou foi cancelado.'));
    } else {
        handleCopy();
        setError('API de compartilhamento não suportada. Copiado para a área de transferência.');
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword(16);
    setPassword(newPassword);
    setToast('Nova chave secreta gerada');
  };

  const handleClear = () => {
    setMessage('');
    setPassword('');
    setResult('');
    setError('');
    setToast('Campos limpos');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 border border-gray-700">
        <header className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            CryptoGuard Web
          </h1>
          <p className="text-gray-400 mt-2">Proteja e revele suas mensagens com segurança.</p>
        </header>

        <div className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem aqui..."
            className="w-full h-32 bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            aria-label="Mensagem para criptografar ou descriptografar"
          />
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        
        {error && <p role="alert" className="text-red-400 text-center text-sm">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleAction('encrypt')}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
          >
            {isLoading ? 'Processando...' : 'Proteger Mensagem'}
          </button>
          <button
            onClick={() => handleAction('decrypt')}
            disabled={isLoading}
            className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
          >
            {isLoading ? 'Processando...' : 'Revelar Mensagem'}
          </button>
        </div>

        {result && (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-300">Resultado:</h3>
            <div className="relative group">
              <textarea
                readOnly
                value={result}
                className="w-full h-32 bg-gray-900/50 text-gray-300 font-mono text-sm border border-gray-700 rounded-md p-4 focus:outline-none resize-none"
                aria-label="Resultado da Criptografia ou Descriptografia"
              />
              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <IconButton onClick={handleCopy} label="Copiar Resultado" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} />
                <IconButton onClick={handleShare} label="Compartilhar Resultado" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>} />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center space-x-2 border-t border-gray-700 pt-4">
           <IconButton onClick={handlePaste} label="Colar Mensagem" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
           <IconButton onClick={handleGeneratePassword} label="Gerar Chave Secreta" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>} />
           <IconButton onClick={handleClear} label="Limpar Tudo" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>} />
        </div>
      </div>
      
      <div aria-live="polite" aria-atomic="true" className={`fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg transition-transform duration-300 ${toast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {toast}
      </div>
    </div>
  );
};

export default App;
