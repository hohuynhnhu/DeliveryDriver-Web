<template>
  <div class="space-y-4">
    <!-- Search + GPS -->
    <div class="flex gap-2">
      <input
        v-model="keyword"
        placeholder="Nhập địa điểm để tìm kiếm..."
        @input="onSearch"
        class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        @click="getCurrentLocation"
        class="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-95 transition whitespace-nowrap"
      >
        📍 Vị trí hiện tại
      </button>
    </div>

    <!-- Search Results -->
    <div v-if="results.length" class="relative">
      <ul class="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto">
        <li
          v-for="item in results"
          :key="item.place_id"
          @click="selectPlace(item)"
          class="px-4 py-2 cursor-pointer text-sm hover:bg-blue-50 transition"
        >
          {{ item.display_name }}
        </li>
      </ul>
    </div>

    <!-- Coordinates -->
    <div class="grid grid-cols-2 gap-3">
      <input
        v-model.number="lat"
        placeholder="Latitude"
        @change="onCoordChange"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      <input
        v-model.number="lng"
        placeholder="Longitude"
        @change="onCoordChange"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <!-- Address Display -->
    <div v-if="address" class="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
      <span class="font-semibold text-blue-700">Địa chỉ:</span>
      <div class="mt-1 leading-relaxed">{{ address }}</div>
    </div>

    <!-- Map -->
    <ClientOnly>
      <div class="h-[400px] rounded-xl overflow-hidden shadow-lg border">
        <MapPicker
          :lat="lat"
          :lng="lng"
          @select="onSelect"
          class="h-full w-full"
        />
      </div>
      <template #fallback>
        <div class="h-[400px] rounded-xl bg-gray-100 flex items-center justify-center">
          <p class="text-gray-500">Đang tải bản đồ...</p>
        </div>
      </template>
    </ClientOnly>

    <!-- Confirm Button -->
    <button
      @click="confirmLocation"
      class="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
    >
      Xác nhận vị trí
    </button>
  </div>
</template>

<script setup lang="ts">
import MapPicker from './MapPicker.vue'
import type { GeoPoint } from '@/@type/auth'

const props = defineProps<{
  initialLat?: number
  initialLng?: number
}>()

const emit = defineEmits<{
  (e: 'select', location: GeoPoint, address: string): void
}>()

const lat = ref<number>(props.initialLat || 10.7769)
const lng = ref<number>(props.initialLng || 106.7009)
const keyword = ref('')
const results = ref<any[]>([])
const address = ref('')

const onSelect = async (la: number, ln: number) => {
  lat.value = la
  lng.value = ln
  await reverseGeocode(la, ln)
}

const getCurrentLocation = () => {
  if (!import.meta.client) return

  if (!navigator.geolocation) {
    alert('Trình duyệt không hỗ trợ định vị')
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const la = position.coords.latitude
      const ln = position.coords.longitude
      lat.value = la
      lng.value = ln
      await reverseGeocode(la, ln)
    },
    (error) => {
      console.error(error)
      alert('Không thể lấy vị trí hiện tại')
    },
    {
      enableHighAccuracy: true,
      timeout: 10000
    }
  )
}

const searchLocation = async (query: string) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?` +
      new URLSearchParams({
        q: query,
        format: 'json',
        limit: '5'
      }),
    {
      headers: { 'User-Agent': 'delivery-driver-app' }
    }
  )
  return await res.json()
}

const onSearch = async () => {
  if (keyword.value.length < 3) {
    results.value = []
    return
  }
  results.value = await searchLocation(keyword.value)
}

const selectPlace = async (place: any) => {
  lat.value = Number(place.lat)
  lng.value = Number(place.lon)
  address.value = place.display_name
  results.value = []
  keyword.value = ''
}

const reverseGeocode = async (la: number, ln: number) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
        new URLSearchParams({
          lat: la.toString(),
          lon: ln.toString(),
          format: 'json'
        }),
      {
        headers: { 'User-Agent': 'delivery-driver-app' }
      }
    )
    const data = await res.json()
    address.value = data.display_name || 'Không tìm thấy địa chỉ'
  } catch (error) {
    console.error('Reverse geocode error:', error)
    address.value = ''
  }
}

const onCoordChange = async () => {
  if (lat.value && lng.value) {
    await reverseGeocode(lat.value, lng.value)
  }
}

const confirmLocation = () => {
  emit('select', { lat: lat.value, lng: lng.value }, address.value)
}

onMounted(async () => {
  await reverseGeocode(lat.value, lng.value)
})
</script>