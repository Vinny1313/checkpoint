// Simulação da geração dos arquivos fiscais AFD e AEJ

export async function generateAFD() {
  const mockContent = `0000000001
12345678000199Residuum Sistemas Ltda
00000000101012024080011122233344
00000000201012024120011122233344
00000000301012024130011122233344
00000000401012024170011122233344`;
  
  downloadTxtFile(mockContent, "AFD_Residuum.txt");
}

export async function generateAEJ() {
  const mockContent = `0000000001
12345678000199Residuum Sistemas Ltda
11122233344Vinicius Gomes De Lima
01012024080000101202417000`;
  
  downloadTxtFile(mockContent, "AEJ_Residuum.txt");
}

function downloadTxtFile(content: string, filename: string) {
  const element = document.createElement("a");
  const file = new Blob([content], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
  document.body.removeChild(element);
}
