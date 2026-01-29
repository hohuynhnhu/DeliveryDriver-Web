<template>
  <div ref="mapEl" class="h-96 w-full rounded-xl shadow-lg"></div>
</template>

<script setup lang="ts">
import L from 'leaflet'

const props = defineProps<{
  lat: number
  lng: number
}>()

const emit = defineEmits<{
  (e: 'select', lat: number, lng: number): void
}>()

const mapEl = ref<HTMLDivElement | null>(null)

let map: L.Map
let marker: L.Marker

onMounted(() => {
  map = L.map(mapEl.value!).setView([props.lat, props.lng], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map)

  marker = L.marker([props.lat, props.lng]).addTo(map)

  map.on('click', (e) => {
    const { lat, lng } = e.latlng
    marker.setLatLng([lat, lng])
    emit('select', lat, lng)
  })
})

watch(
  () => [props.lat, props.lng],
  ([lat, lng]) => {
    if (!map) return
    map.setView([lat, lng], 16)
    marker.setLatLng([lat, lng])
  }
)
</script>