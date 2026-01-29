<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div class="flex items-center justify-between">
      <template v-for="(s, idx) in steps" :key="s.num">
        <div class="flex flex-col items-center flex-1">
          <div :class="[
            'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all',
            currentStep >= s.num 
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
              : 'bg-gray-200 text-gray-500'
          ]">
            <Check v-if="currentStep > s.num" class="w-5 h-5" />
            <span v-else>{{ s.num }}</span>
          </div>
          <p class="text-sm mt-2 font-medium text-gray-700">{{ s.label }}</p>
        </div>
        <div v-if="idx < steps.length - 1" :class="[
          'h-1 flex-1 mx-2 rounded-full transition-all',
          currentStep > s.num ? 'bg-purple-600' : 'bg-gray-200'
        ]" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'

defineProps<{
  currentStep: number
}>()

const steps = [
  { num: 1, label: 'Thông tin' },
  { num: 2, label: 'Phương thức' },
  { num: 3, label: 'Xác nhận' }
]
</script>