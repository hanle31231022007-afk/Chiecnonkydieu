# Wheel of Fortune (Chiếc Nón Kỳ Diệu)

Mã nguồn mở trò chơi **Chiếc Nón Kỳ Diệu** phiên bản web, được xây dựng bằng HTML, CSS và JavaScript thuần.

## Tính năng

-   **Giao diện**: Thiết kế hiện đại, sang trọng theo phong cách gameshow truyền hình.
-   **Luật chơi**:
    -   Quay nón để nhận điểm hoặc mất lượt.
    -   Đoán chữ cái để giải ô chữ.
    -   Hai vòng chơi với đáp án cố định: **HUREA** và **HR0003**.
-   **Tương thích**: Chạy tốt trên trình duyệt máy tính và điện thoại.

## Cách cài đặt và chạy

1.  Tải toàn bộ mã nguồn về máy.
2.  Mở tệp `index.html` bằng trình duyệt web bất kỳ (Chrome, Firefox, Edge...).
3.  Bắt đầu chơi ngay lập tức!

## Cấu trúc thư mục

-   `index.html`: File chính chứa giao diện trò chơi.
-   `style.css`: File chứa định dạng, màu sắc và hiệu ứng.
-   `script.js`: File chứa logic trò chơi (quay nón, tính điểm, ô chữ).

## Tùy chỉnh

Bạn có thể thay đổi câu hỏi và đáp án trong file `script.js`:

```javascript
const puzzles = [
    { answer: "HUREA", hint: "Câu hỏi 1..." },
    { answer: "HR0003", hint: "Câu hỏi 2..." }
];
```

## Tác giả

Dự án được tạo bởi Assistant.
