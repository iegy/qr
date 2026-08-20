# qrmo 2.0

مولّد وقارئ أكواد QR احترافي، مجاني، ويعمل داخل المتصفح بدون حساب أو Backend.

**النسخة المباشرة:** `https://iegy.net/qr/`

## أهم المميزات

- **12 نوع QR:** رابط، نص، Wi‑Fi، vCard، إيميل، تليفون، SMS، موقع جغرافي، WhatsApp، حدث تقويم، سوشيال، وتقييمات.
- **Design Studio:** ألوان، تدرّجات، أشكال النقاط والزوايا، لوجو، Frames، و6 قوالب جاهزة منها قالب iegy.
- **QR Health Score:** فحص التباين وكثافة البيانات وإعدادات اللوجو وتصحيح الخطأ، بالإضافة إلى محاولة قراءة الكود المولّد فعليًا قبل التنزيل.
- **Print Studio:** PNG عالي الدقة حسب DPI، PDF A4، وشيت ملصقات للطباعة.
- **مكتبة محلية احترافية:** IndexedDB لحفظ البيانات والتصميم واللوجو والمجلدات والمفضلة، مع بحث ونسخ احتياطي/استعادة JSON.
- **Bulk Generator:** CSV حقيقي مع اكتشاف Header وربط الأعمدة Label / Value / Type / Color، ثم ZIP أو Print Sheet.
- **Scanner محسّن:** كاميرا أو صورة، مع تقليل حجم الإطار قبل التحليل، throttling، ودعم QR المعكوس.
- **عربي وإنجليزي قابلان للفهرسة:** العربية تحت `/qr/` والإنجليزية تحت `/qr/en/` مع canonical + hreflang + sitemap.
- **PWA + Offline:** يتم precache لملفات الموقع ومكتبات QR/ZIP/Scanner/PDF الأساسية.
- **خصوصية:** التوليد والقراءة والحفظ تتم محليًا في المتصفح. لا يتم إرسال محتوى الأكواد إلى أي خادم خاص بـ qrmo.

## البنية

```text
qrmo/
├── index.html
├── generator.html
├── batch.html
├── scanner.html
├── about.html
├── en/
│   ├── index.html
│   ├── generator.html
│   ├── batch.html
│   ├── scanner.html
│   └── about.html
├── style.css
├── qr-core.js
├── storage.js
├── main.js
├── i18n.js
├── home.js
├── generator.js
├── batch.js
├── scanner.js
├── sw.js
├── manifest.json
├── sitemap.xml
├── robots.txt
├── VERSION
└── CHANGELOG.md
```

## مكتبات الطرف الثالث

- `qr-code-styling` — إنشاء وتخصيص QR.
- `jsQR` — القراءة وفحص قابلية المسح.
- `JSZip` — تصدير Bulk ZIP.
- `jsPDF` — إنشاء PDF للطباعة.

كل الإصدارات مثبتة في روابط CDN ومضافة إلى Service Worker cache.

## النشر
المشروع Static بالكامل ولا يحتاج build step. 

> Dynamic QR والـDashboard غير موجودين في 2.0 عمدًا؛ سيتم إضافتهما في مرحلة لاحقة بدون التأثير على وضع Static/Private الحالي.
