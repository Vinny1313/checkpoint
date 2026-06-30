import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Criando empresa padrão...");
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert([
      {
        cnpj: "12345678000199",
        razao_social: "Residuum Sistemas Ltda",
        base_lat: -23.550520, // São Paulo center
        base_lng: -46.633308,
        allowed_radius_meters: 50000 // 50km radius para testes mais fáceis
      }
    ])
    .select()
    .single();

  if (companyError) {
    console.error("Erro ao criar empresa:", companyError.message);
    return;
  }
  
  console.log("Empresa criada:", company.id);

  console.log("Criando usuário/colaborador...");
  const email = "12345@checkpoint.residuum.com";
  const password = "admin";
  
  // Note: signUp will insert a row in auth.users
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  });

  if (authError) {
    console.error("Erro no Auth:", authError.message);
    return;
  }

  const userId = authData.user.id;
  console.log("Usuário autenticado criado com sucesso:", userId);

  // Agora vamos inserir o Profile
  const { error: profileError } = await supabase
    .from("profiles")
    .insert([
      {
        id: userId,
        company_id: company.id,
        matricula: "12345",
        nome_completo: "Colaborador Teste (Residuum)",
        cpf: "111.222.333-44",
        jornada_entrada: "08:00",
        jornada_saida: "17:00",
        is_admin: true
      }
    ]);

  if (profileError) {
    console.error("Erro ao criar profile:", profileError.message);
  } else {
    console.log("Profile criado com sucesso!");
    console.log("================================");
    console.log("Pode testar o login com:");
    console.log("Matrícula: 12345");
    console.log("Senha: admin");
  }
}

seed();
