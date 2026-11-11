# Matriz de Trazabilidad y Mapeo del SRS (VETSOFT)

## 1. Mapeo de Requisitos Funcionales vs Implementación SQL

| Requisito Funcional | Componente / Tabla Base de Datos | Garantía Tecnológica / Regla de Negocio |
| :--- | :--- | :--- |
| **RF01: Autenticación y Sesión** | `usuarios`, `roles` | Tokens JWT, BCrypt, OTP con 5 min de validez y bloqueo tras 3 intentos fallidos. |
| **RF05: Gestión de Mascotas** | `mascotas`, `propietarios` | Código único de expediente, relación obligatoria con propietario (`FOREIGN KEY`). |
| **RF06: Gestión de Propietarios** | `propietarios` | Unicidad de Cédula/Documento (`UNIQUE`), búsqueda rápida e historial de paciente. |
| **RF07: Agendamiento de Citas** | `citas` | Control de agenda por fecha/hora y veterinario asignado para evitar empalmes. |
| **RF08: Consultas Médicas** | `consultas` | Registro inmutable de constantes vitales, anamnesis, diagnóstico y tratamiento. |
| **RF09: Control de Vacunas** | `vacunas`, `historia_vacunacion` | Carné digital, control de número de lote y cálculo automático de próximo refuerzo. |
| **RF10: IA Fichas Médicas** | `fichas_ia` | Generación de síntesis ejecutiva y resumen para cliente mediante servicio LLM. |
| **RF11: IA Reportes Administrativos** | `reportes_ejecutivos_ia` | Consolidación de ingresos, vacunas y tendencias epidemiológicas en JSON y texto narrativo. |

---

## 2. Validación de Requisitos No Funcionales (RNF)

* **RNF01 (Tiempo de Respuesta $\le 2s$):** Índices creados en `cedula_documento`, `codigo_expediente` y llaves foráneas para optimizar los `JOIN`.
* **RNF02 (Rendimiento IA $\le 5s$):** Almacenamiento asíncrono en `fichas_ia` y `reportes_ejecutivos_ia`.
* **RNF03 (Protección de Datos):** Cifrado BCrypt en campo `contrasena` de la tabla `usuarios` y cifrado en tránsito HTTPS/TLS.
* **RNF04 (Disponibilidad $99.5\%$):** Motores transaccionales relacionales ACID (InnoDB / PostgreSQL).
* **RNF05 (Escalabilidad $\ge 100$ usuarios):** Vistas calculadas (`vw_existencias`) y procedimientos almacenados transaccionales con bloqueos optimizados (`FOR UPDATE`).

---

## 3. Matriz de Cobertura de Historias de Usuario

| ID Historia | Rol | Cobertura en Base de Datos |
| :--- | :--- | :--- |
| **HU-01** | Recepcionista | Procedimiento de inserción en `mascotas` con validación de `id_propietario`. |
| **HU-02** | Propietario / Recepcionista | Inserción en `citas` cambiando estado de `PENDIENTE` a `CONFIRMADA`. |
| **HU-03** | Veterinario | Inserción transaccional en `consultas` vinculada a la cita correspondida. |
| **HU-04** | Veterinario | Inserción en `historia_vacunacion` validando lote y fecha de vencimiento. |
| **HU-05** | Veterinario | Inserción en `fichas_ia` con bandera `aprobado_por_veterinario`. |
| **HU-06** | Administrador | Invocación de analítica global registrada en `reportes_ejecutivos_ia`. |