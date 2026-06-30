/**
 * Cálculos de jornada de trabalho baseados na CLT (Artigo 58, § 1º)
 * Tolerância diária de 10 minutos (5 minutos por marcação).
 */

interface TimeRecord {
  type: "entrada" | "saida" | "pausa" | "retorno";
  time: Date;
}

interface ContractualHours {
  entrada: string; // HH:mm
  saida: string;   // HH:mm
  pausaDuracaoMinutos: number;
}

export function calculateDailyJourney(records: TimeRecord[], contract: ContractualHours) {
  // Simulação simples para uma jornada com 1 entrada e 1 saída
  const entradaReal = records.find(r => r.type === "entrada");
  const saidaReal = records.find(r => r.type === "saida");

  if (!entradaReal || !saidaReal) {
    return { status: "incompleto", horasTrabalhadas: 0, horasExtras: 0, atraso: 0 };
  }

  // Converter horários contratuais para datas no mesmo dia
  const [horaEntradaContrato, minEntradaContrato] = contract.entrada.split(":").map(Number);
  const [horaSaidaContrato, minSaidaContrato] = contract.saida.split(":").map(Number);

  const entradaContratual = new Date(entradaReal.time);
  entradaContratual.setHours(horaEntradaContrato, minEntradaContrato, 0, 0);

  const saidaContratual = new Date(saidaReal.time);
  saidaContratual.setHours(horaSaidaContrato, minSaidaContrato, 0, 0);

  // Diferença em minutos
  const diffEntradaMinutos = (entradaReal.time.getTime() - entradaContratual.getTime()) / 60000;
  const diffSaidaMinutos = (saidaReal.time.getTime() - saidaContratual.getTime()) / 60000;

  let totalVariacao = diffEntradaMinutos + diffSaidaMinutos;
  let atrasoTotal = 0;
  let horaExtraTotal = 0;

  // Se o funcionário chegou depois (diffEntrada > 0)
  if (diffEntradaMinutos > 0) atrasoTotal += diffEntradaMinutos;
  // Se o funcionário chegou antes (diffEntrada < 0)
  if (diffEntradaMinutos < 0) horaExtraTotal += Math.abs(diffEntradaMinutos);

  // Se o funcionário saiu depois (diffSaida > 0)
  if (diffSaidaMinutos > 0) horaExtraTotal += diffSaidaMinutos;
  // Se o funcionário saiu antes (diffSaida < 0)
  if (diffSaidaMinutos < 0) atrasoTotal += Math.abs(diffSaidaMinutos);

  // Aplicação da Súmula 366 do TST (Tolerância de 10 minutos diários)
  // Se a variação total do dia (atrasos + horas extras adiantadas) não exceder 10 min, é desconsiderada.
  const variacaoTotalAbsoluta = atrasoTotal + horaExtraTotal;

  if (variacaoTotalAbsoluta <= 10) {
    atrasoTotal = 0;
    horaExtraTotal = 0;
  }

  const horasTrabalhadas = ((saidaReal.time.getTime() - entradaReal.time.getTime()) / 60000) - contract.pausaDuracaoMinutos;

  return {
    status: "completo",
    horasTrabalhadas: Math.max(0, Math.floor(horasTrabalhadas)),
    horasExtras: Math.floor(horaExtraTotal),
    atraso: Math.floor(atrasoTotal)
  };
}
