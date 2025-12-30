import { useAuth } from '../composables/useAuth';

export default defineNuxtRouteMiddleware(async (to) => {
    // Only run on client side
    if (process.server) {
        return;
    }

    // Redirect root path to dashboard
    if (to.path === "/") {
        // return navigateTo("/");
    }
});

