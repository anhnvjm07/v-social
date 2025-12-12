# Social Media Backend API

Backend API cho mạng xã hội được xây dựng với Node.js, Express, TypeScript và MongoDB theo kiến trúc Modular Monolith.

## Công nghệ sử dụng

- **Node.js** + **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **Cloudinary** - Image/Video storage
- **Swagger** - API Documentation
- **Joi** - Validation

## Cấu trúc dự án

```
src/
├── modules/           # Các business modules
│   ├── auth/         # Authentication & Authorization
│   ├── posts/         # Posts management
│   ├── comments/      # Comments system
│   ├── reactions/     # Reactions (like, love, etc.)
│   ├── follows/       # Follow/Unfollow users
│   ├── messages/      # Direct messages
│   └── notifications/ # Notifications
├── shared/            # Shared resources
│   ├── config/        # Database, Cloudinary, JWT config
│   ├── middleware/    # Auth, validation, error handling
│   ├── utils/         # Helpers, validators
│   └── types/         # Shared TypeScript types
├── app.ts             # Express app setup
└── server.ts          # Server entry point
```

## Cài đặt

1. Clone repository và cài đặt dependencies:

```bash
npm install
```

2. Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

3. Cấu hình các biến môi trường trong `.env`:

- MongoDB connection string
- JWT secrets
- Cloudinary credentials

4. Chạy development server:

```bash
npm run dev
```

5. Build cho production:

```bash
npm run build
npm start
```

## API Documentation

Sau khi start server, truy cập Swagger UI tại:

```
http://localhost:3000/api-docs
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh-token` - Refresh token
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/profile` - Lấy thông tin profile

### Posts
- `POST /api/posts` - Tạo post
- `GET /api/posts` - Lấy danh sách posts
- `GET /api/posts/:id` - Lấy chi tiết post
- `PUT /api/posts/:id` - Cập nhật post
- `DELETE /api/posts/:id` - Xóa post

### Comments
- `POST /api/comments/posts/:postId` - Tạo comment
- `GET /api/comments/posts/:postId` - Lấy comments của post
- `GET /api/comments/:id/replies` - Lấy replies của comment
- `PUT /api/comments/:id` - Cập nhật comment
- `DELETE /api/comments/:id` - Xóa comment

### Reactions
- `POST /api/reactions/:targetType/:targetId` - Toggle reaction
- `GET /api/reactions/:targetType/:targetId` - Lấy reactions
- `GET /api/reactions/:targetType/:targetId/user` - Lấy reaction của user

### Follows
- `POST /api/follows/:userId` - Follow user
- `DELETE /api/follows/:userId` - Unfollow user
- `GET /api/follows/:userId` - Lấy followers/following
- `GET /api/follows/:userId/check` - Kiểm tra follow status
- `GET /api/follows/:userId/stats` - Lấy follow stats

### Messages
- `POST /api/messages` - Gửi message
- `GET /api/messages/conversations` - Lấy danh sách conversations
- `GET /api/messages/:userId` - Lấy messages với user
- `PUT /api/messages/:id/read` - Đánh dấu đã đọc
- `GET /api/messages/unread/count` - Lấy số tin nhắn chưa đọc

### Notifications
- `GET /api/notifications` - Lấy notifications
- `PUT /api/notifications/:id/read` - Đánh dấu đã đọc
- `PUT /api/notifications/read-all` - Đánh dấu tất cả đã đọc
- `GET /api/notifications/unread/count` - Lấy số notification chưa đọc
- `DELETE /api/notifications/:id` - Xóa notification

## Clean Code Principles

- **Separation of Concerns**: Controller → Service → Model
- **Dependency Injection**: Services nhận dependencies qua constructor
- **Error Handling**: Custom error classes với proper HTTP status codes
- **Validation**: Input validation ở route level
- **Type Safety**: Full TypeScript với strict mode
- **Code Organization**: Mỗi module độc lập, dễ maintain và scale

## License

ISC

