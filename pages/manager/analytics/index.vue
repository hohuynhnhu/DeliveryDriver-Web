<template>
  <div class="p-6 space-y-8 bg-gray-50 min-h-screen">
    <!-- HEADER -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        📊 Route Analytics Dashboard
      </h1>
      <p class="text-gray-500 text-sm">
        Phân tích tuyến pickup → delivery từ dữ liệu đơn hàng
      </p>
    </div>

    <!-- FILTER -->
    <div class="bg-white p-4 rounded-xl shadow-sm border flex flex-wrap gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Min Support
        </label>
        <input
          v-model.number="minSupport"
          type="number"
          step="0.01"
          class="mt-1 w-32 rounded-md border-gray-300 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">
          Min Confidence
        </label>
        <input
          v-model.number="minConfidence"
          type="number"
          step="0.05"
          class="mt-1 w-32 rounded-md border-gray-300 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      <div class="flex items-end">
        <button
          @click="loadRouteAnalysis"
          class="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          Phân tích
        </button>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="isLoading" class="text-center text-gray-500">
      ⏳ Đang phân tích dữ liệu...
    </div>

    <!-- ERROR -->
    <div v-if="error" class="text-red-600 bg-red-50 p-4 rounded-lg">
      ❌ {{ error }}
    </div>

    <!-- STATS -->
    <div
      v-if="areaStats"
      class="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <!-- PICKUP -->
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <h2 class="font-semibold text-gray-800 mb-3">
          📦 Top Pickup Areas
        </h2>

        <ul class="space-y-2">
          <li
            v-for="item in areaStats.pickup_areas"
            :key="item.area"
            class="flex justify-between text-sm"
          >
            <span>{{ item.area }}</span>
            <span class="font-medium">{{ item.count }}</span>
          </li>
        </ul>
      </div>

      <!-- DELIVERY -->
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <h2 class="font-semibold text-gray-800 mb-3">
          🚚 Top Delivery Areas
        </h2>

        <ul class="space-y-2">
          <li
            v-for="item in areaStats.delivery_areas"
            :key="item.area"
            class="flex justify-between text-sm"
          >
            <span>{{ item.area }}</span>
            <span class="font-medium">{{ item.count }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- ROUTE RULE TABLE -->
    <div
      v-if="routeRules.length"
      class="bg-white rounded-xl shadow-sm border p-4"
    >
      <h2 class="font-semibold text-gray-800 mb-4">
        🔗 Route Association Rules
      </h2>

      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-100 text-gray-600">
            <tr>
              <th class="px-3 py-2 text-left">From</th>
              <th class="px-3 py-2 text-left">To</th>
              <th class="px-3 py-2 text-right">Support</th>
              <th class="px-3 py-2 text-right">Confidence</th>
              <th class="px-3 py-2 text-right">Lift</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(rule, index) in routeRules"
              :key="index"
              class="border-t hover:bg-gray-50"
            >
              <td class="px-3 py-2 font-medium">
                {{ rule.from }}
              </td>
              <td class="px-3 py-2">
                {{ formatTo(rule.to) }}
              </td>
              <td class="px-3 py-2 text-right">
                {{ rule.support }}
              </td>
              <td class="px-3 py-2 text-right">
                {{ rule.confidence }}
              </td>
              <td
                class="px-3 py-2 text-right font-medium"
                :class="rule.lift > 1 ? 'text-green-600' : 'text-gray-600'"
              >
                {{ rule.lift }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useData } from '@/composables/useData'

const {
  routeRules,
  areaStats,
  isLoading,
  error,
  getRouteAnalysis,
  getAreaStats,
} = useData()

const minSupport = ref(0.05)
const minConfidence = ref(0.3)

const loadRouteAnalysis = async () => {
  await getRouteAnalysis({
    min_support: minSupport.value,
    min_confidence: minConfidence.value,
  })
}

const formatTo = (to: string | string[]) => {
  return Array.isArray(to) ? to.join(', ') : to
}

onMounted(async () => {
  await loadRouteAnalysis()
  await getAreaStats()
})
</script>
