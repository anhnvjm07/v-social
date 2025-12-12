# Hướng dẫn Deploy

## 1. Railway (Khuyến nghị - Free tier tốt)

### Cách deploy:

1. Vào https://railway.app, đăng nhập bằng GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Chọn repo của bạn
4. Railway tự động detect Node.js và build
5. Vào tab "Variables" và thêm các biến môi trường:

   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `PORT` (Railway tự set, nhưng có thể override)
   - `NODE_ENV=production`

6. Railway tự động deploy khi push code lên GitHub

### Pricing:

- Free: $5 credit/tháng (đủ cho dev/test)
- Hobby: $20/tháng
- Pro: $100/tháng

---

## 2. Render (Free tier)

### Cách deploy:

1. Vào https://render.com, đăng nhập bằng GitHub
2. Click "New" → "Web Service"
3. Connect GitHub repo
4. Settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Node Version**: 20
   - **Branch**: `main` (hoặc branch bạn muốn auto-deploy)
5. Thêm Environment Variables (giống Railway)
6. Click "Create Web Service"

### Auto Deploy:

✅ **Render tự động deploy khi push code lên GitHub** (mặc định bật)

- Auto-deploy từ branch đã chọn (thường là `main`)
- Mỗi lần push → Render tự động build và deploy
- Có thể xem logs trong dashboard
- Có thể manual deploy: vào service → "Manual Deploy" → chọn commit

**Tắt auto-deploy** (nếu cần):

- Vào service settings → "Auto-Deploy" → tắt

### Pricing:

- Free: Sleep sau 15 phút không dùng (wake up ~30s)
- Starter: $7/tháng (không sleep)
- Standard: $25/tháng

---

## 3. DigitalOcean App Platform

### Cách deploy:

1. Vào https://cloud.digitalocean.com/apps
2. Click "Create App" → "GitHub"
3. Chọn repo
4. Auto-detect settings:
   - Build Command: `npm run build`
   - Run Command: `npm start`
5. Thêm Environment Variables
6. Deploy

### Pricing:

- Basic: $5/tháng (512MB RAM)
- Professional: $12/tháng (1GB RAM)

---

## 4. Heroku

### Cách deploy:

1. Cài Heroku CLI: `brew install heroku/brew/heroku`
2. Login: `heroku login`
3. Tạo app: `heroku create api-social`
4. Set env vars:

```bash
heroku config:set MONGODB_URI=...
heroku config:set JWT_SECRET=...
# ... các biến khác
```

5. Deploy: `git push heroku main`

### Pricing:

- Eco: $5/tháng (sleep sau 30 phút)
- Basic: $7/tháng
- Standard: $25/tháng

---

## 5. Docker + VPS (Linh hoạt nhất)

### Deploy lên VPS (DigitalOcean, Linode, AWS EC2):

```bash
# Trên VPS
git clone <your-repo>
cd api-social
docker build -t api-social .
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name api-social \
  api-social
```

### Hoặc dùng Docker Compose:

Tạo `docker-compose.yml`:

```yaml
version: "3.8"
services:
  api:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
```

Chạy: `docker-compose up -d`

---

## 6. AWS/GCP/Azure (Enterprise)

### AWS:

- **Elastic Beanstalk**: Dễ nhất, tự động scale
- **ECS/Fargate**: Container-based
- **EC2**: Full control

### GCP:

- **Cloud Run**: Serverless containers
- **App Engine**: Managed platform
- **GKE**: Kubernetes

### Azure:

- **App Service**: Managed platform
- **Container Instances**: Serverless containers

---

## MongoDB Atlas (Database)

Dù deploy ở đâu, nên dùng MongoDB Atlas (free tier 512MB):

1. Vào https://www.mongodb.com/cloud/atlas
2. Tạo cluster free
3. **Whitelist IP Addresses**:
   - Vào "Network Access" → "Add IP Address"
   - **Cho Render**: Thêm `0.0.0.0/0` (allow all IPs) - OK cho production
   - **Hoặc an toàn hơn**: Render không có static IP, nên phải dùng `0.0.0.0/0`
   - **Cho Railway**: Cũng dùng `0.0.0.0/0`
   - **Cho VPS**: Thêm IP cụ thể của VPS
4. **Database User**:
   - Vào "Database Access" → "Add New Database User"
   - Tạo user với password mạnh
   - Role: "Atlas admin" hoặc "Read and write to any database"
5. **Connection String**:
   - Vào "Database" → "Connect" → "Connect your application"
   - Copy connection string
   - Thay `<password>` bằng password của user
   - Thay `<dbname>` bằng tên database (ví dụ: `social`)
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/social?retryWrites=true&w=majority`
6. Set vào `MONGODB_URI` trong environment variables

**Lưu ý**: Nếu vẫn lỗi connection sau khi whitelist:

- Kiểm tra password có ký tự đặc biệt → URL encode
- Kiểm tra connection string có đúng format
- Thử thêm `&ssl=true` vào connection string

---

## Checklist trước khi deploy:

- [ ] Build thành công: `npm run build`
- [ ] Test local: `npm start`
- [ ] Set tất cả env variables
- [ ] MongoDB Atlas đã setup
- [ ] Cloudinary đã có credentials
- [ ] CORS đã config đúng domain frontend
- [ ] Health check endpoint hoạt động

---

## Monitoring (Tùy chọn):

- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **New Relic**: APM
- **Datadog**: Full observability
