# 💰 Finanzas Personales — Desafío Práctico #3

Aplicación móvil desarrollada en **React Native (Expo)** para el control de finanzas personales. Permite gestionar transacciones, cuentas múltiples, presupuestos mensuales y visualizar estadísticas a través de un dashboard interactivo.

> Universidad Don Bosco · Diseño y Programación de Software Multiplataforma · Ciclo 01 – 2026

---

## 📋 Tabla de contenidos

- [Descripción](#descripción)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación y configuración](#instalación-y-configuración)
- [Funcionalidades](#funcionalidades)
- [Puntos extra implementados](#puntos-extra-implementados)
- [Integrantes](#integrantes)

---

## 📱 Descripción

Finanzas Personales es una aplicación móvil multiplataforma que permite a los usuarios:

- Registrar ingresos y gastos categorizados
- Administrar múltiples cuentas con saldo dinámico
- Definir presupuestos mensuales por categoría con alertas visuales
- Visualizar un dashboard con estadísticas y gráficas del mes actual
- Exportar reportes mensuales en formato CSV
- Adjuntar fotos de recibos a las transacciones

---

## 🛠️ Tecnologías utilizadas

### Frontend (Mobile)
| Tecnología | Uso |
|---|---|
| React Native + Expo | Framework principal |
| React Navigation | Navegación Stack y Tab |
| AsyncStorage | Persistencia de sesión |
| react-native-chart-kit | Gráfica de torta en el dashboard |


### Backend
| Tecnología | Uso |
|---|---|
| Node.js + Express | Servidor REST API |
| JSON Web Token (JWT) | Autenticación |
| bcryptjs | Encriptación de contraseñas |
| uuid | Generación de IDs únicos |

---

## 📁 Estructura del proyecto

```
Desafio03-DPS/
├── backend/
│   ├── index.js                  # Servidor principal Express
│   ├── .env                      # Variables de entorno
│   ├── db/
│   │   └── store.js              # Almacén de datos en memoria
│   ├── middleware/
│   │   └── auth.js               # Middleware de autenticación JWT
│   └── routes/
│       ├── auth.js               # Registro e inicio de sesión
│       ├── accounts.js           # CRUD de cuentas
│       ├── transactions.js       # CRUD de transacciones
│       └── budgets.js            # CRUD de presupuestos
└── mobile/
    ├── index.js                  # Punto de entrada Expo
    ├── App.js                    # Componente raíz
    └── src/
        ├── api/
        │   └── client.js         # Cliente Axios configurado
        ├── context/
        │   ├── AuthContext.js    # Estado global de autenticación
        │   └── ThemeContext.js   # Estado global de tema oscuro/claro
        ├── navigation/
        │   └── AppNavigator.js   # Navegación principal
        └── screens/
            ├── auth/
            │   ├── LoginScreen.js
            │   └── RegisterScreen.js
            ├── dashboard/
            │   └── DashboardScreen.js
            ├── transactions/
            │   ├── TransactionListScreen.js
            │   └── TransactionFormScreen.js
            ├── accounts/
            │   └── AccountsScreen.js
            ├── budgets/
            │   └── BudgetsScreen.js
            └── reports/
                └── ReportScreen.js
```

---

## ✅ Requisitos previos

- Node.js v22 o superior
- npm
- Expo Go instalado en el dispositivo móvil (o emulador Android)
- Git

---

## ⚙️ Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/Jorge-Luis-Lugo-Gonzalez/Desafio03-DPS.git
cd Desafio03-DPS
```

### 2. Configurar el backend

```bash
cd backend
npm install
```

Crear el archivo `.env` en la carpeta `backend/`:

```env
PORT=3000
JWT_SECRET=desafio3_dps_2026_secret
```

Iniciar el servidor:

```bash
node index.js
# Salida esperada: Backend corriendo en puerto 3000
```

### 3. Configurar el mobile

```bash
cd ../mobile
npm install
```

Editar `src/api/client.js` y ajustar la URL según el entorno de prueba:

```js
// Emulador Android
const API_URL = 'http://10.0.2.2:3000';

// Dispositivo físico (reemplazar con tu IP local)
const API_URL = 'http://192.168.X.X:3000';
```

> Para conocer tu IP local en Windows ejecuta `ipconfig` y busca "Dirección IPv4".

Iniciar la app:

```bash
npx expo start
```

Escanea el código QR con **Expo Go** o presiona `a` para abrir en emulador Android.

> ⚠️ El celular y la PC deben estar conectados a la **misma red WiFi**.

---

## 🚀 Funcionalidades

### 🔐 Autenticación
- Registro de nuevo usuario con validación de email y contraseña
- Inicio de sesión con mensajes de error específicos
- Cierre de sesión con redirección al Login
- Persistencia de sesión al cerrar y reabrir la app

### 💸 Gestión de transacciones
- Lista de todas las transacciones del usuario autenticado
- Formulario para agregar y editar: monto, tipo, categoría, cuenta, fecha y descripción
- Eliminación con diálogo de confirmación
- Filtro por categoría

### 🏦 Cuentas múltiples
- Crear y nombrar cuentas propias (Efectivo, Tarjeta, Banco, etc.)
- Saldo calculado dinámicamente (ingresos menos gastos)
- Editar y eliminar cuentas

### 🎯 Presupuestos por categoría
- Definir límite de gasto mensual por categoría
- Barra de progreso visual con porcentaje consumido
- Alerta naranja al superar el **80%** del presupuesto
- Alerta roja al superar el **100%** del presupuesto

### 📊 Dashboard
- Balance general del mes: ingresos, gastos y saldo neto
- Saldo actual de cada cuenta
- Gráfica de torta con desglose de gastos por categoría y porcentaje

---

## ⭐ Puntos extra implementados

### E3 — Modo oscuro / claro
- Cambio de tema desde la pantalla de Login
- Todas las pantallas respetan el tema activo
- El tema se aplica a fondos, tarjetas, textos y componentes de la UI

---

## 👥 Integrantes

| Nombre | Carné |
|---|---|
| Jorge Luis Lugo González | LG242867 |
| Hugo Alberto López Rivera | LR252072 |
| Gabriel Mario Hernández Rosales | HR242882 |

> Diseño y Programación de Software Multiplataforma — Universidad Don Bosco — Ciclo 01, 2026
