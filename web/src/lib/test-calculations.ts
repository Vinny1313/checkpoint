import { calculateDailyJourney } from "./calculations";

const contract = {
  entrada: "08:00",
  saida: "17:00",
  pausaDuracaoMinutos: 60 // 1 hora de almoço
};

function runTest(testName: string, entrada: Date, saida: Date, expectedAtraso: number, expectedExtra: number) {
  const result = calculateDailyJourney([
    { type: "entrada", time: entrada },
    { type: "saida", time: saida }
  ], contract);

  const passed = result.atraso === expectedAtraso && result.horasExtras === expectedExtra;
  console.log(`${passed ? "✅ PASS" : "❌ FAIL"} - ${testName}`);
  if (!passed) {
    console.log(`   Esperado: Atraso=${expectedAtraso}, Extra=${expectedExtra}`);
    console.log(`   Obtido: Atraso=${result.atraso}, Extra=${result.horasExtras}`);
  }
}

// Teste 1: Chegou e saiu exatamente na hora
runTest(
  "Horário exato",
  new Date("2024-01-01T08:00:00"),
  new Date("2024-01-01T17:00:00"),
  0, 0
);

// Teste 2: Atraso de 5 minutos (Dentro da tolerância CLT de 10 min/dia)
runTest(
  "Atraso 5 min (Tolerância)",
  new Date("2024-01-01T08:05:00"),
  new Date("2024-01-01T17:00:00"),
  0, 0
);

// Teste 3: Atraso de 12 minutos (Fora da tolerância CLT, conta tudo)
runTest(
  "Atraso 12 min (Fora da tolerância)",
  new Date("2024-01-01T08:12:00"),
  new Date("2024-01-01T17:00:00"),
  12, 0
);

// Teste 4: Chegou 5 minutos mais cedo e saiu 5 minutos mais tarde (Total 10 min - Tolerância)
runTest(
  "10 min extras no total (Tolerância)",
  new Date("2024-01-01T07:55:00"),
  new Date("2024-01-01T17:05:00"),
  0, 0
);

// Teste 5: 15 minutos extras (Fora da tolerância, conta tudo)
runTest(
  "15 min extras (Fora da tolerância)",
  new Date("2024-01-01T07:45:00"),
  new Date("2024-01-01T17:00:00"),
  0, 15
);
