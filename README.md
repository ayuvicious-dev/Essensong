# Essensong

Music player pribadi (PWA): upload file mp3, putar di background, bisa offline, dan sinkron di beberapa device lewat login Firebase.

## Struktur file

```
icons/            ikon aplikasi
.nojekyll         agar GitHub Pages menyajikan file apa adanya
README.md
index.html        seluruh aplikasi (HTML + CSS + JS)
manifest.json
service-worker.js
```

## Setup Firebase (project `essensong`)

1. **Authentication** > Sign-in method: aktifkan **Email/Password** dan **Google**.
   Di tab Settings > Authorized domains, tambahkan `ayuvicious-dev.github.io`.
2. **Firestore Database**: buat database, lalu pasang rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

3. **Storage** (butuh paket Blaze, ada kuota gratis): buat bucket, lalu pasang rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{uid}/{allPaths=**} {
      allow read, delete: if request.auth != null && request.auth.uid == uid;
      allow create, update: if request.auth != null && request.auth.uid == uid
        && request.resource.size < 50 * 1024 * 1024
        && request.resource.contentType.matches('audio/.*');
    }
  }
}
```

4. **CORS Storage** (wajib agar tombol "Simpan offline" bisa mengunduh lagu). Buka Google Cloud Shell, buat file `cors.json`:

```
[{"origin": ["https://ayuvicious-dev.github.io"], "method": ["GET"], "maxAgeSeconds": 3600}]
```

lalu jalankan:

```
gsutil cors set cors.json gs://essensong.firebasestorage.app
```

## Deploy

Upload semua file ke repo GitHub, aktifkan Settings > Pages (branch `main`, folder `/root`).

## Cara pakai

- Login, tekan **Upload mp3**. Lagu tersimpan di akun dan muncul di semua device.
- Tekan ikon unduh di samping lagu untuk menyimpannya offline di device itu.
- Pasang ke layar utama (Add to Home Screen) agar terasa seperti aplikasi.
- Lagu tetap berbunyi saat pindah aplikasi, dan bisa dikontrol dari layar kunci / notifikasi.
