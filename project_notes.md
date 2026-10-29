# MuseDeck — Project Progress & Architecture Notes
> **Tarih:** 29 Ekim 2026  
> **Durum:** Sayfa 1 (Page 1) Onay Akışı, Oturumlar ve Snippet Altyapısı Tamamlandı  
> **Sıradaki Aşama:** Yarın Sayfa 1'deki `SPARK`, `RUN` ve alt satır tuşlarının (`PROMPT`, `TESTS`, `FIX BUG`, `COMMIT`) tamamlanması.

---

## 1. Proje Genel Mimarisi

MuseDeck; Meta'nın **Muse Code CLI** aracı ile **Elgato Stream Deck** fiziksel donanımı arasında çift yönlü, düşük gecikmeli köprü oluşturan bir operasyon konsoludur.

```
┌──────────────────────────────────────┐       WebSocket (3457)       ┌─────────────────────────────────────┐
│      Elgato Stream Deck (Donanım)    │ <──────────────────────────> │           MuseDeck Bridge           │
│   (NodeJS Plugin - Rollup Bundle)    │       HTTP REST (3456)       │    (Express + WS Server + State)    │
└──────────────────────────────────────┘                              └──────────────────┬──────────────────┘
                                                                                         │
                                                                       fs watcher / tail │ AppleScript / Keystroke
                                                                                         ▼
                                                                      ┌─────────────────────────────────────┐
                                                                      │         Meta Muse Code CLI          │
                                                                      │      (~/.local/share/muse/...)      │
                                                                      │     Terminal.app Canlı Oturumu      │
                                                                      └─────────────────────────────────────┘
```

- **HTTP Köprüsü:** `http://localhost:3456` (Telemetri, tetikleme ve REST API)
- **WebSocket Yayını:** `ws://localhost:3457` (Canlı durum makineleri ve tuş çizim senkronizasyonu)
- **Oturum Takipçisi:** `~/.local/share/muse/sessions/` altında aktif çalışan `session.jsonl` dosyasını 150ms periyotla gerçek zamanlı okur.

---

## 2. Bugüne Kadar Tamamlanan Özellikler

### A. Canlı HITL (Human-in-the-Loop) Onay Akışı (Approval Gate)
- **Otomatik Algılama:** Muse Code bir komut (örn: `bash: lsof -i :3456`) için geliştiriciden onay istediğinde (`approval_wait.effect.started`), köprü bunu anında yakalar.
- **Otomatik Çekmece (Auto-Open Drawer):** Stream Deck başka hiçbir tuşa basmaya gerek kalmadan otomatik olarak 4 seçenekli onay alt menüsünü açar:
  - `(1, 0) [#1 YES]` (Zümrüt Yeşil): Tek seferlik onay verir (`1` + Enter).
  - `(2, 0) [#2 ALWAYS]` (Cyan): Bu oturum boyunca onaylar (`2` + Enter).
  - `(3, 0) [#3 NO]` (Kırmızı): İşlemi reddeder (`3` + Enter).
  - `(4, 0) [#4 TELL WHY]` (Amber): Geri bildirim moduna geçer (`4` + Enter).
  - `(0, 0) [↑ BACK]`: Karar vermeden Page 1'e döner.
- **Fiziksel Donanım Flash Uyarısı:** Durum tuşu, SVG animasyonuna bağımlı kalmadan 400ms aralıklarla donanım düzeyinde **Kırmızı (ACTION REQUIRED)** ve **Amber (REVIEW APPROVAL)** arasında yanıp söner.
- **Otomatik Temizleme (Self-Healing Lifecycle):** Onay verilip bash komutu terminalde tamamlandığında (`run.terminal: completed`), 5x3 kuantum dalgası durur ve konsol anında yeşil **`READY`** durumuna geri döner.

### B. Prompt Snippets Alt Menüsü (Sayfa 1 - Tuş 2)
- Önceden tanımlı, yüksek verimli Muse Code prompt parçacıkları:
  - `BE HONEST / CRITICAL`
  - `DON'T CODE / DISCUSS`
  - `SHOW OPTS / ALTERNATIVES`
  - `EXPLAIN WHY / REASONING`
  - `KEEP SHORT / CONCISE`
  - `NO TESTS / SKIP TESTS`
  - `GO! / PROCEED` (Otomatik Enter)
- **Tasarım:** Köşe reticle braketleri kaldırıldı, tam kenar modern cyber çerçeve uygulandı. `SKIP TESTS` ve diğer tüm alt yazılar 16-18px ultra-bold yapılarak uzaktan yüksek okunabilirlik sağlandı.

### C. Multi-Session Manager (Sayfa 1 - Tuş 4)
- Terminalde açılan tüm bağımsız Muse Code oturumlarını tarihe (`TODAY` / `YESTERDAY`), saate (örn: `17:07`) ve çalışma dizini/branch adına göre listeleyen interaktif oturum paneli.
- Tuşa basıldığında ilgili terminal penceresini anında öne getirme (`bringTerminalToFront`).
- `SESSIONS` ve `13 OPEN` tipografileri büyütüldü, köşe parantezleri temizlendi.

### D. AI Credits & Telemetry HUD (Sayfa 1 - Tuş 9, Eski RESET Yeri)
- Eski `RESET` tuşu yerine Page 1'e taşındı.
- Büyük neon yeşil fontla canlı bakiye (`$149.97`), `CREDITS` etiketi ve `LIVE STATS ↗` çağrısı.
- Tıklandığında Token, Maliyet, Cache Hit Rate ve İstek telemetrisi alt menüsünü açar.

### E. Struct Prompt & Voice Input
- `STRUCT PROMPT`: Karmaşık kullanıcı talimatlarını Muse Code için optimize edilmiş spec formatına dönüştürür; parantezsiz ve büyük fontlu hale getirildi.
- `VOICE INPUT`: `⌥ + V` kısayoluyla Muse Code sesli dikte modunu Stream Deck üzerinden tetikler.

---

## 3. Sayfa 1 (Page 1) Mevcut Tuş Durumu

| Sütun / Satır | Col 0 | Col 1 | Col 2 | Col 3 | Col 4 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Row 0** | **`READY / APPROVAL`** *(Tamamlandı)* | **`VOICE`** *(Tamamlandı)* | **`SNIPPETS`** *(Tamamlandı)* | **`STRUCT PROMPT`** *(Tamamlandı)* | **`SESSIONS`** *(Tamamlandı)* |
| **Row 1** | **`SCREENSHOT`** *(Tamamlandı)* | ⏳ **`SPARK`** *(Yarın)* | ⏳ **`RUN`** *(Yarın)* | **`HALT`** *(Tamamlandı)* | **`AI CREDITS HUD`** *(Tamamlandı)* |
| **Row 2** | ⏳ **`PROMPT`** *(Yarın)* | ⏳ **`TESTS`** *(Yarın)* | ⏳ **`FIX BUG`** *(Yarın)* | ⏳ **`COMMIT`** *(Yarın)* | **`PAGE NAV (1 ➔ 2)`** *(Tamamlandı)* |

---

## 4. Yarın Yapılacaklar (Page 1'i Tamamlama Planı)

1. **`SPARK` Tuşu:**
   - Çok modlu kod üretimi (Image/Screenshot to Code veya seçili alandan kod türetme).
   - SAM 3.1 / Ekran kesiti entegrasyonu ile terminale doğrudan enjekte etme akışı.
2. **`RUN` Tuşu:**
   - Terminalde bekleyen görevi/talimatı anında başlatma ve çalışma dalgası animasyonunu senkronize etme.
3. **Alt Satır İş Akış Tuşları:**
   - **`PROMPT`:** Hızlı görev giriş şablonu.
   - **`TESTS`:** Aktif projedeki test süitlerini Muse Code'a koşturan tek tuş makrosu.
   - **`FIX BUG`:** Hata analizi ve otomatik düzeltme promptu.
   - **`COMMIT`:** Git diff özetini alıp konvansiyonel commit mesajı üreten ve commitleyen akış.
4. **README Güncellemesi:**
   - `project_notes.md` dosyasındaki güncel mimari, ekran görüntüleri ve tuş haritası repo `README.md` dosyasına işlenecek.
