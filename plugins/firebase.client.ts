import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  // Lấy cấu hình từ runtimeConfig (đã khai báo trong nuxt.config.ts)
  const firebaseConfig = {
    apiKey: config.public.apiKey as string,
    authDomain: config.public.authDomain as string,
    projectId: config.public.projectId as string,
    storageBucket: config.public.storageBucket as string,
    messagingSenderId: config.public.messagingSenderId as string,
    appId: config.public.appId as string,
    measurementId: config.public.measurementId as string
  };

  // Khởi tạo Firebase App
  const app = initializeApp(firebaseConfig);
  
  // Khởi tạo Messaging
  const messaging = getMessaging(app);

  // Cung cấp $messaging cho toàn bộ ứng dụng dùng chung
  return {
    provide: {
      messaging
    }
  }
});