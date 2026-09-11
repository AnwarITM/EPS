import json
import re
import os

input_file = r"f:\EPS\data\error_codes.jsonl"
output_file = r"f:\EPS\data\error_codes_fixed.jsonl"

def fix_text(text):
    # 1. Kata sambung / preposisi Inggris
    text = re.sub(r'\bby\b', 'oleh', text)
    text = re.sub(r'\banother\s+([A-Za-z0-9_]+)', r'\1 yang lain', text)
    text = re.sub(r'\bwaiting\b', 'menunggu', text)
    text = re.sub(r'\bnot\b', 'tidak', text)
    text = text.replace('different dari', 'berbeda dari')
    text = text.replace('Dispense only', 'Hanya Dispense')
    text = text.replace('Deposit only', 'Hanya Deposit')
    
    # 2. Susunan kata terbalik (Hukum DM)
    # [Kata] kesalahan -> Kesalahan [Kata] (misal: Data kesalahan, CAM kesalahan, Image kesalahan)
    text = re.sub(r'\b([A-Za-z0-9]+)\s+kesalahan\b', r'Kesalahan \1', text)
    # Khusus untuk multiple words: Pulse motor kesalahan -> Kesalahan Pulse motor
    text = text.replace('Pulse motor Kesalahan', 'Kesalahan Pulse motor')
    text = text.replace('halt Kesalahan', 'Kesalahan halt')
    text = text.replace('tahap Kesalahan', 'Kesalahan tahap')
    
    # [Kata] motor penggerak -> motor penggerak [Kata]
    text = re.sub(r'\b([A-Za-z0-9_-]+)\s+motor penggerak\b', r'motor penggerak \1', text)
    
    # [Kata] sensor fault -> gangguan sensor [Kata]
    text = re.sub(r'\b([A-Za-z0-9_-]+)\s+sensor fault\b', r'gangguan sensor \1', text)
    text = re.sub(r'\b([A-Za-z0-9_-]+)\s+sensor\s+fault\b', r'gangguan sensor \1', text)
    
    # 3. Konteks Medis/Teknis yang salah
    text = text.replace('mendeteksi lampu', 'mendeteksi cahaya')
    text = text.replace('di front pada', 'di depan')
    text = text.replace('waktu-out', 'waktu habis')
    text = text.replace('waktu- out', 'waktu habis')
    
    # Menghapus 's (kepemilikan) yang terbalik, misal: rol's tahap -> tahap rol
    text = re.sub(r"\b([A-Za-z0-9_]+)'s\s+([A-Za-z0-9_]+)\b", r"\2 \1", text)
    
    # 4. Istilah Teknis yang belum konsisten
    text = text.replace('pressure plate', 'pelat penekan')
    text = text.replace('pelat pendorong', 'pelat penekan')
    text = text.replace('Transportation path', 'jalur pemindahan')
    text = re.sub(r'\bfault\b', 'gangguan', text)
    
    # Perbaikan posisi
    text = text.replace('Dispensing posisi', 'posisi Dispensing')
    text = text.replace('Deposit posisi', 'posisi Deposit')
    
    # Perbaikan rol
    text = text.replace('pengumpan rol', 'rol pengumpan')
    text = text.replace('pengumpanan rol', 'rol pengumpan')
    text = text.replace('Pick up rol', 'rol penarik')
    
    return text

print("Memulai proses perbaikan terjemahan...")
processed = 0

with open(input_file, 'r', encoding='utf-8') as fin, \
     open(output_file, 'w', encoding='utf-8') as fout:
    
    for line in fin:
        if not line.strip():
            continue
        data = json.loads(line)
        if 'text' in data:
            data['text'] = fix_text(data['text'])
        fout.write(json.dumps(data, ensure_ascii=False) + '\n')
        processed += 1

print(f"Selesai! {processed} baris telah diperbaiki dan disimpan ke {output_file}")
