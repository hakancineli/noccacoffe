# Starbucks Turkey Clone - Veritabanı Kurulum Rehberi

## 📋 Durum
Proje şu anda frontend tarafında tamamlanmış durumda ve REWARDS sistemi çalışıyor. Canlı ortamda kullanıcı üyeliği oluşturabilmek için bir veritabanı entegrasyonu gerekiyor.

## 🗄️ Veritabanı Seçenekleri

### 1. Vercel Postgres (Önerilen)
- **Avantajları**: Vercel ile tam entegrasyon, kolay kurulum, otomatik scaling
- **Maliyet**: Free tier başlangıç, sonra kullanım bazlı
- **Kurulum**: Vercel dashboard üzerinden tek tıkla oluşturulur
- **Uygunluk**: Next.js ile mükemmel uyum

### 2. Supabase (Alternatif)
- **Avantajları**: Open source, gerçek zamanlı veritabanı, auth sistemi dahil
- **Maliyet**: Cömert free tier
- **Özellikler**: Built-in auth, storage, edge functions

### 3. PlanetScale (Alternatif)
- **Avantajları**: MySQL tabanlı, branching özelliği
- **Maliyet**: Free tier mevcut
- **Uygunluk**: Serverless uygulamalar için optimize

### 4. MongoDB Atlas (NoSQL)
- **Avantajları**: Esnek şema, good for loyalty programs
- **Maliyet**: Free tier mevcut
- **Uygunluk**: Karmaşık veri yapıları için ideal

## 🎯 Önerilen Veritabanı: Vercel Postgres

### Neden Vercel Postgres?
- ✅ Vercel ile tam entegrasyon
- ✅ Otomatik environment variables
- ✅ Serverless optimized
- ✅ Connection pooling
- ✅ Edge locations
- ✅ Next.js ile mükemmel uyum

## 📝 Kurulum Adımları

### 1. Vercel Postgres Oluşturma
```bash
# Vercel CLI ile
vercel postgres create
```

### 2. Environment Variables
```bash
# .env.local dosyasına eklenecek
POSTGRES_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
```

### 3. Prisma Kurulumu
```bash
npm install prisma @prisma/client
npx prisma init
```

## 🗂️ Veritabanı Şeması

### Users Tablosu
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  birth_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User_Points Tablosu
```sql
CREATE TABLE user_points (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  points INTEGER DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'BRONZE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Point_Transactions Tablosu
```sql
CREATE TABLE point_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  points INTEGER NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- EARNED, REDEEMED, BONUS
  description TEXT,
  reference_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Rewards Tablosu
```sql
CREATE TABLE rewards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- PRODUCT, DISCOUNT, COUPON, EXPERIENCE
  points_cost INTEGER NOT NULL,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User_Rewards Tablosu
```sql
CREATE TABLE user_rewards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  reward_id INTEGER REFERENCES rewards(id),
  status VARCHAR(20) DEFAULT 'AVAILABLE', -- AVAILABLE, REDEEMED, EXPIRED
  redeemed_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Campaigns Tablosu
```sql
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- POINT_MULTIPLIER, BONUS_POINTS, FREE_PRODUCT, DISCOUNT
  target_audience VARCHAR(50), -- ALL, TIER_BASED, NEW_CUSTOMERS
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 API Endpoint'leri

### Authentication
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/logout` - Kullanıcı çıkışı
- `GET /api/auth/me` - Mevcut kullanıcı bilgileri

### Points
- `GET /api/points/:userId` - Kullanıcı puanları
- `POST /api/points/earn` - Puan kazanma
- `POST /api/points/redeem` - Puan harcama
- `GET /api/points/transactions/:userId` - Puan hareketleri

### Rewards
- `GET /api/rewards` - Tüm ödüller
- `GET /api/rewards/user/:userId` - Kullanıcının ödülleri
- `POST /api/rewards/redeem` - Ödül kullanma
- `GET /api/rewards/available/:userId` - Kullanılabilir ödüller

### Campaigns
- `GET /api/campaigns` - Aktif kampanyalar
- `POST /api/campaigns` - Yeni kampanya (admin)
- `PUT /api/campaigns/:id` - Kampanya güncelleme (admin)
- `DELETE /api/campaigns/:id` - Kampanya silme (admin)

## 🚀 Implementasyon Planı

### 1. Veritabanı Kurulumu
- [ ] Vercel Postgres oluşturma
- [ ] Environment variables ekleme
- [ ] Prisma kurulumu
- [ ] Veritabanı şeması oluşturma

### 2. Backend API Geliştirme
- [ ] Next.js API Routes oluşturma
- [ ] Authentication middleware
- [ ] Database connection pooling
- [ ] Error handling

### 3. Frontend Entegrasyonu
- [ ] AuthModal'ı gerçek API'ye bağlama
- [ ] Dashboard'u veritabanından veri çekme
- [ ] State management güncelleme
- [ ] Loading states ve error handling

### 4. Testing ve Deployment
- [ ] Local testing
- [ ] Vercel deployment
- [ ] Production testing
- [ ] Monitoring

## 📱 Mobil Entegrasyon

### QR Kod Sistemi
- QR kod oluşturma API'si
- Mobil uygulama entegrasyonu
- Store location tracking

### Push Notifications
- Vercel Cron Jobs
- Notification templates
- User preferences

## 🔒 Güvenlik

### Authentication
- JWT token yönetimi
- Password hashing (bcrypt)
- Rate limiting
- Session management

### Data Protection
- GDPR compliance
- Data encryption
- Backup strategies
- Access control

## 📊 Monitoring

### Analytics
- User engagement metrics
- Reward redemption rates
- Campaign performance
- Revenue impact

### Performance
- Database query optimization
- Caching strategies
- CDN integration
- Error tracking

---

## Sonraki Adımlar

1. **Veritabanı Seçimi**: Hangi veritabanını tercih ediyorsunuz?
2. **Kurulum**: Vercel dashboard üzerinden veritabanı oluşturma
3. **API Geliştirme**: Backend endpoint'leri oluşturma
4. **Frontend Entegrasyonu**: Mevcut component'leri veritabanına bağlama

Bu rehber, Starbucks Turkey clone projesi için tam teşebbüslü bir veritabanı çözümü sağlayacaktır.