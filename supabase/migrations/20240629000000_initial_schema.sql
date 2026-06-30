-- Habilitar a extensão pgcrypto para uso de UUIDs e hashes
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de Empresas
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cnpj TEXT UNIQUE NOT NULL,
    razao_social TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Perfis (Vinculada à auth.users do Supabase)
-- Nota: Como o login será por "Matrícula + Senha", o frontend mapeará a matrícula para um e-mail falso
-- Exemplo: 123456@residuum.com
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id),
    matricula TEXT UNIQUE NOT NULL,
    nome_completo TEXT NOT NULL,
    cpf TEXT UNIQUE,
    pis TEXT UNIQUE,
    cargo TEXT,
    jornada_entrada TIME,
    jornada_saida TIME,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Registros de Ponto (Marcacoes)
CREATE TABLE public.time_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id),
    nsr BIGSERIAL, -- Número Sequencial de Registro (Obrigatório pela Portaria 671)
    record_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    record_type TEXT NOT NULL CHECK (record_type IN ('entrada', 'saida', 'pausa', 'retorno')),
    location_lat DOUBLE PRECISION NOT NULL, -- Obrigatório para validação de presença
    location_lng DOUBLE PRECISION NOT NULL,
    device_info TEXT,
    hash_sha256 TEXT, -- Geração do Hash para o comprovante
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Justificativas e Atestados
CREATE TABLE public.justifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id),
    date DATE NOT NULL,
    reason TEXT NOT NULL,
    document_url TEXT, -- URL do arquivo no Supabase Storage
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    reviewed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justifications ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (RLS)
-- Empresas: Admins veem tudo
CREATE POLICY "Admins podem ver empresas" ON public.companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
        )
    );

-- Perfis: Usuários veem seus próprios perfis, admins veem todos da mesma empresa
CREATE POLICY "Usuários veem o próprio perfil" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins veem perfis da empresa" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles AS admin
            WHERE admin.id = auth.uid() AND admin.is_admin = TRUE AND admin.company_id = profiles.company_id
        )
    );

-- Marcações (time_records): Usuários veem e inserem as próprias. Admins veem todas da empresa.
CREATE POLICY "Usuários podem inserir próprias marcações" ON public.time_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários veem próprias marcações" ON public.time_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins veem marcações da empresa" ON public.time_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE AND profiles.company_id = time_records.company_id
        )
    );

-- Justificativas: Usuários inserem as próprias. Admins gerenciam da empresa.
CREATE POLICY "Usuários inserem justificativas" ON public.justifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários veem próprias justificativas" ON public.justifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins gerenciam justificativas" ON public.justifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE AND profiles.company_id = justifications.company_id
        )
    );
