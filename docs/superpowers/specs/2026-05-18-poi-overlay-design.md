# Spec: POI Reference Layer (BCA & Minimarket)

**Date:** 2026-05-18  
**Feature:** Overlay lokasi BCA dan minimarket nyata dari OSM ke peta mesin

## Tujuan
Memudahkan teknisi memasang marker mesin tepat di atas lokasi gedung BCA / minimarket yang sesungguhnya, tanpa harus menebak koordinat.

## Pendekatan
Overpass API (OSM, gratis, tanpa API key).

## Query
Fetch satu kali saat peta load. Query mencakup:
- `amenity=bank` dengan nama mengandung "BCA"
- `shop=convenience|supermarket` dengan nama mengandung "Indomaret|Alfamart|Giant|Superindo"
- Bounding box: `-7.42,112.55,-6.82,113.95` (Surabaya–Madura)
- `out center` agar way/polygon juga punya titik koordinat tengah

## UI

### Marker POI (referensi)
- `L.circleMarker` kecil (radius 7), warna per kategori, opacity 0.7
- Berbeda visual dari pin mesin (agar tidak bingung)
- Klik → popup: nama tempat + badge kategori + tombol **"📍 Pasang Mesin di Sini"**
- Tombol tersebut membuka modal tambah mesin dengan koordinat & kategori sudah terisi otomatis

### Layer Control
- Tombol toggle **"🏪 POI"** di header — default ON
- Saat OFF semua circle POI disembunyikan (marker mesin tetap tampil)

### Loading State
- Teks "Memuat lokasi BCA & minimarket..." muncul di info-bar saat fetch
- Diganti dengan jumlah POI ditemukan setelah selesai

## Error Handling
- Jika Overpass timeout/gagal: tampilkan pesan kecil "Data POI tidak dapat dimuat" tanpa crash
- Tidak retry otomatis (cukup refresh manual)

## Batasan
- Data tergantung akurasi kontribusi OSM Surabaya-Madura
- Tidak bisa offline (Overpass butuh internet)

## File yang diubah
- `machine_location.html` — tambah fungsi `loadPOILayer()`, toggle button, CSS circle marker
