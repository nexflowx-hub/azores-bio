import Link from 'next/link';
import { AlertCircle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8f5f0]">
      <div className="w-full max-w-lg mx-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse" />
            <AlertCircle className="relative h-16 w-16 text-red-500" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-[#1a3a3a] mb-2">404</h1>

        <h2 className="text-xl font-semibold text-[#3d3d3d] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Página Não Encontrada
        </h2>

        <p className="text-[#6b6b6b] mb-8 leading-relaxed">
          A página que procura não existe.
          <br />
          Pode ter sido movida ou eliminada.
        </p>

        <Link href="/">
          <button className="flex items-center gap-2 bg-[#1a3a3a] text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:bg-[#2d5a5a] mx-auto">
            <Home className="w-4 h-4" />
            Voltar ao Início
          </button>
        </Link>
      </div>
    </div>
  );
}
