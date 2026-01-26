<template>
  <div class="max-w-6xl mx-auto p-4">
    <h2 class="text-2xl font-semibold mb-5 text-gray-800">
       Chọn vị trí trên bản đồ
    </h2>

    <!-- MAIN LAYOUT -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- LEFT PANEL -->
      <div class="space-y-4">

        <!-- SEARCH + GPS -->
        <div class="relative">
          <div class="flex gap-2">
            <input
              v-model="keyword"
              placeholder="Nhập địa điểm để tìm kiếm..."
              @input="onSearch"
              class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              @click="getCurrentLocation"
              class="px-4 py-2.5 bg-green-600 text-white rounded-lg
                     hover:bg-green-700 active:scale-95 transition"
            >
              Vị trí hiện tại
            </button>
          </div>

          <!-- SEARCH RESULTS -->
          <ul
            v-if="results.length"
            class="absolute z-20 mt-1 w-full bg-white border border-gray-200
                   rounded-lg shadow-lg max-h-56 overflow-auto"
          >
            <li
              v-for="item in results"
              :key="item.place_id"
              @click="selectPlace(item)"
              class="px-4 py-2 cursor-pointer text-sm
                     hover:bg-blue-50 transition"
            >
              {{ item.display_name }}
            </li>
          </ul>
        </div>

        <!-- COORDINATES -->
        <div class="grid grid-cols-2 gap-3">
          <input
            v-model.number="lat"
            placeholder="Latitude"
            @change="onCoordChange"
            class="px-4 py-2 border border-gray-300 rounded-lg
                   focus:ring-2 focus:ring-blue-500"
          />
          <input
            v-model.number="lng"
            placeholder="Longitude"
            @change="onCoordChange"
            class="px-4 py-2 border border-gray-300 rounded-lg
                   focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- ADDRESS -->
        <div
          v-if="address"
          class="p-3 bg-blue-50 border border-blue-200
                 rounded-lg text-sm text-gray-700"
        >
          <span class="font-semibold text-blue-700">Địa chỉ:</span>
          <div class="mt-1 leading-relaxed">
            {{ address }}
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL (MAP) -->
      <ClientOnly>
        <div class="h-[520px] rounded-xl overflow-hidden shadow-lg border">
          <MapPicker
            :lat="lat"
            :lng="lng"
            @select="onSelect"
            class="h-full w-full"
          />
        </div>
      </ClientOnly>

    </div>
  </div>
</template>



<script setup lang="ts">
import MapPicker from '@/components/MapPicker.vue'

const lat = ref<number>(10.7769)
const lng = ref<number>(106.7009)

const keyword = ref('')
const results = ref<any[]>([])
const address = ref('')

const onSelect = async (la: number, ln: number) => {
  lat.value = la
  lng.value = ln
  await reverseGeocode(la, ln)
}


//lấy vị trí hiện tại
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


/*  SEARCH OSM (địa chỉ → tọa độ) */
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

/* 🔄 REVERSE GEOCODE (tọa độ → địa chỉ) */
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

/* Khi người dùng nhập tọa độ trực tiếp */
const onCoordChange = async () => {
  if (lat.value && lng.value) {
    await reverseGeocode(lat.value, lng.value)
  }
}

// Load địa chỉ ban đầu
onMounted(async () => {
  await reverseGeocode(lat.value, lng.value)
})
</script>