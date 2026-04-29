CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash TEXT NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('estudiante', 'docente', 'admin')) DEFAULT 'estudiante',
    avatar TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sensor_readings (
    id SERIAL PRIMARY KEY,
    humedad_suelo NUMERIC(5,2) NOT NULL,
    temperatura NUMERIC(5,2) NOT NULL,
    luminosidad NUMERIC(8,2) NOT NULL,
    humedad_ambiental NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alertas (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(20) CHECK (tipo IN ('info', 'advertencia', 'critico')) NOT NULL,
    variable VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recomendaciones (
    id SERIAL PRIMARY KEY,
    prioridad VARCHAR(20) CHECK (prioridad IN ('baja', 'media', 'alta')) NOT NULL,
    accion VARCHAR(255) NOT NULL,
    descripcion TEXT,
    variable VARCHAR(100),
    icono VARCHAR(10) DEFAULT '💡',
    confianza NUMERIC(5,2),
    aplicada BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE experimentos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    hipotesis TEXT NOT NULL,
    cultivo VARCHAR(100),
    duracion INTEGER,
    progreso INTEGER DEFAULT 0,
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'activo', 'completado')) DEFAULT 'pendiente',
    observaciones INTEGER DEFAULT 0,
    variables JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE etapas_cultivo (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'en_progreso', 'completado')) DEFAULT 'pendiente',
    fecha VARCHAR(50),
    icono VARCHAR(10) DEFAULT '🌱',
    descripcion TEXT,
    datos JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_config (
    id SERIAL PRIMARY KEY,
    humedad_min NUMERIC(5,2) DEFAULT 25,
    humedad_max NUMERIC(5,2) DEFAULT 80,
    temp_min NUMERIC(5,2) DEFAULT 15,
    temp_max NUMERIC(5,2) DEFAULT 35,
    luz_min NUMERIC(8,2) DEFAULT 200,
    luz_max NUMERIC(8,2) DEFAULT 1000,
    intervalo_sensor INTEGER DEFAULT 10,
    alertas_email BOOLEAN DEFAULT true,
    alertas_dashboard BOOLEAN DEFAULT true,
    cultivo_actual VARCHAR(100) DEFAULT 'Tomate Cherry',
    etapa_actual VARCHAR(100) DEFAULT 'Crecimiento Vegetativo',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── SEED DATA ────────────────────────────────────────────────────────────────

INSERT INTO users (username, nombre, email, password_hash, rol, avatar) VALUES
('alumno_pedro',  'Pedro García',      'pedro@uc.edu.pe',  '1234', 'estudiante', '🌱'),
('profesor_juan', 'Prof. Juan López',  'juan@uc.edu.pe',   '1234', 'docente',    '🌿'),
('admin_sistema', 'Administrador',     'admin@uc.edu.pe',  '1234', 'admin',      '🌳'),
('alumno_maria',  'María Flores',      'maria@uc.edu.pe',  '1234', 'estudiante', '🌱'),
('docente_ana',   'Prof. Ana Torres',  'ana@uc.edu.pe',    '1234', 'docente',    '🌿');

INSERT INTO alertas (tipo, variable, mensaje) VALUES
('advertencia', 'Humedad del Suelo', 'Humedad baja en Sector B'),
('critico',     'Temperatura',       'Temperatura elevada detectada'),
('info',        'Riego',             'Riego automático programado para las 18:00');

INSERT INTO recomendaciones (prioridad, accion, descripcion, variable, icono, confianza) VALUES
('alta',  'Aumentar frecuencia de riego',      'Los niveles de humedad en el Sector A están por debajo del óptimo. Incrementa el riego un 20% los próximos 3 días.', 'Humedad del Suelo', '💧', 94),
('alta',  'Instalar malla de sombra',           'La luminosidad excesiva afecta el crecimiento de las lechugas. Instala una malla al 30%.', 'Luminosidad', '☀️', 88),
('media', 'Monitorear temperatura nocturna',    'Variaciones nocturnas detectadas que podrían afectar los tomates. Considera cobertura térmica.', 'Temperatura', '🌡️', 76),
('baja',  'Registrar etapa de crecimiento',     'Han pasado 7 días desde el último registro. Documenta el avance actual del cultivo.', 'General', '📝', 60);

INSERT INTO experimentos (titulo, hipotesis, cultivo, duracion, progreso, estado, observaciones, variables) VALUES
('Efecto de la frecuencia de riego en lechugas', 'Aumentar el riego de 2 a 3 veces mejorará el crecimiento un 15%.', 'Lechuga Romana',        14, 65,  'activo',     8,  '["Humedad del Suelo", "Frecuencia de Riego"]'),
('Comparación de sustratos orgánicos',           'El sustrato con 40% de compost produce tomates con más nutrientes.', 'Tomate Cherry',    30, 85,  'activo',     15, '["Composición del Suelo", "pH"]'),
('Impacto de luz LED en albahaca',               'Luz LED roja 4h extra aumentará la producción de aceites esenciales.', 'Albahaca',         21, 100, 'completado', 21, '["Luminosidad", "Espectro de Luz"]'),
('Rotación de cultivos y salud del suelo',       'La rotación entre legumbres mejorará el nivel de nitrógeno.', 'Frijoles / Zanahorias', 60, 20,  'pendiente',  3,  '["Nitrógeno", "Microorganismos"]');

INSERT INTO etapas_cultivo (nombre, estado, fecha, icono, descripcion, datos) VALUES
('Preparación del Suelo', 'completado',  '15 Feb 2024',         '🌍', 'Acondicionamiento con compost orgánico y verificación del pH.',                         '{"pH inicial": "6.2", "Compost": "5kg/m²", "Profundidad": "20cm"}'),
('Siembra de Semillas',   'completado',  '22 Feb 2024',         '🌱', 'Siembra directa de tomate cherry variedad Sun Gold a 30cm entre plantas.',              '{"Variedad": "Sun Gold", "Profundidad": "1cm", "Distancia": "30cm"}'),
('Germinación',           'completado',  '1 Mar 2024',          '🌿', 'Emergencia de plántulas con 92% de éxito.',                                              '{"Tasa": "92%", "Días": "7", "Temperatura": "22°C"}'),
('Crecimiento Vegetativo','en_progreso', '15 Mar 2024',         '🌳', 'Desarrollo de hojas y tallos. Plantas a 25cm de altura.',                               '{"Altura": "25cm", "Hojas": "8-10", "Nutrición": "Óptima"}'),
('Floración',             'pendiente',   '5 Abr 2024 (est.)',   '🌸', 'Inicio esperado de la floración. Se monitoreará la polinización.',                      '{"Flores/planta": "15-20", "Duración": "2 semanas"}'),
('Cosecha',               'pendiente',   '15 May 2024 (est.)',  '🍅', 'Recolección de frutos maduros al color rojo intenso.',                                  '{"Frutos/planta": "40-50", "Peso": "15-20g"}');

INSERT INTO system_config DEFAULT VALUES;

INSERT INTO sensor_readings (humedad_suelo, temperatura, luminosidad, humedad_ambiental) VALUES
(68.5, 23.8, 850.0, 72.3),
(67.2, 24.1, 870.5, 71.8),
(66.8, 24.5, 890.2, 71.2),
(65.5, 25.0, 910.8, 70.5),
(64.2, 25.3, 930.1, 70.1),
(63.8, 25.7, 920.4, 69.8),
(63.0, 26.0, 900.6, 69.5),
(62.5, 26.2, 880.3, 69.2),
(62.0, 26.0, 860.7, 69.0),
(61.5, 25.8, 840.9, 68.8),
(61.0, 25.5, 820.2, 68.5),
(60.5, 25.2, 800.5, 68.2);
