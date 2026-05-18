# Spec: Peta GeoJSON Spotlight (Surabaya & Madura)

**Date:** 2026-05-18  
**Feature:** Mengubah peta menjadi model polygon *masking* dengan GeoJSON akurat, memblokir area luar dengan warna hitam pekat.

## 1. Tujuan
Memberikan tampilan peta yang jauh lebih modern dan profesional dengan menyorot (*spotlight*) hanya daratan Surabaya dan Madura. Daratan lainnya (dan lautan) akan ditutupi oleh warna hitam pekat, namun tetap mempertahankan fungsionalitas peta OSM di dalam area yang disorot.

## 2. Arsitektur & Pendekatan
Kita akan menggunakan teknik **Inverted Polygon Masking** di Leaflet.js.
- **Outer Ring (Mask):** Sebuah polygon persegi raksasa yang menutupi seluruh dunia.
- **Inner Ring (Hole):** Batas wilayah administratif (garis pantai dan perbatasan) Surabaya, Bangkalan, Sampang, Pamekasan, dan Sumenep.
- **Hasil:** Layar akan berwarna hitam pekat, namun bagian dalam batas Surabaya & Madura akan berlubang sehingga base map OSM terlihat jelas dengan resolusi tinggi.

## 3. Komponen Utama

### A. GeoJSON Boundary Data
- Kita akan membuat sebuah file lokal statis (misal `surabaya_madura_boundary.json`) yang berisi koordinat presisi.
- File ini diambil dari data *Administrative Boundaries* OpenStreetMap (Relasi OSM).
- Untuk performa, koordinat akan sedikit disederhanakan (*simplified*) agar browser tidak *lag* saat merender, namun tetap mengikuti kontur garis pantai asli.

### B. Map Masking (Leaflet)
- `L.polygon([worldBounds, geojsonCoordinates])` akan merender masking.
- `fillColor: '#000000'`, `fillOpacity: 1.0` (Hitam pekat solid sesuai permintaan).
- Tidak ada garis batas (stroke) kasar, membiarkan garis batas dibentuk secara natural oleh kontur pulau yang berlubang.

### C. Pembatasan Interaksi
- Fungsi `L.latLngBounds` akan diperluas agar *user* bisa melakukan *zoom out* jauh, namun seluruh dunia yang terlihat akan berwarna hitam.
- **Tap Guard:** Jika user mengklik area hitam (luar GeoJSON), klik akan diabaikan (`isPointInPolygon` check). Modal "Tambah Mesin" hanya muncul jika diklik di area daratan Surabaya/Madura.

## 4. Error Handling & Fallback
- Jika file GeoJSON lokal gagal dimuat, map akan melakukan *fallback* menggunakan batas kotak kasar, lalu memunculkan notifikasi "Gagal memuat batas wilayah presisi".

## 5. Implementasi
1. Buat skrip untuk *fetch* dan kompilasi batas OSM Surabaya + Madura menjadi 1 file JSON lokal.
2. Edit `machine_location.html` untuk memuat JSON tersebut secara asinkron (`fetch()`) sebelum `initMap()` selesai.
3. Buat dan aplikasikan `L.polygon` dengan koordinat dari JSON.
4. Perbarui Service Worker cache version.
