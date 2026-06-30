-- Adicionar campos de localização base na tabela companies
ALTER TABLE public.companies 
ADD COLUMN base_lat DOUBLE PRECISION,
ADD COLUMN base_lng DOUBLE PRECISION,
ADD COLUMN allowed_radius_meters INTEGER DEFAULT 100;

-- Função para calcular distância entre duas coordenadas (Fórmula de Haversine)
CREATE OR REPLACE FUNCTION calculate_distance(lat1 FLOAT, lon1 FLOAT, lat2 FLOAT, lon2 FLOAT)
RETURNS FLOAT AS $$
DECLARE
    radius_earth FLOAT := 6371000; -- Raio da Terra em metros
    dlat FLOAT;
    dlon FLOAT;
    a FLOAT;
    c FLOAT;
    distance FLOAT;
BEGIN
    -- Converter graus para radianos
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    lat1 := radians(lat1);
    lat2 := radians(lat2);

    -- Aplicar fórmula
    a := (sin(dlat / 2) ^ 2) + cos(lat1) * cos(lat2) * (sin(dlon / 2) ^ 2);
    c := 2 * atan2(sqrt(a), sqrt(1 - a));
    distance := radius_earth * c;

    RETURN distance;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger para validar se a marcação de ponto está dentro do raio permitido da empresa
CREATE OR REPLACE FUNCTION validate_time_record_location()
RETURNS TRIGGER AS $$
DECLARE
    empresa RECORD;
    distancia FLOAT;
BEGIN
    -- Buscar a empresa do colaborador
    SELECT base_lat, base_lng, allowed_radius_meters INTO empresa
    FROM public.companies
    WHERE id = NEW.company_id;

    -- Se a empresa tiver geolocalização definida, validar
    IF empresa.base_lat IS NOT NULL AND empresa.base_lng IS NOT NULL THEN
        distancia := calculate_distance(NEW.location_lat, NEW.location_lng, empresa.base_lat, empresa.base_lng);
        
        IF distancia > empresa.allowed_radius_meters THEN
            RAISE EXCEPTION 'Localização fora do raio permitido da empresa. Distância: %m. Permitido: %m.', trunc(distancia::numeric, 2), empresa.allowed_radius_meters;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_location_geofence
BEFORE INSERT ON public.time_records
FOR EACH ROW
EXECUTE FUNCTION validate_time_record_location();
