"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Clock, MapPin, CheckCircle, FileText, CalendarDays, Download } from "lucide-react";
import { generateReceiptPDF } from "@/lib/generateReceipt";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [clockingIn, setClockingIn] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Verificar sessão
    const checkSession = async () => {
      const demoSession = localStorage.getItem("demo_session");
      if (demoSession) {
        setLoading(false);
        requestLocation();
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setLoading(false);
        requestLocation();
      }
    };
    checkSession();
  }, [router]);

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError("");
        },
        (error) => {
          setLocationError("Acesso ao GPS negado. Necessário para registrar ponto.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocationError("Navegador não suporta geolocalização.");
    }
  };

  const handleClockIn = async () => {
    if (!location) {
      alert("Aguardando localização GPS...");
      return;
    }
    
    setClockingIn(true);
    try {
      // Obter o perfil do usuário logado (Company ID)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", session.user.id)
        .single();

      if (!profile) throw new Error("Perfil não encontrado");

      // Inserir registro no Supabase
      const { error: insertError } = await supabase.from("time_records").insert([{
        user_id: session.user.id,
        company_id: profile.company_id,
        record_type: "entrada", // Simplificado para "entrada" para fins de teste
        location_lat: location.lat,
        location_lng: location.lng,
        device_info: navigator.userAgent
      }]);

      if (insertError) {
        // Se for erro de geofence, será disparado pelo PostgreSQL (Trigger)
        throw insertError;
      }

      alert("Ponto registrado com sucesso!");
      
      // Opcionalmente, disparar o download na hora ou habilitar o botão
      handleDownloadReceipt();
    } catch (error: any) {
      alert(error.message || "Erro ao registrar ponto");
    } finally {
      setClockingIn(false);
    }
  };

  const handleDownloadReceipt = async () => {
    // Para fins de demonstração, simulamos os dados que viriam do DB
    const fakeData = {
      companyName: "Residuum Sistemas Ltda",
      companyCnpj: "12.345.678/0001-99",
      employeeName: "Vinicius Gomes De Lima",
      employeeMatricula: "12345",
      employeeCpf: "111.222.333-44",
      recordTime: new Date(),
      nsr: Math.floor(Math.random() * 10000)
    };
    await generateReceiptPDF(fakeData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 pb-24">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Checkpoint
          </h1>
          <p className="text-gray-400 text-sm mt-1">Bem-vindo, Colaborador</p>
        </div>
        <button
          onClick={async () => {
            localStorage.removeItem("demo_session");
            await supabase.auth.signOut();
            router.push("/login");
          }}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Sair
        </button>
      </header>

      {/* Main Action - Bater Ponto */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center mb-8 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/20 blur-[80px] rounded-full" />
        
        <h2 className="text-lg font-semibold text-gray-200 mb-6 z-10">Registrar Ponto</h2>
        
        <button
          onClick={handleClockIn}
          disabled={clockingIn || !!locationError}
          className={`relative z-10 w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 ${
            clockingIn 
              ? 'bg-blue-600/50 scale-95 cursor-not-allowed' 
              : locationError 
                ? 'bg-gray-800 cursor-not-allowed'
                : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:scale-105 active:scale-95 cursor-pointer shadow-blue-500/25'
          }`}
        >
          {clockingIn ? (
            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Clock size={48} className="mb-2 text-white/90" />
              <span className="font-bold text-xl tracking-wide">BATER</span>
              <span className="font-bold text-xl tracking-wide">PONTO</span>
            </>
          )}
        </button>

        <div className="mt-6 flex items-center gap-2 text-sm z-10">
          <MapPin size={16} className={locationError ? "text-red-400" : "text-emerald-400"} />
          <span className={locationError ? "text-red-400" : "text-gray-300"}>
            {locationError || (location ? "GPS Ativo - Localização Obtida" : "Obtendo localização...")}
          </span>
        </div>
      </div>

      {/* Resumo e Ações Rápidas */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={handleDownloadReceipt}
          className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-colors"
        >
          <FileText className="text-blue-400" size={28} />
          <span className="text-sm font-medium">Baixar Comprovante</span>
        </button>
        <button className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-colors">
          <CalendarDays className="text-purple-400" size={28} />
          <span className="text-sm font-medium">Espelho de Ponto</span>
        </button>
      </div>
      
      {/* Últimas Marcações */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-400 mb-4 px-2">Marcações de Hoje</h3>
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-medium">Entrada</span>
            </div>
            <span className="text-gray-300">08:00</span>
          </div>
          <div className="p-4 flex items-center justify-between border-b border-white/5 opacity-50">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="font-medium">Pausa Almoço</span>
            </div>
            <span className="text-gray-500">--:--</span>
          </div>
        </div>
      </div>
    </div>
  );
}
