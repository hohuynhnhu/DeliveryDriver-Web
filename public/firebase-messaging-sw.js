// 1. Dùng importScripts cho Service Worker (Bắt buộc)
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// 2. Config của bạn (đã điền đúng thông tin Web App)
const firebaseConfig = {
  apiKey: "AIzaSyCXlzKjUX-2OtynYOTQqT1PmZausQnH-O8",
  authDomain: "fe-mobile-delivery.firebaseapp.com",
  projectId: "fe-mobile-delivery",
  storageBucket: "fe-mobile-delivery.firebasestorage.app",
  messagingSenderId: "1056514423021",
  appId: "1:1056514423021:web:ef9a150aa1ab2d03f374e4",
  measurementId: "G-V4WH6CKQ9D"
};

// 3. Khởi tạo bằng cú pháp compat (dành cho Service Worker)
firebase.initializeApp(firebaseConfig);

// 4. Lấy instance messaging
const messaging = firebase.messaging();

// 5. Xử lý nhận tin nhắn khi App tắt hoặc chạy nền
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico' // Đổi thành file icon thực tế trong thư mục public của bạn
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});