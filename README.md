# Inventory Order Sync Management System — Frontend

Đây là ứng dụng giao diện (frontend) cho hệ thống quản lý sản phẩm, khách hàng, đơn hàng, tồn kho và báo cáo. Frontend giao tiếp với backend qua HTTP API dưới prefix `/api`.

Mục tiêu tài liệu này là mô tả nhanh cấu trúc dự án, công nghệ sử dụng, và cách frontend liên quan đến Database/Backend (phù hợp cho review của HR/đội backend).

## Kiến trúc tổng quan

- Frontend (React) chỉ hiển thị UI và gọi API.
- Backend (.NET Web API) chịu trách nhiệm xử lý nghiệp vụ, truy cập database và đảm bảo toàn vẹn dữ liệu.
- Database không được cấu hình trực tiếp trong repo frontend này (không có connection string, migrations, schema trong repo này).
- Loại database (SQL Server/MySQL/PostgreSQL/...) được quyết định và cấu hình ở repo backend.

Luồng dữ liệu:

`Browser (UI) -> /api/* -> Backend Web API -> Database`

## Công nghệ sử dụng

- Vite 5
- React 18
- React Router DOM (điều hướng)
- TailwindCSS (styling)
- Axios (gọi API)
- Recharts (trang báo cáo/biểu đồ)

## Yêu cầu môi trường

- Node.js 18+ (khuyến nghị)
- Backend API đang chạy để có dữ liệu thật

## Cách chạy

```bash
npm install
npm run dev
```

- Dev server mặc định: `http://localhost:3000`
- Dev server mặc định: `http://localhost:3000`
- Proxy API (dev) cấu hình trong `vite.config.js`: `/api` được forward sang backend (mặc định `http://127.0.0.1:5080`).

### Troubleshooting nhanh (Vite proxy `ECONNREFUSED`)

Nếu thấy log dạng:

`[vite] http proxy error: /api/...` + `AggregateError [ECONNREFUSED]`

thì thường là **backend chưa chạy / chạy sai port** so với cấu hình proxy.

- Kiểm tra backend có listen port `5080` không (Windows):
  - `netstat -ano | findstr ":5080"`
- Gọi thử API trực tiếp vào backend (PowerShell lưu ý dùng `curl.exe`):
  - `curl.exe -i http://127.0.0.1:5080/api/products`

Build/preview:

```bash
npm run build
npm run preview
```

## Cấu trúc thư mục

```
src/
  main.jsx              # Entry (render React)
  App.jsx               # Router + bố cục layout (đang dùng)
  App.js                # File legacy/không dùng trong luồng chạy hiện tại
  api.js                # Axios client + các hàm gọi API
  components/
    Layout.jsx          # Layout (sidebar/header)
  pages/
    Dashboard.jsx
    ProductsPage.jsx
    ProductsPage.js
    CustomersPage.jsx
    CustomersPage.js
    OrdersPage.jsx
    OrdersPage.js
    InventoryPage.jsx
    InventoryPage.js
    ReportsPage.jsx
    ReportsPage.js
  index.css             # Tailwind directives + utility classes
```

Ghi chú: trong `src/` và `src/pages/` có cả file `.js` và `.jsx`. Luồng chạy hiện tại đang dùng các file `.jsx` (import từ `main.jsx` -> `App.jsx`). Các file `.js` có thể là bản cũ/đang chuyển đổi.

## Routing

Các route chính được định nghĩa trong `src/App.jsx`:

- `/` (Dashboard)
- `/products`
- `/customers`
- `/orders`
- `/inventory`
- `/reports`

## Tích hợp API (Frontend <-> Backend)

Axios client nằm trong `src/api.js` với `baseURL: '/api'`. Các nhóm API hiện có:

- Products
  - `GET /api/products`
  - `GET /api/products/:id`
  - `POST /api/products`
  - `PUT /api/products/:id`
  - `DELETE /api/products/:id`
- Customers
  - `GET /api/customers`
  - `GET /api/customers/:id`
  - `POST /api/customers`
  - `PUT /api/customers/:id`
  - `DELETE /api/customers/:id`
- Orders
  - `GET /api/orders`
  - `GET /api/orders/:id`
  - `POST /api/orders`
  - `PUT /api/orders/:id`
  - `DELETE /api/orders/:id`
- Inventory
  - `GET /api/inventory`
  - `GET /api/inventory/:productId`
  - `POST /api/inventory`
  - `PUT /api/inventory/:productId`
  - `DELETE /api/inventory/:productId`
- Reports
  - `GET /api/reports/top-selling?topN=5`
  - `GET /api/reports/inventory`
  - `GET /api/reports/revenue?period=daily`

Lưu ý: một số trang hiện có dữ liệu demo/fallback khi API chưa sẵn sàng (phục vụ UI preview).

## Database & Backend 

Phần dưới đây mô tả phạm vi công việc liên quan Database/Backend trong bối cảnh hệ thống này. Các artefact thực thi (schema, ERD, scripts, EF models, migrations) thuộc repo backend .NET.

### 1) Thiết kế & quản lý dữ liệu

- Thiết kế bảng (Tables) cho các module: Products, Customers, Orders, Inventory, Reports.
- Xây dựng sơ đồ quan hệ (ERD), chỉ rõ:
  - Khoá chính/khoá ngoại
  - Quan hệ 1-n, n-n (nếu có)
  - Ràng buộc dữ liệu (NOT NULL, UNIQUE, CHECK)
- Quy ước đặt tên cột, kiểu dữ liệu, index strategy để đồng bộ Web/Mobile.

### 2) Tối ưu truy vấn

- Viết và tối ưu SQL cho các màn hình/listing/report.
- Thiết kế và sử dụng:
  - Stored Procedures (cho nghiệp vụ/phân quyền/phân trang nếu cần)
  - Functions (tính toán/chuẩn hoá)
  - Views (tổng hợp phục vụ báo cáo)
- Đánh giá index và plan để xử lý truy vấn chậm.

### 3) Hỗ trợ Backend (.NET)

- Phối hợp mapping Entity Framework (models, relationships, constraints) bám sát ERD.
- Đồng bộ hợp đồng API (request/response) giữa frontend và backend.
- Đề xuất validation ở backend để đảm bảo dữ liệu xử lý chính xác và nhất quán.

### 4) Kiểm thử & bảo trì dữ liệu

- Kiểm tra toàn vẹn dữ liệu (FK/unique/check constraints), dữ liệu rác/thiếu.
- Theo dõi lỗi phát sinh từ API/DB và tối ưu các câu truy vấn chậm.
- Thiết lập quy trình kiểm tra dữ liệu sau khi migrate/seed (tuỳ theo backend).

### 5) Tài liệu hoá Database (Data Dictionary)

- Data Dictionary tối thiểu cho mỗi bảng:
  - Tên cột, kiểu dữ liệu
  - Ý nghĩa nghiệp vụ
  - Nullability, default
  - Constraints (PK/FK/unique/check)
  - Index liên quan
- Tài liệu hoá endpoints liên quan và mapping field giữa API <-> DB.

## Các link khác trong project
[Backend](https://github.com/boakang/Inventory_OrderSyncManagementSystem_backend)
[Database](https://github.com/boakang/Inventory_OrderSyncManagementSystem_sqlserver)
