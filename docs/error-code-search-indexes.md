# Indeks pencarian error code

Halaman `error_codes.html` mencari berdasarkan `error_code_pattern` dan
`pattern_static_prefix` sebelum memuat cache lengkap di latar belakang.
Kedua field perlu diindeks agar Firebase tidak mengirim seluruh data untuk
menjalankan filter di browser.

Di Firebase Console proyek `catatan-troubleshoot-atm-2b5a4`, buka Realtime
Database → Rules. Tambahkan `.indexOn` pada `rules.error_codes`:

```json
{
  "rules": {
    "error_codes": {
      ".indexOn": ["error_code_pattern", "pattern_static_prefix"]
    }
  }
}
```

Ini hanya contoh posisi indeks, bukan pengganti seluruh rules. Pertahankan
semua aturan akses, validasi, dan indeks lain yang sudah ada. Jika `.indexOn`
sudah ada di `error_codes`, tambahkan kedua field ke daftar tersebut, lalu
Publish perubahan rules.

Verifikasi di browser baru: cari `11FC167`. Hasil langsung berasal dari query
kode dan pola induknya. Pengunduhan cache lengkap baru dijadwalkan setelah
hasil tampil. Pencarian berikutnya menggunakan cache jika sudah tersedia.

Pengujian lokal: `node scripts/test-error-code-search.js`.
