# Handover File: Perbaikan Terjemahan Error Codes ATM

## Status Saat Ini
- **Total Record**: 17.401 baris (file `data/error_codes.jsonl`).
- **Tahap**: Analisis selesai. Pola kesalahan terjemahan sudah dipetakan.
- **Strategi Perbaikan**: Menggunakan Script Python (Regex & String Replace) secara batch, BUKAN menerjemahkan ulang satu per satu dengan LLM (karena memakan biaya token sangat besar dan rentan terpotong di tengah jalan).

## Pola Kesalahan Utama yang Ditemukan (Target Perbaikan)
1. **Kata sambung bahasa Inggris yang tersisa**:
   - ` by ` (misal: "terdeteksi by", "kontrol by") -> diganti menjadi ` oleh `
   - `another ` (misal: "ganti dengan another Cassette") -> diganti menjadi `[objek] yang lain`
   - `only ` (misal: "Dispense only") -> diganti menjadi `hanya`
   - ` waiting ` -> diganti menjadi ` menunggu `
   - ` not ` -> diganti menjadi ` tidak `
   - ` different dari` -> diganti menjadi ` berbeda dari `

2. **Susunan Kata Terbalik (Hukum DM / Diterangkan-Menerangkan)**:
   - `[X] kesalahan` (misal: "Data kesalahan", "CAM kesalahan") -> `Kesalahan [X]`
   - `[X] motor penggerak` -> `motor penggerak [X]`
   - `[X] sensor fault` -> `gangguan sensor [X]`

3. **Salah Terjemahan Konteks Tepat**:
   - Sensor `detects light` diterjemahkan menjadi `mendeteksi lampu`. Seharusnya `mendeteksi cahaya` atau `kondisi terang`.
   - `di front pada` (terjemahan kaku dari "in front of") -> `di depan`.
   - `'s` (kepemilikan Inggris) yang tertinggal, seperti `rol's`.

4. **Istilah Teknis yang Belum Konsisten**:
   - `pressure plate` -> `pelat penekan`
   - `Transportation path` -> `jalur pemindahan`
   - `fault` -> `gangguan`

## Tindakan Selanjutnya untuk Agent (atau Sesi Berikutnya)
1. Buat script Python (`fix_translation.py`).
2. Baca `data/error_codes.jsonl` baris demi baris (parse JSON).
3. Terapkan serangkaian fungsi `re.sub()` dan `.replace()` pada field `text` berdasarkan glosarium di atas.
4. Tulis hasilnya ke `data/error_codes_fixed.jsonl`.
5. Verifikasi hasilnya dan timpa file asli jika sudah bagus.
