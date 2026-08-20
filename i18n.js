// qrmo — lightweight client-side i18n with indexable /en/ pages.
// No build step, no network calls: everything ships as one dictionary and
// swaps text in place. Search engines still see the Arabic source (the
// default `lang="ar" dir="rtl"` markup), this only affects what a visitor's
// browser shows after they pick a language — a true indexable English
// version would need separate /en/ URLs, which is a bigger project.
const QRMO_I18N = (() => {

  const DICT = {
    ar: {
      'nav.tag': 'QR TOOLKIT',
      'nav.generator': 'المولّد',
      'nav.batch': 'توليد بالجملة',
      'nav.scanner': 'القارئ',
      'nav.about': 'عن qrmo',
      'nav.cta.start': 'ابدأ الآن',
      'nav.cta.generatorSingle': 'المولّد الفردي',
      'nav.cta.batch': 'توليد بالجملة',
      'nav.cta.generator': 'المولّد',
      'nav.toggle.aria': 'فتح القائمة',
      'nav.lang.toggle': 'English',
      'nav.theme.toggle': 'تبديل الوضع الليلي/النهاري',

      'home.eyebrow': 'كل المعالجة تتم داخل متصفحك — بدون سيرفر',
      'home.h1a': 'حوّل أي لينك أو نص',
      'home.h1b': 'لكود QR',
      'home.h1c': 'جاهز للطباعة',
      'home.sub': 'qrmo أداة مجانية بالكامل لعمل أكواد QR احترافية: واي فاي، جهات اتصال، مواقع، وحتى توليد بالجملة لمئات الأكواد دفعة واحدة.',
      'home.cta.full': 'افتح المولّد الكامل',
      'home.cta.batch': 'توليد بالجملة',
      'home.note': 'بدون تسجيل · بدون حدود استخدام · بياناتك متسيبش متصفحك',
      'home.demo.label': 'جرّب دلوقتي',
      'home.demo.placeholder': 'اكتب لينك أو أي نص...',
      'home.demo.hint': 'الكود بيتحدّث تلقائي وانت بتكتب',
      'home.demo.dlpng': 'تحميل PNG',
      'home.demo.full': 'الأداة الكاملة ←',

      'home.why.h2': 'ليه qrmo؟',
      'home.why.p': 'مش مجرد مولّد أكواد — دي مجموعة أدوات مبنية عشان تشتغل بشكل احترافي من أول استخدام.',
      'home.feat.privacy.h3': 'خصوصية كاملة',
      'home.feat.privacy.p': 'كل الأكواد بتتولّد ببرمجة تعمل جوه المتصفح، مفيش أي بيانات بتتبعت لسيرفر ولا بتتخزّن.',
      'home.feat.customize.h3': 'تخصيص كامل',
      'home.feat.customize.p': 'غيّر الألوان، شكل النقط والحواف، وضيف لوجوك جوه الكود من غير ما يأثر على قراءته.',
      'home.feat.types.h3': '12 نوع محتوى',
      'home.feat.types.p': 'لينك، نص، واي فاي، جهة اتصال، إيميل، تليفون، SMS، موقع، واتساب، حدث، سوشيال وتقييمات — بصيغ سليمة وجاهزة.',
      'home.feat.batch.h3': 'توليد بالجملة',
      'home.feat.batch.p': 'ارفع ملف فيه قايمة لينكات أو بيانات، واحصل على مئات الأكواد دفعة واحدة كملف ZIP أو شيت جاهز للطباعة.',
      'home.feat.formats.h3': 'PNG و SVG',
      'home.feat.formats.p': 'نزّل الكود بجودة عالية للاستخدام الرقمي، أو بصيغة SVG تتكبّر لأي حجم من غير ما تفقد وضوحها في الطباعة.',
      'home.feat.free.h3': 'مجاني بالكامل',
      'home.feat.free.p': 'من غير حساب، من غير اشتراك، من غير حد أقصى لعدد الأكواد اللي تعملها.',
      'home.feat.scanner.h3': 'قارئ من الكاميرا',
      'home.feat.scanner.p1': 'امسح أي كود QR بكاميرا جهازك أو ارفع صورة، ويظهرلك المحتوى فورًا — ',
      'home.feat.scanner.link': 'جرّب القارئ',

      'home.steps.h2': 'يشتغل في 4 خطوات',
      'home.steps.p': 'من الفكرة للكود الجاهز للطباعة في أقل من دقيقة.',
      'home.step1.h4': 'اختار نوع المحتوى', 'home.step1.p': 'لينك، نص، واي فاي، جهة اتصال، وأنواع تانية.',
      'home.step2.h4': 'اكتب بياناتك', 'home.step2.p': 'املا الحقول المناسبة للنوع اللي اخترته.',
      'home.step3.h4': 'خصّص الشكل', 'home.step3.p': 'الألوان، شكل النقط، وضيف لوجو لو حابب.',
      'home.step4.h4': 'نزّل الكود', 'home.step4.p': 'PNG أو SVG، جاهز للاستخدام أو الطباعة فورًا.',

      'home.cta2.h2': 'جاهز تعمل أول كود؟',
      'home.cta2.p': 'مفيش تسجيل، مفيش خطوات زيادة — افتح المولّد وابدأ فورًا.',
      'home.cta2.btn': 'افتح المولّد',

      'footer.tagline': 'مولّد أكواد QR احترافي، مجاني، ويشتغل بالكامل من متصفحك.',
      'footer.github': 'GitHub',
      'footer.made': 'صُنع بواسطة',

      'gen.h1': 'مولّد أكواد QR',
      'gen.p': 'اختار نوع المحتوى، املا البيانات، وخصّص الشكل — الكود بيتحدّث لحظيًا على اليمين.',
      'gen.tab.link': 'لينك', 'gen.tab.text': 'نص', 'gen.tab.wifi': 'واي فاي', 'gen.tab.vcard': 'جهة اتصال',
      'gen.tab.email': 'إيميل', 'gen.tab.phone': 'تليفون', 'gen.tab.sms': 'رسالة SMS', 'gen.tab.location': 'موقع جغرافي',
      'gen.tab.whatsapp': 'واتساب', 'gen.tab.event': 'حدث', 'gen.tab.social': 'سوشيال', 'gen.tab.review': 'تقييمات',
      'gen.wa.phone': 'رقم واتساب بكود الدولة', 'gen.wa.message': 'رسالة جاهزة (اختياري)', 'gen.wa.hint': 'هيتولّد رابط wa.me مباشر يفتح المحادثة بدون تخزين أي بيانات.',
      'gen.event.title': 'اسم الحدث', 'gen.event.start': 'البداية', 'gen.event.end': 'النهاية (اختياري)', 'gen.event.location': 'المكان', 'gen.event.description': 'وصف مختصر',
      'gen.social.url': 'رابط الحساب أو الصفحة', 'gen.social.hint': 'يعمل مع Instagram وFacebook وTikTok وYouTube وLinkedIn وأي رابط اجتماعي.',
      'gen.review.url': 'رابط صفحة التقييم', 'gen.review.hint': 'مناسب لكروت “قيّمنا” في Google Maps أو أي منصة تقييمات.',

      'gen.panel.data': 'البيانات',
      'gen.link.label': 'اللينك',
      'gen.text.label': 'النص', 'gen.text.placeholder': 'اكتب أي نص هنا...',
      'gen.wifi.ssid': 'اسم الشبكة (SSID)', 'gen.wifi.ssidPh': 'اسم الواي فاي',
      'gen.wifi.pass': 'كلمة السر', 'gen.wifi.passPh': 'كلمة السر',
      'gen.wifi.enc': 'نوع التشفير', 'gen.wifi.encWpa': 'WPA / WPA2', 'gen.wifi.encWep': 'WEP', 'gen.wifi.encNone': 'بدون كلمة سر',
      'gen.wifi.hidden': 'الشبكة مخفية',
      'gen.vc.first': 'الاسم الأول', 'gen.vc.last': 'اسم العائلة', 'gen.vc.org': 'الشركة', 'gen.vc.title': 'المسمى الوظيفي',
      'gen.vc.phone': 'التليفون', 'gen.vc.email': 'الإيميل', 'gen.vc.website': 'الموقع الإلكتروني', 'gen.vc.address': 'العنوان',
      'gen.email.to': 'الإيميل', 'gen.email.toPh': 'name@example.com',
      'gen.email.subject': 'الموضوع (اختياري)', 'gen.email.body': 'نص الرسالة (اختياري)',
      'gen.phone.label': 'رقم التليفون', 'gen.phone.ph': '+20 100 000 0000',
      'gen.sms.phone': 'رقم التليفون', 'gen.sms.phonePh': '+20 100 000 0000', 'gen.sms.msg': 'نص الرسالة (اختياري)',
      'gen.loc.lat': 'خط العرض (Latitude)', 'gen.loc.latPh': '30.0444',
      'gen.loc.lng': 'خط الطول (Longitude)', 'gen.loc.lngPh': '31.2357',
      'gen.loc.hint': 'تقدر تجيب الإحداثيات من خرائط جوجل: دوس بزر الماوس الأيمن على المكان وانسخ الأرقام.',

      'gen.templates.h3': 'قوالب جاهزة', 'gen.templates.badge': 'جديد', 'gen.templates.p': 'ابدأ بتصميم جاهز ثم عدّل عليه بحرية.',
      'gen.templates.iegy': 'iegy', 'gen.templates.classic': 'كلاسيك', 'gen.templates.sage': 'Sage', 'gen.templates.orange': 'برتقالي', 'gen.templates.night': 'ليلي', 'gen.templates.rounded': 'مدوّر',
      'gen.panel.custom': 'التخصيص',
      'gen.fg': 'لون الكود', 'gen.bg': 'لون الخلفية',
      'gen.dotStyle': 'شكل النقط',
      'gen.dot.square': 'مربع', 'gen.dot.dots': 'دوائر', 'gen.dot.rounded': 'مدوّر',
      'gen.dot.classy': 'كلاسيك', 'gen.dot.classyRounded': 'كلاسيك مدوّر', 'gen.dot.extraRounded': 'مدوّر جدًا',
      'gen.cornerStyle': 'شكل حدود الزاوية', 'gen.corner.square': 'مربع', 'gen.corner.dot': 'دائري', 'gen.corner.extraRounded': 'مدوّر',
      'gen.cornerDotStyle': 'شكل مركز الزاوية',
      'gen.transparent': 'خلفية شفافة',
      'gen.invert': 'عكس الألوان',
      'gen.gradient': 'استخدام تدرّج لوني',
      'gen.gradient.color2': 'اللون الثاني',
      'gen.gradient.type': 'نوع التدرّج',
      'gen.gradient.linear': 'خطي',
      'gen.gradient.radial': 'دائري',
      'gen.frame': 'إطار حوالين الكود (اختياري)',
      'gen.frame.none': 'بدون إطار',
      'gen.frame.bottom': 'شريط سفلي',
      'gen.frame.top': 'شريط علوي',
      'gen.frame.label': 'نص الإطار',
      'gen.frame.defaultLabel': 'امسحني',
      'gen.frame.hint': 'الإطار بيتطبّق على تحميل PNG بس، مش على SVG.',
      'gen.ec': 'مستوى تصحيح الخطأ', 'gen.ec.l': 'منخفض', 'gen.ec.m': 'متوسط', 'gen.ec.q': 'عالي', 'gen.ec.h': 'أعلى',
      'gen.ec.hint': 'اختار "أعلى" لو هتضيف لوجو، عشان الكود يفضل قابل للقراءة.',
      'gen.ec.autoRaised': 'رفعنا مستوى تصحيح الخطأ لـ "أعلى" تلقائيًا عشان ضفت لوجو.',
      'gen.size': 'الحجم:',
      'gen.logo': 'لوجو في النص (اختياري)', 'gen.logo.choose': 'اختار صورة', 'gen.logo.clear': 'إزالة اللوجو',
      'gen.dl.png': 'تحميل PNG', 'gen.dl.svg': 'تحميل SVG',
      'gen.health.title': 'QR Health', 'gen.health.wait': 'جاري تقييم الكود…', 'gen.health.excellent': 'ممتاز — جاهز للطباعة والمسح', 'gen.health.good': 'جيد جدًا — قابل للقراءة بثبات', 'gen.health.fair': 'مقبول — يفضّل تحسين التباين أو تقليل البيانات', 'gen.health.poor': 'ضعيف — عدّل التصميم قبل الطباعة',
      'gen.warn.logoSize': 'حجم اللوجو كبير. استخدم صورة أقل من 3MB.',
      'gen.print.h4': 'استوديو الطباعة', 'gen.print.size': 'المقاس', 'gen.print.grid': 'الشيت', 'gen.print.png': 'PNG للطباعة', 'gen.print.pdf': 'PDF A4', 'gen.print.sheet': 'طباعة شيت', 'gen.print.error': 'تعذر إنشاء ملف الطباعة. جرّب مرة أخرى أو استخدم PNG.',

      'gen.warn.contrast': 'تحذير: الألوان دي متقاربة وممكن تصعّب قراءة الكود — جرّب كونتراست أعلى.',
      'gen.warn.unreadable': 'تحذير: الكود بالإعدادات دي طلع صعب القراءة (مثلاً لوجو كبير مع تصحيح خطأ منخفض) — جرّب تقلّل حجم اللوجو أو تزوّد مستوى تصحيح الخطأ.',
      'gen.ok.readable': 'اتأكّدنا إن الكود قابل للقراءة ✓',

      'gen.lib.h3': 'أكوادي المحفوظة',
      'gen.lib.save': 'احفظ الكود ده',
      'gen.lib.empty': 'لسه مفيش أكواد محفوظة على الجهاز ده.',
      'gen.lib.load': 'تحميل', 'gen.lib.delete': 'حذف',
      'gen.lib.folder': 'المجلد', 'gen.lib.search': 'بحث', 'gen.lib.export': 'نسخة احتياطية', 'gen.lib.import': 'استعادة', 'gen.lib.favorite': 'مفضلة', 'gen.lib.duplicate': 'نسخ', 'gen.lib.importError': 'ملف النسخة الاحتياطية غير صالح.',

      'batch.h1': 'توليد بالجملة',
      'batch.p1': 'ارفع ملف نصّي (.txt أو .csv) أو الصق قايمتك، سطر لكل كود. تقدر تكتب',
      'batch.p2': 'في نفس السطر عشان تسمّي كل كود.',
      'batch.source.h3': 'المصدر',
      'batch.dropzone.strong': 'اسحب ملف هنا',
      'batch.dropzone.text': ' أو دوس للاختيار (.txt / .csv)',
      'batch.paste.label': 'أو الصق القايمة هنا',
      'batch.type.label': 'نوع القيم',
      'batch.type.auto': 'تلقائي (روابط أو نص)', 'batch.type.tel': 'أرقام تليفونات', 'batch.type.mailto': 'إيميلات',
      'batch.type.url': 'روابط', 'batch.type.text': 'نصوص', 'batch.type.whatsapp': 'أرقام واتساب',
      'batch.color.label': 'لون الكود',
      'batch.previewBtn': 'معاينة القايمة',
      'batch.results.h3': 'المعاينة (',
      'batch.results.h3end': 'عنصر)',
      'batch.table.label': 'التسمية', 'batch.table.value': 'القيمة',
      'batch.table.type': 'النوع', 'batch.table.color': 'اللون',
      'batch.mapping.h3': 'ربط أعمدة CSV', 'batch.mapping.p': 'حدد العمود المستخدم للاسم والقيمة والنوع واللون. qrmo بيحاول يختارهم تلقائيًا.', 'batch.mapping.label': 'التسمية', 'batch.mapping.value': 'القيمة / الرابط', 'batch.mapping.type': 'النوع', 'batch.mapping.color': 'اللون', 'batch.mapping.none': '— بدون —',
      'batch.generateBtn': 'ولّد كل الأكواد', 'batch.generating': 'بيتولّد...',
      'batch.downloadZip': 'تحميل الكل (ZIP)', 'batch.printSheet': 'طباعة كشيت',

      'scan.h1': 'قارئ الأكواد',
      'scan.p': 'شغّل الكاميرا أو ارفع صورة فيها كود QR، وهيبان لك المحتوى فورًا — القراءة كلها بتتم جوه متصفحك.',
      'scan.placeholder': 'الكاميرا مقفولة دلوقتي',
      'scan.start': 'تشغيل الكاميرا', 'scan.stop': 'إيقاف الكاميرا',
      'scan.divider': 'أو',
      'scan.upload': 'ارفع صورة فيها كود QR',
      'scan.result.default': 'نتيجة المسح',
      'scan.copy': 'نسخ النص', 'scan.copied': 'اتنسخ ✓',
      'scan.history.h3': 'آخر الأكواد اللي اتقرت',
      'scan.history.export': 'تصدير السجل (CSV)', 'scan.history.clear': 'مسح السجل',
      'scan.err.camera': 'معرفناش نوصل للكاميرا. تأكد إنك سمحت بالإذن، أو جرّب رفع صورة بدل ذلك.',
      'scan.err.noCode': 'معرفناش نلاقي كود QR واضح في الصورة دي.',
      'scan.badge.link': 'رابط', 'scan.badge.wifi': 'شبكة واي فاي', 'scan.badge.vcard': 'جهة اتصال',
      'scan.badge.email': 'إيميل', 'scan.badge.tel': 'رقم تليفون', 'scan.badge.sms': 'رسالة SMS',
      'scan.badge.geo': 'موقع جغرافي', 'scan.badge.text': 'نص',
      'scan.badge.whatsapp': 'واتساب', 'scan.badge.event': 'حدث',
      'scan.action.openLink': 'افتح الرابط', 'scan.action.sendEmail': 'ابعت إيميل', 'scan.action.call': 'اتصل', 'scan.action.openMaps': 'افتح في خرائط جوجل',
      'scan.action.openWhatsapp': 'افتح واتساب',
      'scan.field.ssid': 'اسم الشبكة', 'scan.field.pass': 'كلمة السر', 'scan.field.enc': 'التشفير',
      'scan.field.name': 'الاسم', 'scan.field.tel': 'التليفون', 'scan.field.email': 'العنوان',
      'scan.field.org': 'الشركة', 'scan.field.smsNum': 'الرقم', 'scan.field.smsMsg': 'الرسالة', 'scan.field.coords': 'الإحداثيات',
      'scan.field.title': 'العنوان', 'scan.field.location': 'المكان',
      'scan.na': '—',

      'about.h1': 'عن qrmo',
      'about.lead': 'qrmo أداة مجانية بالكامل لعمل أكواد QR احترافية ومخصّصة، من غير ما تحتاج تسجّل حساب أو تدفع اشتراك.',
      'about.privacy.h2': 'خصوصية أولًا',
      'about.privacy.p': 'كل كود QR بيتولّد ببرمجة تعمل جوه متصفحك مباشرة — مفيش أي لينك أو نص أو بيانات بتتبعت لأي سيرفر ولا بتتخزّن في أي مكان. لما تقفل الصفحة، البيانات بتروح معاها.',
      'about.tech.h2': 'مبنية بتقنيات مفتوحة',
      'about.tech.p1': 'الموقع مبني بـ HTML وCSS وJavaScript عادي من غير أي إطار عمل تقيل، وبيستخدم مكتبة',
      'about.tech.p2': 'مفتوحة المصدر لتوليد الأكواد وتخصيصها.',
      'about.who.h2': 'مين اللي بناها',
      'about.who.p1': 'qrmo من تطوير',
      'about.who.p2': '، مطوّر ومصمم تجارب رقمية، وله أدوات وأنظمة تانية زي NewShop وEgyUp Cloud.',
      'about.contact.h2': 'تواصل',
      'about.contact.p': 'تقدر تتابع الشغل أو تتواصل من خلال:'
    },

    en: {
      'nav.tag': 'QR TOOLKIT',
      'nav.generator': 'Generator',
      'nav.batch': 'Bulk Generate',
      'nav.scanner': 'Scanner',
      'nav.about': 'About qrmo',
      'nav.cta.start': 'Get Started',
      'nav.cta.generatorSingle': 'Single Generator',
      'nav.cta.batch': 'Bulk Generate',
      'nav.cta.generator': 'Generator',
      'nav.toggle.aria': 'Open menu',
      'nav.lang.toggle': 'العربية',
      'nav.theme.toggle': 'Toggle light/dark mode',

      'home.eyebrow': 'Everything runs in your browser — no server involved',
      'home.h1a': 'Turn any link or text',
      'home.h1b': 'into a QR code',
      'home.h1c': 'that’s print-ready',
      'home.sub': 'qrmo is a completely free tool for making professional QR codes: Wi-Fi, contacts, locations, even bulk-generating hundreds of codes at once.',
      'home.cta.full': 'Open the full generator',
      'home.cta.batch': 'Bulk generate',
      'home.note': 'No sign-up · No usage limits · Your data never leaves your browser',
      'home.demo.label': 'Try it now',
      'home.demo.placeholder': 'Type a link or any text...',
      'home.demo.hint': 'The code updates automatically as you type',
      'home.demo.dlpng': 'Download PNG',
      'home.demo.full': 'Full tool ←',

      'home.why.h2': 'Why qrmo?',
      'home.why.p': 'Not just a code generator — a toolkit built to feel professional from the very first use.',
      'home.feat.privacy.h3': 'Complete privacy',
      'home.feat.privacy.p': 'Every code is generated by code running inside your browser — nothing is ever sent to or stored on a server.',
      'home.feat.customize.h3': 'Full customization',
      'home.feat.customize.p': 'Change colors, dot and corner shapes, and add your own logo in the middle without hurting scannability.',
      'home.feat.types.h3': '12 content types',
      'home.feat.types.p': 'Link, text, Wi-Fi, contact card, email, phone, SMS, location, WhatsApp, event, social and review QR codes.',
      'home.feat.batch.h3': 'Bulk generation',
      'home.feat.batch.p': 'Upload a file of links or data and get hundreds of codes at once, as a ZIP file or a print-ready sheet.',
      'home.feat.formats.h3': 'PNG & SVG',
      'home.feat.formats.p': 'Download high-quality PNG for digital use, or SVG that scales to any size without losing sharpness when printed.',
      'home.feat.free.h3': 'Completely free',
      'home.feat.free.p': 'No account, no subscription, no cap on how many codes you can make.',
      'home.feat.scanner.h3': 'Camera scanner',
      'home.feat.scanner.p1': 'Scan any QR code with your device’s camera or upload an image, and see the content instantly — ',
      'home.feat.scanner.link': 'try the scanner',

      'home.steps.h2': 'It works in 4 steps',
      'home.steps.p': 'From idea to a print-ready code in under a minute.',
      'home.step1.h4': 'Pick a content type', 'home.step1.p': 'Link, text, Wi-Fi, contact card, and more.',
      'home.step2.h4': 'Enter your data', 'home.step2.p': 'Fill in the fields that match the type you picked.',
      'home.step3.h4': 'Customize the look', 'home.step3.p': 'Colors, dot shape, and add a logo if you like.',
      'home.step4.h4': 'Download the code', 'home.step4.p': 'PNG or SVG, ready to use or print right away.',

      'home.cta2.h2': 'Ready to make your first code?',
      'home.cta2.p': 'No sign-up, no extra steps — open the generator and start right away.',
      'home.cta2.btn': 'Open the generator',

      'footer.tagline': 'A professional, free QR code generator that runs entirely in your browser.',
      'footer.github': 'GitHub',
      'footer.made': 'Made by',

      'gen.h1': 'QR code generator',
      'gen.p': 'Pick a content type, fill in the data, and customize the look — the code updates live on the side.',
      'gen.tab.link': 'Link', 'gen.tab.text': 'Text', 'gen.tab.wifi': 'Wi-Fi', 'gen.tab.vcard': 'Contact',
      'gen.tab.email': 'Email', 'gen.tab.phone': 'Phone', 'gen.tab.sms': 'SMS', 'gen.tab.location': 'Location',
      'gen.tab.whatsapp': 'WhatsApp', 'gen.tab.event': 'Event', 'gen.tab.social': 'Social', 'gen.tab.review': 'Reviews',
      'gen.wa.phone': 'WhatsApp number with country code', 'gen.wa.message': 'Prefilled message (optional)', 'gen.wa.hint': 'Creates a direct wa.me link without sending or storing your data.',
      'gen.event.title': 'Event title', 'gen.event.start': 'Starts', 'gen.event.end': 'Ends (optional)', 'gen.event.location': 'Location', 'gen.event.description': 'Short description',
      'gen.social.url': 'Profile or page URL', 'gen.social.hint': 'Works with Instagram, Facebook, TikTok, YouTube, LinkedIn and any social URL.',
      'gen.review.url': 'Review page URL', 'gen.review.hint': 'Great for Google Maps and other “Review us” cards.',

      'gen.panel.data': 'Data',
      'gen.link.label': 'Link',
      'gen.text.label': 'Text', 'gen.text.placeholder': 'Type any text here...',
      'gen.wifi.ssid': 'Network name (SSID)', 'gen.wifi.ssidPh': 'Wi-Fi name',
      'gen.wifi.pass': 'Password', 'gen.wifi.passPh': 'Password',
      'gen.wifi.enc': 'Encryption type', 'gen.wifi.encWpa': 'WPA / WPA2', 'gen.wifi.encWep': 'WEP', 'gen.wifi.encNone': 'No password',
      'gen.wifi.hidden': 'Hidden network',
      'gen.vc.first': 'First name', 'gen.vc.last': 'Last name', 'gen.vc.org': 'Company', 'gen.vc.title': 'Job title',
      'gen.vc.phone': 'Phone', 'gen.vc.email': 'Email', 'gen.vc.website': 'Website', 'gen.vc.address': 'Address',
      'gen.email.to': 'Email', 'gen.email.toPh': 'name@example.com',
      'gen.email.subject': 'Subject (optional)', 'gen.email.body': 'Message body (optional)',
      'gen.phone.label': 'Phone number', 'gen.phone.ph': '+1 555 000 0000',
      'gen.sms.phone': 'Phone number', 'gen.sms.phonePh': '+1 555 000 0000', 'gen.sms.msg': 'Message text (optional)',
      'gen.loc.lat': 'Latitude', 'gen.loc.latPh': '30.0444',
      'gen.loc.lng': 'Longitude', 'gen.loc.lngPh': '31.2357',
      'gen.loc.hint': 'You can get coordinates from Google Maps: right-click the location and copy the numbers.',

      'gen.templates.h3': 'Ready-made templates', 'gen.templates.badge': 'NEW', 'gen.templates.p': 'Start from a preset and customize freely.',
      'gen.templates.iegy': 'iegy', 'gen.templates.classic': 'Classic', 'gen.templates.sage': 'Sage', 'gen.templates.orange': 'Orange', 'gen.templates.night': 'Night', 'gen.templates.rounded': 'Rounded',
      'gen.panel.custom': 'Customization',
      'gen.fg': 'Code color', 'gen.bg': 'Background color',
      'gen.dotStyle': 'Dot shape',
      'gen.dot.square': 'Square', 'gen.dot.dots': 'Dots', 'gen.dot.rounded': 'Rounded',
      'gen.dot.classy': 'Classy', 'gen.dot.classyRounded': 'Classy rounded', 'gen.dot.extraRounded': 'Extra rounded',
      'gen.cornerStyle': 'Corner border shape', 'gen.corner.square': 'Square', 'gen.corner.dot': 'Dot', 'gen.corner.extraRounded': 'Rounded',
      'gen.cornerDotStyle': 'Corner center shape',
      'gen.transparent': 'Transparent background',
      'gen.invert': 'Invert colors',
      'gen.gradient': 'Use a gradient',
      'gen.gradient.color2': 'Second color',
      'gen.gradient.type': 'Gradient type',
      'gen.gradient.linear': 'Linear',
      'gen.gradient.radial': 'Radial',
      'gen.frame': 'Frame around the code (optional)',
      'gen.frame.none': 'No frame',
      'gen.frame.bottom': 'Bottom bar',
      'gen.frame.top': 'Top bar',
      'gen.frame.label': 'Frame text',
      'gen.frame.defaultLabel': 'Scan me',
      'gen.frame.hint': 'The frame only applies to the PNG download, not SVG.',
      'gen.ec': 'Error correction level', 'gen.ec.l': 'Low', 'gen.ec.m': 'Medium', 'gen.ec.q': 'High', 'gen.ec.h': 'Highest',
      'gen.ec.hint': 'Pick "Highest" if you’re adding a logo, so the code stays scannable.',
      'gen.ec.autoRaised': 'We automatically raised error correction to "Highest" since you added a logo.',
      'gen.size': 'Size:',
      'gen.logo': 'Logo in the center (optional)', 'gen.logo.choose': 'Choose image', 'gen.logo.clear': 'Remove logo',
      'gen.dl.png': 'Download PNG', 'gen.dl.svg': 'Download SVG',
      'gen.health.title': 'QR Health', 'gen.health.wait': 'Evaluating code…', 'gen.health.excellent': 'Excellent — print and scan ready', 'gen.health.good': 'Very good — reliably scannable', 'gen.health.fair': 'Fair — improve contrast or reduce data', 'gen.health.poor': 'Poor — adjust the design before printing',
      'gen.warn.logoSize': 'The logo is too large. Use an image under 3MB.',
      'gen.print.h4': 'Print Studio', 'gen.print.size': 'Size', 'gen.print.grid': 'Sheet', 'gen.print.png': 'Print PNG', 'gen.print.pdf': 'A4 PDF', 'gen.print.sheet': 'Print sheet', 'gen.print.error': 'Could not create the print file. Try again or use PNG.',

      'gen.warn.contrast': 'Warning: these colors are too close together and may make the code hard to scan — try more contrast.',
      'gen.warn.unreadable': 'Warning: this code came out hard to read with the current settings (e.g. a large logo with low error correction) — try shrinking the logo or raising the error correction level.',
      'gen.ok.readable': 'Verified this code scans correctly ✓',

      'gen.lib.h3': 'My saved codes',
      'gen.lib.save': 'Save this code',
      'gen.lib.empty': 'No codes saved on this device yet.',
      'gen.lib.load': 'Load', 'gen.lib.delete': 'Delete',
      'gen.lib.folder': 'Folder', 'gen.lib.search': 'Search', 'gen.lib.export': 'Backup', 'gen.lib.import': 'Restore', 'gen.lib.favorite': 'Favorite', 'gen.lib.duplicate': 'Duplicate', 'gen.lib.importError': 'Invalid backup file.',

      'batch.h1': 'Bulk generation',
      'batch.p1': 'Upload a text file (.txt or .csv) or paste your list, one line per code. You can write',
      'batch.p2': 'on the same line to label each code.',
      'batch.source.h3': 'Source',
      'batch.dropzone.strong': 'Drag a file here',
      'batch.dropzone.text': ' or click to choose (.txt / .csv)',
      'batch.paste.label': 'Or paste your list here',
      'batch.type.label': 'Value type',
      'batch.type.auto': 'Auto (links or text)', 'batch.type.tel': 'Phone numbers', 'batch.type.mailto': 'Emails',
      'batch.type.url': 'URLs', 'batch.type.text': 'Text', 'batch.type.whatsapp': 'WhatsApp numbers',
      'batch.color.label': 'Code color',
      'batch.previewBtn': 'Preview list',
      'batch.results.h3': 'Preview (',
      'batch.results.h3end': 'items)',
      'batch.table.label': 'Label', 'batch.table.value': 'Value',
      'batch.table.type': 'Type', 'batch.table.color': 'Color',
      'batch.mapping.h3': 'CSV column mapping', 'batch.mapping.p': 'Choose the columns used for label, value, type and color. qrmo tries to detect them automatically.', 'batch.mapping.label': 'Label', 'batch.mapping.value': 'Value / URL', 'batch.mapping.type': 'Type', 'batch.mapping.color': 'Color', 'batch.mapping.none': '— none —',
      'batch.generateBtn': 'Generate all codes', 'batch.generating': 'Generating...',
      'batch.downloadZip': 'Download all (ZIP)', 'batch.printSheet': 'Print sheet',

      'scan.h1': 'QR code scanner',
      'scan.p': 'Turn on the camera or upload an image with a QR code, and the content will show up instantly — all reading happens inside your browser.',
      'scan.placeholder': 'Camera is off right now',
      'scan.start': 'Turn on camera', 'scan.stop': 'Turn off camera',
      'scan.divider': 'or',
      'scan.upload': 'Upload an image with a QR code',
      'scan.result.default': 'Scan result',
      'scan.copy': 'Copy text', 'scan.copied': 'Copied ✓',
      'scan.history.h3': 'Recently scanned',
      'scan.history.export': 'Export history (CSV)', 'scan.history.clear': 'Clear history',
      'scan.err.camera': 'Couldn’t reach the camera. Make sure you allowed permission, or try uploading an image instead.',
      'scan.err.noCode': 'Couldn’t find a clear QR code in that image.',
      'scan.badge.link': 'Link', 'scan.badge.wifi': 'Wi-Fi network', 'scan.badge.vcard': 'Contact',
      'scan.badge.email': 'Email', 'scan.badge.tel': 'Phone number', 'scan.badge.sms': 'SMS',
      'scan.badge.geo': 'Location', 'scan.badge.text': 'Text',
      'scan.badge.whatsapp': 'WhatsApp', 'scan.badge.event': 'Event',
      'scan.action.openLink': 'Open link', 'scan.action.sendEmail': 'Send email', 'scan.action.call': 'Call', 'scan.action.openMaps': 'Open in Google Maps',
      'scan.action.openWhatsapp': 'Open WhatsApp',
      'scan.field.ssid': 'Network name', 'scan.field.pass': 'Password', 'scan.field.enc': 'Encryption',
      'scan.field.name': 'Name', 'scan.field.tel': 'Phone', 'scan.field.email': 'Address',
      'scan.field.org': 'Company', 'scan.field.smsNum': 'Number', 'scan.field.smsMsg': 'Message', 'scan.field.coords': 'Coordinates',
      'scan.field.title': 'Title', 'scan.field.location': 'Location',
      'scan.na': '—',

      'about.h1': 'About qrmo',
      'about.lead': 'qrmo is a completely free tool for making professional, customized QR codes, with no account and no subscription required.',
      'about.privacy.h2': 'Privacy first',
      'about.privacy.p': 'Every QR code is generated by code that runs directly inside your browser — no link, text, or data is ever sent to or stored on any server. When you close the page, the data goes with it.',
      'about.tech.h2': 'Built with open technology',
      'about.tech.p1': 'The site is built with plain HTML, CSS, and JavaScript, no heavy framework, and uses the',
      'about.tech.p2': 'open-source library to generate and customize the codes.',
      'about.who.h2': 'Who built it',
      'about.who.p1': 'qrmo is built by',
      'about.who.p2': ', a developer and digital product designer, who also built other tools like NewShop and EgyUp Cloud.',
      'about.contact.h2': 'Get in touch',
      'about.contact.p': 'You can follow the work or reach out through:'
    }
  };

  const STORAGE_KEY = 'qrmo-lang';

  function getLang(){
    return document.documentElement.dataset.defaultLang || (location.pathname.includes('/en/') ? 'en' : 'ar');
  }

  function t(key, lang){
    lang = lang || getLang();
    return (DICT[lang] && DICT[lang][key]) || DICT.ar[key] || key;
  }

  function apply(lang){
    lang = lang || getLang();
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key, lang);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'), lang);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label'), lang));
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.title = t(el.getAttribute('data-i18n-title'), lang);
    });

    const toggleBtn = document.getElementById('langToggle');
    if (toggleBtn) toggleBtn.textContent = t('nav.lang.toggle', lang);

    document.dispatchEvent(new CustomEvent('qrmo:langchange', { detail: { lang } }));
  }

  function setLang(lang){
    localStorage.setItem(STORAGE_KEY, lang);
    apply(lang);
  }

  function toggle(){
    const current = getLang();
    const path = location.pathname;
    if (current === 'ar'){
      const slash = path.endsWith('/');
      const target = slash ? path + 'en/' : path.replace(/\/([^\/]+)$/, '/en/$1');
      localStorage.setItem(STORAGE_KEY, 'en');
      location.href = target + location.search + location.hash;
    } else {
      const target = path.replace('/en/', '/');
      localStorage.setItem(STORAGE_KEY, 'ar');
      location.href = target + location.search + location.hash;
    }
  }

  function init(){
    apply(getLang());
    const btn = document.getElementById('langToggle');
    if (btn) btn.addEventListener('click', toggle);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { t, getLang, setLang, toggle, apply };
})();
