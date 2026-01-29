import { getToken } from "firebase/messaging";
import type { Messaging } from "firebase/messaging"; 

export const useFcm = () => {
  const { $messaging } = useNuxtApp();
  const config = useRuntimeConfig();

  const getFcmToken = async () => {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        console.log(" Quyền thông báo đã được cấp.");

        const currentToken = await getToken($messaging as Messaging, {
          vapidKey: (config.public.vapidKey as string) || (config.public.vapidKey as string)
        });

        if (currentToken) {
          console.log("FCM Token:", currentToken);
          return currentToken;
        } else {
          console.log(" Không lấy được Token.");
        }
      } else {
        console.log("Người dùng từ chối.");
      }
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  return { getFcmToken };
};