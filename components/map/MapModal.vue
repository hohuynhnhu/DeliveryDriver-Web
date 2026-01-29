<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="close"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div class="p-6">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">{{ title }}</h3>
            <button
              @click="close"
              class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
          
          <!-- Location Picker -->
          <LocationPicker
            :initial-lat="initialLat"
            :initial-lng="initialLng"
            @select="handleSelect"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import LocationPicker from './LocationPicker.vue'
import type { GeoPoint } from '@/@type/auth'

const props = defineProps<{
  modelValue: boolean
  title: string
  initialLat?: number
  initialLng?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [location: GeoPoint, address: string]
}>()

const close = () => {
  emit('update:modelValue', false)
}

const handleSelect = (location: GeoPoint, address: string) => {
  emit('select', location, address)
  close()
}
</script>