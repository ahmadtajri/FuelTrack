# Product Requirements Document (PRD)
## Website Prediksi Boros/Hemat Kendaraan berbasis XGBoost + SHAP

**Versi:** 1.0
**Tanggal:** 3 Agustus 2026

---

## 1. Ringkasan Produk

Website yang memungkinkan pengguna memasukkan spesifikasi kendaraan (mesin, transmisi, berat, jenis bahan bakar, dll) untuk mendapatkan prediksi apakah kendaraan tersebut tergolong **"Boros"** atau **"Hemat"** bahan bakar, lengkap dengan **penjelasan (explainability)** menggunakan SHAP (SHapley Additive exPlanations) sehingga pengguna paham *mengapa* model memberikan prediksi tersebut (misal: "kapasitas mesin besar" menyumbang ke arah boros, "transmisi CVT" menyumbang ke arah hemat).

## 2. Tujuan (Goals)

- Memberikan estimasi cepat & mudah dipahami tentang efisiensi bahan bakar kendaraan.
- Meningkatkan kepercayaan pengguna terhadap hasil prediksi lewat visualisasi SHAP (bukan black-box).
- Menyediakan arsitektur yang jelas terpisah antara **backend (model & API)** dan **frontend (UI)** agar mudah dikembangkan/dipelihara secara independen.

## 3. Target Pengguna

- Calon pembeli mobil/motor yang ingin membandingkan efisiensi BBM sebelum membeli.
- Dealer/showroom yang ingin menampilkan estimasi efisiensi ke pelanggan.
- Mahasiswa/peneliti yang ingin studi kasus ML explainability.

## 4. Lingkup (Scope)

### 4.1 Termasuk (In-Scope)
- Form input spesifikasi kendaraan.
- Model klasifikasi biner (boros/hemat) menggunakan XGBoost.
- Pipeline pembuatan dataset sintetis yang relevan dengan kendaraan masa kini (2015–2026).
- Endpoint API prediksi + SHAP value.
- Visualisasi SHAP (waterfall/force plot) di frontend.
- Riwayat prediksi (opsional, disimpan di local storage / DB ringan).

### 4.2 Tidak Termasuk (Out-of-Scope)
- Prediksi konsumsi BBM dalam angka pasti (liter/100km) — fokus ke klasifikasi kategori.
- Integrasi data real-time dari API pabrikan mobil.
- Login/autentikasi pengguna (versi awal — bisa jadi fase 2).

## 5. Dataset

Karena belum ada dataset, akan dibuat **dataset sintetis** yang relevan dengan kendaraan yang **umum dipakai sehari-hari di Indonesia**, dengan cakupan **minimal roda 2 (motor)** — motor menjadi kategori wajib/utama, dan kendaraan roda 4 harian (city car, hatchback, MPV, SUV kecil) disertakan sebagai pembanding.

### 5.1 Kategori Kendaraan yang Dicakup

| Kelompok | Jenis | Rentang CC |
|---|---|---|
| Roda 2 (wajib) | Motor Bebek/Cub | 100–150cc |
| Roda 2 (wajib) | Motor Matic | 110–160cc |
| Roda 2 (wajib) | Motor Sport/Naked | 150–250cc |
| Roda 2 (wajib) | Motor Sport Besar | 250–650cc |
| Roda 4 (tambahan) | City Car/Hatchback | 1000–1500cc |
| Roda 4 (tambahan) | MPV Keluarga | 1300–1800cc |
| Roda 4 (tambahan) | SUV Compact | 1500–2000cc |

### 5.2 Fitur (Kolom) Dataset

| Kolom | Tipe | Deskripsi | Contoh |
|---|---|---|---|
| vehicle_category | kategorikal | Roda2 atau Roda4 | Roda2 |
| vehicle_type | kategorikal | Bebek, Matic, Sport, Sport Besar, City Car, Hatchback, MPV, SUV | Matic |
| engine_cc | numerik | Kapasitas mesin (cc) | 100–2000 |
| cylinders | numerik | Jumlah silinder | 1 (motor), 3–4 (mobil) |
| horsepower | numerik | Tenaga (HP) | 7–150 |
| weight_kg | numerik | Berat kendaraan (kg) | 90–1400 |
| transmission | kategorikal | Manual, Automatic, CVT, DCT | CVT |
| fuel_type | kategorikal | Bensin, Diesel, Hybrid | Bensin |
| cooling_system | kategorikal (khusus motor) | Air-cooled, Liquid-cooled | Liquid-cooled |
| daily_usage_km | numerik | Estimasi jarak tempuh harian (km), memengaruhi pola konsumsi realistis | 10–80 |
| year | numerik | Tahun kendaraan | 2015–2026 |
| fuel_consumption_kmpl | numerik (target mentah) | Estimasi konsumsi km/liter, dihitung dari formula + noise | 15–60 (motor), 8–20 (mobil) |
| label | kategorikal (target) | "Boros" jika kmpl < threshold, "Hemat" jika ≥ threshold | Hemat |

### 5.3 Metode Generate Data
- Formula heuristik berbeda untuk motor vs mobil (motor jauh lebih irit secara alami), sehingga threshold boros/hemat dihitung **per kategori & jenis kendaraan**, bukan satu ambang global.
- Semakin besar cc, HP, berat → makin boros; motor matic/bebek terbaru dengan injeksi & liquid-cooled cenderung lebih hemat.
- Noise Gaussian ditambahkan agar distribusi realistis, dengan porsi data dibuat proporsional terhadap popularitas kendaraan harian di Indonesia (motor matic & bebek 110–160cc mendominasi).
- Target jumlah data: **6.000–10.000 baris**, proporsi disarankan 60% motor : 40% mobil.
- Disimpan sebagai `dataset/vehicle_fuel_dataset.csv`.

## 6. Arsitektur Sistem

> **Catatan teknis penting:** XGBoost & SHAP adalah library yang paling matang di ekosistem **Python**. Node.js belum punya library setara yang stabil untuk keduanya. Solusinya: backend utama tetap **Node.js + Express + Prisma** (sesuai kebutuhan), tapi bagian training & prediksi model dijalankan oleh **microservice Python kecil** yang dipanggil secara internal oleh backend Node. Frontend **tidak pernah bicara langsung ke Python** — semua lewat Node.js.

```
┌──────────────────┐   HTTP/JSON    ┌────────────────────────┐   HTTP/JSON    ┌──────────────────────┐
│   FRONTEND        │ ─────────────▶ │   BACKEND (Node.js)     │ ─────────────▶ │  ML SERVICE (Python)  │
│ React + Vite      │ ◀───────────── │  Express + Prisma ORM   │ ◀───────────── │  FastAPI + XGBoost    │
│                    │  hasil akhir   │  (auth, riwayat, DB)    │ prediksi+SHAP  │  + SHAP Explainer     │
└──────────────────┘                └────────────────────────┘                └──────────────────────┘
                                              │                                          │
                                              ▼                                          ▼
                                     PostgreSQL/MySQL/SQLite                     model.pkl (XGBoost)
                                     (riwayat prediksi, via Prisma)             dataset generator script
```

Tiga folder/repo terpisah:
- `ml-service/` — Python: generate dataset, training XGBoost, hitung SHAP, expose API internal.
- `backend/` — Node.js + Express + Prisma: API publik untuk frontend, validasi, simpan riwayat ke DB, teruskan request ke `ml-service`.
- `frontend/` — React + Vite: UI form input, visualisasi hasil & SHAP.

## 7. ML Service — Python (Detail)

Microservice internal, tidak diakses langsung oleh frontend. Hanya dipanggil oleh backend Node.js.

### 7.1 Tech Stack
- **Python 3.11**, **FastAPI** (REST API internal), **Uvicorn**.
- **XGBoost** (XGBClassifier) untuk model.
- **SHAP** (TreeExplainer) untuk explainability.
- **scikit-learn** untuk preprocessing (encoding, split, evaluasi).
- **Pandas/Numpy** untuk data generation & manipulasi.
- **Joblib** untuk simpan/load model.

### 7.2 Struktur Folder
```
ml-service/
├── app/
│   ├── main.py              # entry point FastAPI (internal-only, tidak publik)
│   ├── schemas.py           # Pydantic request/response models
│   ├── model_service.py     # load model, predict, hitung SHAP
│   ├── preprocessing.py     # encoding fitur kategorikal, scaling
├── data/
│   ├── generate_dataset.py  # script generate dataset sintetis (motor & mobil harian)
│   └── vehicle_fuel_dataset.csv
├── training/
│   └── train_model.py       # training XGBoost + evaluasi + simpan model
├── models/
│   ├── xgb_model.pkl
│   └── encoders.pkl
├── requirements.txt
└── README.md
```

### 7.3 Endpoint Internal ML Service

**POST `/internal/predict`** (dipanggil oleh backend Node.js, bukan frontend)

Request body:
```json
{
  "vehicle_category": "Roda2",
  "vehicle_type": "Matic",
  "engine_cc": 150,
  "cylinders": 1,
  "horsepower": 15,
  "weight_kg": 115,
  "transmission": "CVT",
  "fuel_type": "Bensin",
  "cooling_system": "Liquid-cooled",
  "daily_usage_km": 30,
  "year": 2024
}
```

Response body:
```json
{
  "prediction": "Hemat",
  "probability": { "Hemat": 0.87, "Boros": 0.13 },
  "shap_values": [
    {"feature": "engine_cc", "value": 150, "shap": -0.18, "effect": "mendukung Hemat"},
    {"feature": "cooling_system_Liquid-cooled", "value": 1, "shap": -0.10, "effect": "mendukung Hemat"},
    {"feature": "weight_kg", "value": 115, "shap": -0.05, "effect": "mendukung Hemat"}
  ],
  "base_value": 0.5
}
```

**GET `/internal/health`** — cek status model loaded.

### 7.4 Model Training Pipeline
1. Load dataset sintetis (motor & mobil harian).
2. Encoding fitur kategorikal (One-Hot/Ordinal, disimpan sebagai `encoders.pkl`).
3. Split train/test (80/20), stratifikasi berdasarkan label & vehicle_category (agar motor & mobil terwakili proporsional di train maupun test).
4. Training `XGBClassifier` dengan hyperparameter tuning ringan.
5. Evaluasi: akurasi, precision, recall, F1, confusion matrix — dicek terpisah untuk motor vs mobil.
6. Simpan model final + encoder ke `models/`.
7. Buat `shap.TreeExplainer(model)` sekali saat startup service, cache di memory.

### 7.5 Target Performa Model
- Akurasi ≥ 85% pada data uji.
- Waktu respon internal < 300ms per request (single prediction + SHAP).

---

## 8. Backend Utama — Node.js + Express + Prisma (Detail)

Backend inilah yang diakses oleh frontend. Bertugas: validasi input, teruskan ke ML service, simpan riwayat prediksi ke database via Prisma, dan kembalikan hasil gabungan ke frontend.

### 8.1 Tech Stack
- **Node.js (LTS) + Express** — REST API.
- **Prisma ORM** — akses database (rekomendasi: PostgreSQL, bisa juga MySQL/SQLite untuk dev).
- **Axios** — memanggil ML service Python secara internal.
- **Zod / express-validator** — validasi request body.
- **dotenv** — konfigurasi environment (URL ML service, DB connection string).

### 8.2 Struktur Folder
```
backend/
├── src/
│   ├── index.js                 # entry point Express
│   ├── routes/
│   │   ├── predict.route.js      # POST /api/predict
│   │   ├── history.route.js      # GET /api/history
│   │   └── options.route.js      # GET /api/feature-options
│   ├── controllers/
│   │   ├── predict.controller.js
│   │   └── history.controller.js
│   ├── services/
│   │   └── mlService.js          # axios call ke ml-service Python
│   ├── middlewares/
│   │   ├── validate.js
│   │   └── errorHandler.js
│   └── config/
│       └── env.js
├── prisma/
│   ├── schema.prisma             # model Prediction, dsb
│   └── migrations/
├── package.json
├── .env
└── README.md
```

### 8.3 Prisma Schema (contoh)
```prisma
model Prediction {
  id                Int      @id @default(autoincrement())
  vehicleCategory   String
  vehicleType       String
  engineCc          Int
  cylinders         Int
  horsepower        Int
  weightKg          Int
  transmission      String
  fuelType          String
  coolingSystem     String?
  dailyUsageKm      Int
  year              Int
  prediction        String   // "Hemat" | "Boros"
  probabilityHemat  Float
  probabilityBoros  Float
  shapValues        Json
  createdAt         DateTime @default(now())
}
```

### 8.4 API Endpoints (Publik — dipanggil Frontend)

**POST `/api/predict`**

Request body (dari frontend, mengikuti form input kendaraan):
```json
{
  "vehicleCategory": "Roda2",
  "vehicleType": "Matic",
  "engineCc": 150,
  "cylinders": 1,
  "horsepower": 15,
  "weightKg": 115,
  "transmission": "CVT",
  "fuelType": "Bensin",
  "coolingSystem": "Liquid-cooled",
  "dailyUsageKm": 30,
  "year": 2024
}
```

Alur internal:
1. Express memvalidasi payload.
2. Controller memanggil `mlService.predict()` → POST ke `ml-service` internal.
3. Hasil dari ML service disimpan ke DB via Prisma (`prisma.prediction.create(...)`).
4. Response dikembalikan ke frontend (format sama seperti respons ML service + `id` riwayat).

**GET `/api/history`** — daftar riwayat prediksi (paginated), untuk fitur riwayat di frontend.

**GET `/api/feature-options`** — daftar nilai valid dropdown (vehicleType, transmission, fuelType, dll), bisa hardcode di Node atau diteruskan dari ML service.

**GET `/api/health`** — cek status backend & konektivitas ke ML service + DB.

## 9. Frontend — React + Vite (Detail)

### 9.1 Tech Stack
- **React 18 + Vite**
- **TailwindCSS** untuk styling
- **Recharts** untuk visualisasi SHAP (bar chart horizontal / waterfall)
- **Axios** untuk komunikasi ke backend Node.js (bukan ke ML service)
- **React Router** jika ada halaman riwayat terpisah

### 9.2 Struktur Folder
```
frontend/
├── src/
│   ├── components/
│   │   ├── VehicleForm.jsx       # form input spesifikasi kendaraan
│   │   ├── PredictionResult.jsx  # tampilkan label + probabilitas
│   │   ├── ShapChart.jsx         # visualisasi kontribusi fitur (SHAP)
│   │   └── HistoryList.jsx       # riwayat prediksi (opsional)
│   ├── services/
│   │   └── api.js                # fungsi call ke backend
│   ├── pages/
│   │   └── Home.jsx
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── README.md
```

### 9.3 Halaman & Komponen Utama

1. **Halaman Utama**
   - Form input: kategori kendaraan (Roda2/Roda4 — toggle), jenis kendaraan (dropdown sesuai kategori: Bebek/Matic/Sport/Sport Besar untuk motor, City Car/Hatchback/MPV/SUV untuk mobil), engine cc, cylinders, horsepower, weight, transmission (dropdown), fuel type (dropdown), cooling system (khusus motor), jarak tempuh harian (km), tahun.
   - Tombol "Prediksi".
   - Validasi input (rentang nilai wajar sesuai kategori, misal motor cc 100–650, mobil cc 1000–2000).

2. **Hasil Prediksi**
   - Badge besar: "HEMAT" (hijau) atau "BOROS" (merah).
   - Progress bar probabilitas.

3. **Visualisasi SHAP**
   - Horizontal bar chart: fitur yang mendorong ke "Boros" (merah, kanan) vs "Hemat" (hijau, kiri) — mirip SHAP force plot.
   - Urut dari kontribusi terbesar ke terkecil.
   - Tooltip menjelaskan tiap fitur dalam bahasa awam (misal: "Kapasitas mesin 1500cc menurunkan risiko boros").

4. **Riwayat**
   - List prediksi sebelumnya, diambil dari `GET /api/history` (tersimpan permanen di database via Prisma, bukan hanya localStorage).

### 9.4 Alur Pengguna (User Flow)
1. Pengguna buka halaman → isi form spesifikasi kendaraan (motor atau mobil harian).
2. Klik "Prediksi" → frontend kirim POST ke backend Node.js `/api/predict`.
3. Backend Express memvalidasi → memanggil ML service Python (encoding → XGBoost → SHAP) → menyimpan hasil ke DB via Prisma → mengembalikan JSON ke frontend.
4. Frontend render badge hasil + chart SHAP.
5. Pengguna bisa ubah input & prediksi ulang, atau melihat riwayat prediksi sebelumnya.

## 10. Non-Functional Requirements

- **Performa:** respon end-to-end < 1 detik (termasuk hop Node.js → ML service Python).
- **Skalabilitas:** ketiga komponen (frontend, backend Node, ML service) stateless-friendly, mudah di-deploy sebagai container terpisah & scale horizontal.
- **Keamanan:** validasi input di Express (Zod), rate limiting dasar, ML service tidak diekspos ke publik (hanya bisa diakses dari backend Node dalam jaringan internal/private).
- **Portabilitas:** tiga komponen deploy terpisah (lihat rencana deployment).
- **Maintainability:** kode terstruktur modular, mudah retrain model saat ada dataset nyata di masa depan, migrasi DB dikelola rapi lewat Prisma Migrate.

## 11. Rencana Deployment

| Komponen | Opsi Deploy |
|---|---|
| ML Service (Python/FastAPI) | Render/Railway/Fly.io/Docker di VPS — akses dibatasi hanya dari backend (private network/internal URL) |
| Backend (Node.js/Express) | Render/Railway/Fly.io/Docker di VPS, terhubung ke ML service & database |
| Database | PostgreSQL terkelola (Supabase/Neon/Railway Postgres) diakses via Prisma |
| Frontend (React+Vite) | Vercel/Netlify |
| Model artifact | Disimpan dalam repo `ml-service` (`models/*.pkl`), atau object storage jika besar |

## 12. Milestone & Estimasi Waktu

| Tahap | Deliverable | Estimasi |
|---|---|---|
| 1 | Generate dataset sintetis (motor & mobil harian) + eksplorasi data | 1 hari |
| 2 | Training model XGBoost + evaluasi | 1 hari |
| 3 | Integrasi SHAP + uji explainability | 1 hari |
| 4 | ML Service Python (FastAPI) internal selesai & teruji | 1 hari |
| 5 | Backend Node.js + Express + Prisma (API, DB, integrasi ke ML service) | 1–2 hari |
| 6 | Frontend React+Vite: form input & hasil prediksi | 1–2 hari |
| 7 | Visualisasi SHAP di frontend | 1 hari |
| 8 | Testing end-to-end + deployment 3 komponen | 1 hari |

**Total estimasi:** ± 8–10 hari kerja untuk MVP.

## 13. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Dataset sintetis tidak merepresentasikan kendaraan nyata | Formula generate dirancang berdasarkan pola nyata (cc, HP, berat, jarak tempuh vs efisiensi); beri disclaimer di UI bahwa ini estimasi berbasis data simulasi |
| Model overfit ke pola sintetis | Gunakan cross-validation, regularisasi XGBoost (max_depth, subsample) |
| SHAP lambat untuk single prediction | Gunakan `TreeExplainer` (cepat untuk tree-based model), bukan `KernelExplainer` |
| Pengguna awam sulit paham SHAP | Sederhanakan bahasa di tooltip, gunakan warna & ikon intuitif |
| Latensi tambahan karena 2 hop (Node → Python) | Deploy ML service dan backend di region/network yang sama untuk minimalkan latency; gunakan connection pooling/keep-alive di axios |
| Kompleksitas operasional (3 komponen berjalan terpisah) | Gunakan Docker Compose untuk local dev agar mudah menjalankan ketiganya sekaligus |

## 14. Next Step Setelah PRD Disetujui

1. Saya buatkan script `generate_dataset.py` untuk membuat dataset sintetis (motor & mobil harian).
2. Saya buatkan `train_model.py` untuk training XGBoost + evaluasi.
3. Saya buatkan ML service FastAPI (`main.py`, `model_service.py`, dll).
4. Saya buatkan backend Node.js + Express + Prisma (routes, controllers, schema Prisma, integrasi ke ML service).
5. Saya buatkan frontend React + Vite (form + visualisasi SHAP).

---

*Dokumen ini adalah acuan awal (MVP). Setelah implementasi, PRD bisa direvisi berdasarkan hasil testing dan feedback pengguna.*
