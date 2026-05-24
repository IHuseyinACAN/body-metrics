# BodyMetrics

BodyMetrics, akıllı tartınızdan elde ettiğiniz vücut bileşimi verilerini (ağırlık, yağ, kas, su vb.) telefonunuzdan manuel olarak kaydedip takip edebileceğiniz modern, şık ve mobil öncelikli bir web uygulamasıdır.

Ek bir uygulama mağazası kurulumu gerektirmeden, **Progressive Web App (PWA)** desteği sayesinde tarayıcınızdan telefonunuza kolayca "Uygulama olarak ekle" seçeneğiyle yükleyebilirsiniz.

## Özellikler

- 🌟 **Aydınlık / Karanlık Tema Desteği:** Sağ üstteki buton yardımıyla göz yormayan, yumuşak geçiş efektli karanlık mod ile aydınlık mod arasında geçiş yapın.
- 📊 **Detaylı Takip Paneli:** Son girdiğiniz ağırlık, yağ oranı, kas kütlesi, su yüzdesi, kemik kütlesi, BMR, metabolik yaş ve iç organ yağlanması verilerini bir önceki kayıtla kıyaslayarak (kazanç/kayıp farklarıyla) görün.
- 📈 **Grafiksel Analiz:** Değerlerinizin zaman içindeki değişimini Chart.js ile dinamik ve renkli grafikler üzerinden analiz edin.
- ✏️ **Geçmişi Düzenleme & Silme:** Yanlış girdiğiniz geçmiş kayıtlarınızı geçmiş sekmesinden seçerek düzenleyebilir veya silebilirsiniz.
- 📱 **PWA ve Çevrimdışı Çalışma Desteği:** Service Worker entegrasyonu sayesinde uygulamayı telefonunuza indirin ve internet bağlantısı olmadan da verilerinizi kaydedin.
- 💾 **Yerel Veri Saklama (Offline-First):** Verileriniz tamamen tarayıcınızın `localStorage` alanında güvenle saklanır, harici bir sunucuya yüklenmez.

## Teknolojiler

- **Arayüz:** HTML5 (Outfit Google Fontu & Lucide İkon Kütüphanesi)
- **Stil:** Vanilla CSS3 (Cam morfizm / Glassmorphism tasarımı, özel renk paleti)
- **Mantık:** Vanilla JavaScript (ES6+)
- **Grafikler:** Chart.js
- **Çevrimdışı/Yükleme:** Service Worker & manifest.json (PWA)

## Kurulum ve Çalıştırma

Uygulama tamamen statik dosyalardan oluşmaktadır. Çalıştırmak için:

1. Bu depoyu klonlayın:
   ```bash
   git clone https://github.com/IHuseyinACAN/body-metrics.git
   ```
2. Proje dizinine gidin ve `index.html` dosyasını tarayıcınızda çift tıklayarak açın.

### Telefonunuza Yükleme (PWA)
1. Telefonunuzun tarayıcısından (örn: Safari veya Chrome) uygulamanın yüklü olduğu adrese gidin.
2. Tarayıcı menüsünden **"Ana Ekrana Ekle"** (Add to Home Screen) seçeneğine tıklayın.
3. Uygulama artık telefonunuzda bağımsız bir uygulama gibi açılacaktır.

---
*Bu proje, akıllı tartı kullanan ve verilerini basit, reklamsız ve şık bir arayüzle yerel olarak takip etmek isteyenler için geliştirilmiştir.*
