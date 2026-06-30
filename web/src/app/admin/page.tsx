"use client";

import { useState } from "react";
import { Users, FileText, Settings, ShieldCheck, Download, AlertCircle } from "lucide-react";
import { generateAFD, generateAEJ } from "@/lib/generateFiscalFiles";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const handleExportAFD = async () => {
    // Função simulada de exportação do Arquivo Fonte de Dados
    await generateAFD();
    alert("AFD gerado e baixado com sucesso!");
  };

  const handleExportAEJ = async () => {
    // Função simulada de exportação do Arquivo Eletrônico de Jornada
    await generateAEJ();
    alert("AEJ gerado e baixado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white/5 border-r border-white/10 p-6 flex flex-col">
        <div className="mb-10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
            <ShieldCheck className="text-blue-400" /> DP/RH
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Painel do Gestor</p>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: "overview", icon: Users, label: "Visão Geral" },
            { id: "justifications", icon: AlertCircle, label: "Atestados/Ajustes" },
            { id: "reports", icon: FileText, label: "Arquivos Fiscais" },
            { id: "settings", icon: Settings, label: "Configurações" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 relative overflow-hidden">
        {/* Gradients */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        {activeTab === "overview" && (
          <div className="space-y-6">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-white">Visão Geral Hoje</h2>
              <p className="text-gray-400">Resumo de presenças da equipe.</p>
            </header>

            <div className="grid grid-cols-3 gap-6">
              {[
                { label: "Presentes", value: "42", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                { label: "Atrasos / Faltas", value: "3", color: "text-red-400", bg: "bg-red-400/10" },
                { label: "Em Férias", value: "5", color: "text-blue-400", bg: "bg-blue-400/10" },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">{stat.label}</h3>
                  <div className={`text-4xl font-bold ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-8">
              <h3 className="text-lg font-semibold mb-4">Últimas Marcações</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                        V
                      </div>
                      <div>
                        <p className="font-medium">Vinicius Gomes</p>
                        <p className="text-xs text-gray-400">Dev Team</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-sm font-medium text-emerald-400">Entrada</p>
                        <p className="text-xs text-gray-400">08:02</p>
                      </div>
                      <button className="text-gray-400 hover:text-white px-3 py-1 bg-white/10 rounded text-xs transition-colors">Detalhes</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-6">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-white">Arquivos Fiscais (Portaria 671)</h2>
              <p className="text-gray-400">Exportação de dados brutos e jornadas tratadas.</p>
            </header>

            <div className="grid grid-cols-2 gap-8">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-xl font-bold mb-2">AFD (Arquivo Fonte de Dados)</h3>
                <p className="text-sm text-gray-400 mb-8">
                  Arquivo bruto (.txt) contendo todas as marcações originais. Requisitado em auditorias do Ministério do Trabalho.
                </p>
                <button 
                  onClick={handleExportAFD}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20"
                >
                  <Download size={18} /> Baixar AFD
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-xl font-bold mb-2">AEJ (Arquivo Eletrônico de Jornada)</h3>
                <p className="text-sm text-gray-400 mb-8">
                  Arquivo (.txt) contendo o cruzamento das batidas reais com a jornada contratual, identificando horas extras e atrasos.
                </p>
                <button 
                  onClick={handleExportAEJ}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl transition-all shadow-lg shadow-purple-900/20"
                >
                  <Download size={18} /> Baixar AEJ
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
