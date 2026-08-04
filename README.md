# EcoDrive AI - Vehicle Fuel Efficiency Prediction Dashboard

EcoDrive AI adalah sebuah sistem dashboard cerdas yang memprediksi efisiensi bahan bakar (km/L) pada kendaraan sehari-hari di Indonesia menggunakan *Machine Learning*. Aplikasi ini juga memberikan analisis komprehensif mengenai estimasi biaya operasional, pendapatan, keuntungan, serta interpretasi faktor-faktor menggunakan algoritma SHAP.

Sistem ini diimplementasikan dengan arsitektur **3-Tier Microservices**:
1. **Frontend (React + Vite)**: Dashboard interaktif.
2. **Backend (Node.js + Express + Prisma)**: API publik dan kalkulasi bisnis.
3. **ML Service (Python + FastAPI)**: API internal khusus inferensi model ML.

---

## 🚀 Fitur Utama

1. **Prediksi Konsumsi Bahan Bakar:** Model AI (XGBoost) yang memprediksi `km/L` berdasarkan parameter kendaraan (CC, Silinder, Berat, dll).
2. **Visualisasi Tren Konsumsi:** Grafik historis dari histori prediksi kendaraan Anda.
3. **Analisis Biaya Operasional:** Perhitungan *Fuel Cost / km*, *Income / km*, dan rasio operasional harian.
4. **Pemantauan Efisiensi vs Rata-rata:** Grafik *Gauge (Doughnut)* yang membandingkan kendaraan Anda dengan rata-rata populasi sekelasnya.
5. **Analisis Keuntungan Harian:** *Bar Chart* estimasi profit bersih vs biaya bahan bakar.
6. **Interpretasi AI (SHAP):** Visualisasi seberapa besar tiap fitur berkontribusi pada hasil prediksi (boros/hemat) secara lokal dan global.

---

## 🛠 Teknologi yang Digunakan

*   **Frontend:** React (Vite), Tailwind CSS v4, Chart.js, React-ChartJS-2, React Router DOM, Axios, Lucide-React.
*   **Backend:** Node.js, Express 5, Prisma ORM, Zod, CORS.
*   **Database:** MySQL.
*   **Machine Learning:** Python 3.11+, FastAPI, XGBoost (`XGBRegressor`), SHAP, Scikit-learn, Pandas, Numpy.

---

## 💻 Prasyarat (Prerequisites)

Pastikan sistem Anda sudah terinstal tools berikut:
- **Node.js** (v18 atau lebih baru) & NPM
- **Python** (v3.10 atau lebih baru)
- **MySQL Server** (berjalan di `localhost:3306`, user `root`, tanpa password secara default)

---

## ⚙️ Cara Instalasi & Menjalankan Aplikasi

Aplikasi terdiri dari 3 servis yang harus dijalankan secara paralel (di terminal/CMD yang berbeda).

### 1. Menjalankan ML Service (Python)
Service ini berjalan di **Port 8000**.

```bash
# Pindah ke direktori ml-service
cd ml-service

# (Opsional) Buat virtual environment
# python -m venv venv
# venv\Scripts\activate

# Install dependensi
pip install -r requirements.txt

# Menjalankan FastAPI Server
python -m uvicorn app.main:app --port 8000 --reload
```

### 2. Menjalankan Backend API (Node.js)
Service ini berjalan di **Port 3001**.
Sebelum menjalankan, pastikan **MySQL Server** sudah aktif.

```bash
# Pindah ke direktori backend
cd backend

# Install dependensi
npm install

# Setup Database & Push Schema menggunakan Prisma (akan membuat DB "vehicle_prediction" secara otomatis)
npx prisma db push

# Menjalankan Backend Server
npm run dev
```

### 3. Menjalankan Frontend Dashboard (React + Vite)
Service ini berjalan di **Port 5173**.

```bash
# Pindah ke direktori frontend
cd frontend

# Install dependensi
npm install

# Menjalankan Frontend Development Server
npm run dev
```

---

## 📊 Cara Mengakses Aplikasi
Buka Web Browser Anda dan navigasikan ke:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 📁 Struktur Proyek

```text
📦 aww
 ┣ 📂 dataset/        # Script generator data sintetis & file CSV dataset (~8000 baris)
 ┣ 📂 backend/        # Node.js Express server, Prisma ORM, Routes & Controllers
 ┣ 📂 frontend/       # React SPA dashboard dengan Vite & TailwindCSS
 ┣ 📂 ml-service/     # FastAPI Python server (app/) & Model Training script (training/)
 ┗ 📜 README.md       # Dokumentasi proyek ini
```

---
*Dibuat untuk analisis efisiensi bahan bakar kendaraan secara cerdas.*
