# TÀI LIỆU TÍNH NĂNG CHO FRONTEND

## 1. AUTHENTICATION & AUTHORIZATION

### 1.1. Đăng ký tài khoản

Là người dùng mới, tôi muốn đăng ký tài khoản để sử dụng hệ thống. Hệ thống yêu cầu email, mật khẩu, họ tên. Username có thể tự nhập hoặc hệ thống tự tạo. Sau khi đăng ký thành công, tôi nhận được accessToken và refreshToken để đăng nhập tự động.

### 1.2. Đăng nhập

Là người dùng, tôi muốn đăng nhập vào hệ thống bằng email và mật khẩu. Sau khi đăng nhập thành công, tôi nhận được accessToken và refreshToken để truy cập các tính năng yêu cầu xác thực.

### 1.3. Refresh Token

Là người dùng, khi accessToken hết hạn, tôi muốn làm mới token mà không cần đăng nhập lại. Hệ thống sẽ cấp accessToken mới khi tôi gửi refreshToken hợp lệ.

### 1.4. Đăng xuất

Là người dùng, tôi muốn đăng xuất khỏi hệ thống để kết thúc phiên làm việc.

### 1.5. Xem profile của tôi

Là người dùng, tôi muốn xem thông tin profile đầy đủ của mình bao gồm thống kê số bài đăng, số người follow và đang follow.

---

## 2. QUẢN LÝ NGƯỜI DÙNG

### 2.1. Xem profile người dùng khác

Là người dùng, tôi muốn xem profile của người dùng khác để biết thông tin, số bài đăng, số followers/following. Nếu tôi đã đăng nhập, tôi sẽ thấy thêm trạng thái follow (đang follow hay chưa).

### 2.2. Cập nhật profile

Là người dùng, tôi muốn cập nhật thông tin profile của mình như họ tên, username, bio, avatar. Username phải duy nhất và chỉ chứa chữ và số. Bio tối đa 500 ký tự.

---

## 3. QUẢN LÝ BÀI ĐĂNG

### 3.1. Tạo bài đăng

Là người dùng, tôi muốn tạo bài đăng với nội dung text, có thể kèm ảnh/video (tối đa 10 files). Tôi có thể mention người dùng khác bằng `@username` và sử dụng hashtag. Tôi có thể chọn quyền riêng tư: công khai, chỉ mình tôi, hoặc chỉ người follow tôi.

### 3.2. Xem danh sách bài đăng

Là người dùng, tôi muốn xem danh sách bài đăng trên feed. Hệ thống sẽ hiển thị các bài đăng phù hợp với quyền riêng tư. Tôi có thể lọc theo user cụ thể. Danh sách có phân trang và hiển thị reaction của tôi nếu đã đăng nhập.

### 3.3. Xem bài đăng của tôi

Là người dùng, tôi muốn xem tất cả bài đăng mà tôi đã tạo, bao gồm cả bài đăng riêng tư.

### 3.4. Xem chi tiết bài đăng

Là người dùng, tôi muốn xem chi tiết một bài đăng cụ thể với đầy đủ thông tin.

### 3.5. Chỉnh sửa bài đăng

Là người dùng, tôi muốn chỉnh sửa nội dung, media, hoặc quyền riêng tư của bài đăng mà tôi đã tạo.

### 3.6. Xóa bài đăng

Là người dùng, tôi muốn xóa bài đăng mà tôi đã tạo.

---

## 4. BÌNH LUẬN

### 4.1. Bình luận bài đăng

Là người dùng, tôi muốn bình luận trên bài đăng của người khác. Tôi có thể mention người dùng khác trong bình luận bằng `@username`.

### 4.2. Reply bình luận

Là người dùng, tôi muốn trả lời một bình luận cụ thể để tạo cuộc thảo luận theo dạng thread.

### 4.3. Xem bình luận của bài đăng

Là người dùng, tôi muốn xem tất cả bình luận của một bài đăng. Hệ thống hiển thị các bình luận top-level, tôi có thể xem replies riêng khi cần.

### 4.4. Xem replies của bình luận

Là người dùng, tôi muốn xem các câu trả lời của một bình luận cụ thể.

### 4.5. Chỉnh sửa bình luận

Là người dùng, tôi muốn chỉnh sửa bình luận mà tôi đã tạo.

### 4.6. Xóa bình luận

Là người dùng, tôi muốn xóa bình luận mà tôi đã tạo.

---

## 5. TƯƠNG TÁC (REACTIONS)

### 5.1. Thả reaction

Là người dùng, tôi muốn thể hiện cảm xúc với bài đăng hoặc bình luận bằng 6 loại reaction: like, love, haha, wow, sad, angry. Nếu tôi đã reaction rồi, nhấn lại sẽ bỏ reaction. Nếu tôi đổi sang loại reaction khác, hệ thống sẽ cập nhật.

### 5.2. Xem danh sách người đã reaction

Là người dùng, tôi muốn xem danh sách những người đã reaction và loại reaction của họ. Hệ thống cũng hiển thị tổng số reaction theo từng loại.

### 5.3. Kiểm tra reaction của tôi

Là người dùng, tôi muốn biết tôi đã reaction gì (nếu có) cho một bài đăng hoặc bình luận.

---

## 6. FOLLOW/UNFOLLOW

### 6.1. Follow người dùng

Là người dùng, tôi muốn follow người dùng khác để xem nội dung của họ trong feed.

### 6.2. Unfollow người dùng

Là người dùng, tôi muốn bỏ follow người dùng mà tôi đã follow trước đó.

### 6.3. Xem danh sách followers/following

Là người dùng, tôi muốn xem danh sách những người đang follow tôi (followers) hoặc những người tôi đang follow (following).

### 6.4. Kiểm tra trạng thái follow

Là người dùng, tôi muốn biết tôi có đang follow một người dùng cụ thể không, và người đó có đang follow tôi không.

### 6.5. Xem thống kê follow

Là người dùng, tôi muốn xem số lượng followers và following của một người dùng.

---

## 7. THÔNG BÁO

### 7.1. Xem danh sách thông báo

Là người dùng, tôi muốn xem tất cả thông báo của tôi. Hệ thống thông báo khi có người like, comment, follow, mention, hoặc reply bình luận của tôi. Tôi có thể lọc chỉ xem thông báo chưa đọc.

### 7.2. Đánh dấu đã đọc

Là người dùng, tôi muốn đánh dấu một thông báo cụ thể là đã đọc.

### 7.3. Đánh dấu tất cả đã đọc

Là người dùng, tôi muốn đánh dấu tất cả thông báo là đã đọc cùng lúc.

### 7.4. Xem số thông báo chưa đọc

Là người dùng, tôi muốn biết số lượng thông báo chưa đọc để hiển thị badge.

### 7.5. Xóa thông báo

Là người dùng, tôi muốn xóa một thông báo cụ thể.

---

## 8. TÌM KIẾM

### 8.1. Tìm kiếm

Là người dùng, tôi muốn tìm kiếm người dùng, bài đăng, hoặc hashtag. Tôi có thể tìm tất cả hoặc chỉ một loại cụ thể. Kết quả có thể sắp xếp và lọc theo ngày, user, v.v.

---

## 9. CÁC TÍNH NĂNG ĐẶC BIỆT

### 9.1. Mention Users

Hệ thống hỗ trợ mention người dùng trong nội dung bài đăng và bình luận bằng format `@username`. Khi có mention, hệ thống tự động tạo thông báo cho người được mention.

### 9.2. Hashtags

Hệ thống tự động nhận diện và extract hashtag từ nội dung. Có thể tìm kiếm theo hashtag và xem số lượng bài đăng liên quan.

### 9.3. Quyền riêng tư bài đăng

- **Public**: Ai cũng có thể xem
- **Private**: Chỉ mình tôi xem được
- **Followers**: Chỉ những người đang follow tôi mới xem được

### 9.4. Upload Media

Hệ thống hỗ trợ upload ảnh và video, tối đa 10 files mỗi bài đăng. Files được lưu trên Cloudinary và trả về URLs để hiển thị.

### 9.5. Phân trang

Tất cả danh sách đều hỗ trợ phân trang với thông tin: page, limit, total, pages.

---

## 10. ERROR HANDLING

Hệ thống trả về các status code chuẩn:

- `200`: Thành công
- `201`: Tạo mới thành công
- `400`: Lỗi validation
- `401`: Chưa đăng nhập hoặc token hết hạn
- `403`: Không có quyền
- `404`: Không tìm thấy
- `409`: Dữ liệu trùng lặp
- `500`: Lỗi server

Format lỗi: `{ success: false, message: "...", errors: [...] }`
