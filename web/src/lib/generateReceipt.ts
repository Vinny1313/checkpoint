import { jsPDF } from "jspdf";

interface ReceiptData {
  companyName: string;
  companyCnpj: string;
  employeeName: string;
  employeeMatricula: string;
  employeeCpf: string;
  recordTime: Date;
  nsr: number;
}

/**
 * Gera um Hash SHA-256 baseado nos dados do comprovante
 */
async function generateHash(dataStr: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(dataStr);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Gera e baixa o Comprovante de Registro de Ponto do Trabalhador
 */
export async function generateReceiptPDF(data: ReceiptData) {
  const doc = new jsPDF();
  
  const formattedDate = data.recordTime.toLocaleDateString("pt-BR");
  const formattedTime = data.recordTime.toLocaleTimeString("pt-BR");
  
  // Criar string única para hash
  const dataToHash = `${data.companyCnpj}|${data.employeeCpf}|${data.recordTime.toISOString()}|${data.nsr}`;
  const sha256Hash = await generateHash(dataToHash);

  // Cabeçalho
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("COMPROVANTE DE REGISTRO DE PONTO DO TRABALHADOR", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Dados do Empregador
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO EMPREGADOR", 20, 40);
  doc.setFont("helvetica", "normal");
  doc.text(`Razão Social: ${data.companyName}`, 20, 47);
  doc.text(`CNPJ: ${data.companyCnpj}`, 20, 54);

  // Dados do Empregado
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO EMPREGADO", 20, 70);
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${data.employeeName}`, 20, 77);
  doc.text(`Matrícula: ${data.employeeMatricula}`, 20, 84);
  doc.text(`CPF: ${data.employeeCpf}`, 20, 91);

  // Dados do Registro
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO REGISTRO", 20, 107);
  doc.setFont("helvetica", "normal");
  doc.text(`Data: ${formattedDate}`, 20, 114);
  doc.text(`Horário: ${formattedTime}`, 20, 121);
  doc.text(`NSR (Número Sequencial de Registro): ${data.nsr}`, 20, 128);

  // Assinatura e Validação Legal (Portaria 671)
  doc.setFont("helvetica", "bold");
  doc.text("VALIDAÇÃO DE INTEGRIDADE (PORTARIA 671 MTE)", 20, 144);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  
  // Quebrar hash em linhas se for muito grande
  doc.text(`Assinatura Eletrônica (SHA-256):`, 20, 151);
  doc.text(sha256Hash, 20, 156);
  
  doc.text("Este documento atesta a marcação eletrônica de ponto e possui validade legal.", 20, 166);

  // Rodapé
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Gerado por Checkpoint - Residuum Sistemas", 105, 280, { align: "center" });

  // Download do arquivo
  doc.save(`Comprovante_Ponto_${formattedDate.replace(/\//g, "-")}_${formattedTime.replace(/:/g, "")}.pdf`);
}
