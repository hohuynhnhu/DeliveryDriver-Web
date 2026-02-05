<template>
  <div class="analytics-dashboard">
    

    <!-- ERROR -->
    <div v-if="error" class="error-banner">
      <span> {{ error }}</span>
      <button @click="clearError" class="dismiss-btn">×</button>
    </div>

    <!-- LOADING -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Analyzing data...</p>
    </div>

    <!-- TABS -->
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['tab', { active: activeTab === tab.id }]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- TAB CONTENT -->
    <div class="tab-content">
      <!-- TAB 1: LOCATION PAIRS -->
      <div v-if="activeTab === 'pairs'" class="tab-panel">
        <div class="panel-header">
          <h2> Location Pairs Analysis</h2>
          <span class="badge">{{ locationPairs.length }} pairs found</span>
        </div>

        <div v-if="locationPairs.length" class="pairs-grid">
          <div 
            v-for="(pair, idx) in locationPairs" 
            :key="idx"
            class="pair-card"
            :class="getLiftClass(pair.lift)"
          >
            <div class="pair-route">
              <div class="location pickup">
              
                <span class="text">{{ pair.pickup_location }}</span>
              </div>
              <div class="arrow">→</div>
              <div class="location delivery">
        
                <span class="text">{{ pair.delivery_location }}</span>
              </div>
            </div>

            <div class="pair-metrics">
              <div class="metric">
                <label>Confidence</label>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: (pair.confidence * 100) + '%' }"></div>
                  <span class="progress-text">{{ (pair.confidence * 100).toFixed(1) }}%</span>
                </div>
              </div>

              <div class="metric-row">
                <div class="metric-item">
                  <label>Support</label>
                  <span class="value">{{ (pair.support * 100).toFixed(1) }}%</span>
                </div>
                <div class="metric-item">
                  <label>Lift</label>
                  <span class="value lift" :class="getLiftClass(pair.lift)">{{ pair.lift.toFixed(2) }}×</span>
                </div>
                <div class="metric-item">
                  <label>Orders</label>
                  <span class="value">{{ pair.total_orders }}</span>
                </div>
              </div>
            </div>

            <div class="pair-prediction">
              <strong>{{ pair.prediction }}</strong>
              <p v-if="pair.suggested_office_location" class="suggestion">
                Đề xuất mở bưu cục tại: <strong>{{ pair.suggested_office_location }}</strong>
              </p>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>Không tìm thấy cặp điểm nào. Thử giảm min_support.</p>
        </div>
      </div>

      <!-- TAB 2: POST OFFICE SUGGESTIONS -->
      <div v-if="activeTab === 'suggestions'" class="tab-panel">
        <div class="panel-header">
          <span class="badge">{{ postOfficeSuggestions.length }} locations</span>
        </div>

        <div v-if="postOfficeSuggestions.length" class="suggestions-list">
          <div 
            v-for="(suggestion, idx) in postOfficeSuggestions" 
            :key="idx"
            class="suggestion-card"
            :class="suggestion.priority_level"
          >
            <div class="suggestion-header">
              <div class="location-info">
                <h3>{{ suggestion.location }}</h3>
                <span class="priority-badge" :class="suggestion.priority_level">
                  {{ suggestion.priority_label }}
                </span>
              </div>
              <div class="stats">
                <div class="stat">
                  <span class="label">Orders</span>
                  <span class="value">{{ suggestion.total_orders }}</span>
                </div>
                <div class="stat">
                  <span class="label">Avg Lift</span>
                  <span class="value">{{ suggestion.avg_lift.toFixed(2) }}×</span>
                </div>
                <div class="stat">
                  <span class="label">Avg Conf</span>
                  <span class="value">{{ (suggestion.avg_confidence * 100).toFixed(1) }}%</span>
                </div>
              </div>
            </div>

            <div class="recommendation">
              <strong>{{ suggestion.recommendation }}</strong>
            </div>

            <div class="top-routes">
              <h4>Top Routes:</h4>
              <div class="routes-list">
                <div v-for="(route, ridx) in suggestion.top_routes" :key="ridx" class="route-item">
                  <span class="route-text">{{ route.from }} → {{ route.to }}</span>
                  <div class="route-metrics">
                    <span class="metric-chip">Lift: {{ route.lift.toFixed(2) }}×</span>
                    <span class="metric-chip">Conf: {{ (route.confidence * 100).toFixed(1) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>Chưa có gợi ý bưu cục. Thử điều chỉnh tham số.</p>
        </div>
      </div>

      <!-- TAB 3: LOCATION HOTSPOTS -->
      <div v-if="activeTab === 'hotspots'" class="tab-panel">
        <div class="panel-header">
          <span class="badge">{{ locationHotspots.length }} locations</span>
        </div>

        <div v-if="locationHotspots.length" class="hotspots-table">
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>Pickup</th>
                <th>Delivery</th>
                <th>Total</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(hotspot, idx) in locationHotspots" :key="idx">
                <td class="location-name">{{ hotspot.location }}</td>
                <td>
                  <div class="stat-bar">
                    <div class="bar pickup" :style="{ width: (hotspot.pickup_ratio * 100) + '%' }"></div>
                    <span>{{ hotspot.pickup_count }}</span>
                  </div>
                </td>
                <td>
                  <div class="stat-bar">
                    <div class="bar delivery" :style="{ width: (hotspot.delivery_ratio * 100) + '%' }"></div>
                    <span>{{ hotspot.delivery_count }}</span>
                  </div>
                </td>
                <td class="total-orders">{{ hotspot.total_orders }}</td>
                <td>
                  <span class="category-badge" :class="hotspot.category">
                    {{ formatCategory(hotspot.category) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-state">
          <p>Không có dữ liệu hotspot.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useData } from '@/composables/useData'
definePageMeta({
  layout: 'manager'
})
const {
  locationPairs,
  postOfficeSuggestions,
  locationHotspots,
  isLoading,
  error,
  getLocationPairs,
  getPostOfficeSuggestions,
  getLocationHotspots,
  clearError,
} = useData()

const minSupport = ref(0.01)
const limit = ref(50)
const activeTab = ref('pairs')

const tabs = [
  { id: 'pairs', label: 'Location Pairs' },
  { id: 'suggestions', label: 'Office Suggestions' },
  { id: 'hotspots', label: 'Hotspots' },
]

const loadData = async () => {
  await Promise.all([
    getLocationPairs({ min_support: minSupport.value, limit: limit.value }),
    getPostOfficeSuggestions({ min_support: minSupport.value * 2, top_n: 10 }),
    getLocationHotspots({ top_n: 20 }),
  ])
}

const refreshAll = async () => {
  await loadData()
}

const getLiftClass = (lift: number) => {
  if (lift > 2) return 'lift-high'
  if (lift > 1.5) return 'lift-medium'
  return 'lift-low'
}

const formatCategory = (category: string) => {
  const map: Record<string, string> = {
    'pickup_heavy': '📦 Pickup Heavy',
    'delivery_heavy': '🚚 Delivery Heavy',
    'balanced': '⚖️ Balanced'
  }
  return map[category] || category
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.analytics-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.dashboard-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.subtitle {
  font-size: 0.875rem;
  color: #718096;
}

.refresh-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spin {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
}

.filter-group input {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.875rem;
  width: 120px;
  transition: all 0.3s;
}

.filter-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.analyze-btn {
  padding: 0.75rem 2rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.analyze-btn:hover:not(:disabled) {
  background: #38a169;
  transform: translateY(-2px);
}

.error-banner {
  background: #fed7d7;
  color: #c53030;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.dismiss-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #c53030;
  cursor: pointer;
  padding: 0 0.5rem;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-overlay p {
  color: white;
  margin-top: 1rem;
  font-weight: 600;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 12px 12px 0 0;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  color: #4a5568;
}

.tab:hover {
  background: rgba(255, 255, 255, 0.85);
}

.tab.active {
  background: white;
  color: #667eea;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.tab-content {
  background: white;
  border-radius: 0 20px 20px 20px;
  padding: 2rem;
  min-height: 400px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.panel-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
}

.badge {
  padding: 0.5rem 1rem;
  background: #e6fffa;
  color: #234e52;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.pairs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.pair-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s;
}

.pair-card:hover {
  border-color: #667eea;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.pair-card.lift-high {
  border-left: 4px solid #48bb78;
}

.pair-card.lift-medium {
  border-left: 4px solid #ed8936;
}

.pair-card.lift-low {
  border-left: 4px solid #cbd5e0;
}

.pair-route {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.location {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 10px;
}

.location.pickup {
  background: #ebf8ff;
  color: #2c5282;
}

.location.delivery {
  background: #fef5e7;
  color: #744210;
}

.location .icon {
  font-size: 1.25rem;
}

.location .text {
  font-weight: 600;
  font-size: 0.875rem;
}

.arrow {
  font-size: 1.5rem;
  color: #a0aec0;
  font-weight: bold;
}

.pair-metrics {
  margin-bottom: 1rem;
}

.metric {
  margin-bottom: 1rem;
}

.metric label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #718096;
  display: block;
  margin-bottom: 0.5rem;
}

.progress-bar {
  position: relative;
  height: 28px;
  background: #f7fafc;
  border-radius: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.6s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  font-weight: 700;
  font-size: 0.875rem;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.metric-item {
  text-align: center;
}

.metric-item label {
  font-size: 0.75rem;
  color: #718096;
  display: block;
  margin-bottom: 0.25rem;
}

.metric-item .value {
  font-weight: 700;
  font-size: 1.125rem;
  color: #1a202c;
}

.metric-item .value.lift.lift-high {
  color: #48bb78;
}

.metric-item .value.lift.lift-medium {
  color: #ed8936;
}

.metric-item .value.lift.lift-low {
  color: #a0aec0;
}

.pair-prediction {
  padding: 1rem;
  background: #f7fafc;
  border-radius: 10px;
  font-size: 0.875rem;
}

.pair-prediction strong {
  color: #667eea;
  display: block;
  margin-bottom: 0.5rem;
}

.pair-prediction .suggestion {
  color: #4a5568;
  margin-top: 0.5rem;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.suggestion-card {
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s;
}

.suggestion-card.very_high {
  border-left: 4px solid #f56565;
  background: linear-gradient(to right, #fff5f5, white);
}

.suggestion-card.high {
  border-left: 4px solid #ed8936;
  background: linear-gradient(to right, #fffaf0, white);
}

.suggestion-card.medium {
  border-left: 4px solid #ecc94b;
  background: linear-gradient(to right, #fffff0, white);
}

.suggestion-card.low {
  border-left: 4px solid #48bb78;
  background: linear-gradient(to right, #f0fff4, white);
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.location-info h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.priority-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
}

.priority-badge.very_high {
  background: #fed7d7;
  color: #c53030;
}

.priority-badge.high {
  background: #feebc8;
  color: #c05621;
}

.priority-badge.medium {
  background: #fefcbf;
  color: #744210;
}

.priority-badge.low {
  background: #c6f6d5;
  color: #22543d;
}

.stats {
  display: flex;
  gap: 1.5rem;
}

.stat {
  text-align: center;
}

.stat .label {
  font-size: 0.75rem;
  color: #718096;
  display: block;
}

.stat .value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a202c;
}

.recommendation {
  padding: 1rem;
  background: #f7fafc;
  border-radius: 10px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.recommendation strong {
  color: #667eea;
}

.top-routes h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.75rem;
}

.routes-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.route-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.route-text {
  font-weight: 600;
  font-size: 0.875rem;
  color: #2d3748;
}

.route-metrics {
  display: flex;
  gap: 0.5rem;
}

.metric-chip {
  padding: 0.25rem 0.5rem;
  background: #edf2f7;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #4a5568;
}

.hotspots-table {
  overflow-x: auto;
}

.hotspots-table table {
  width: 100%;
  border-collapse: collapse;
}

.hotspots-table th {
  background: #f7fafc;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
}

.hotspots-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.location-name {
  font-weight: 600;
  color: #1a202c;
}

.stat-bar {
  position: relative;
  height: 24px;
  background: #f7fafc;
  border-radius: 6px;
  overflow: hidden;
}

.stat-bar .bar {
  height: 100%;
  transition: width 0.6s ease;
}

.stat-bar .bar.pickup {
  background: linear-gradient(90deg, #4299e1, #3182ce);
}

.stat-bar .bar.delivery {
  background: linear-gradient(90deg, #f6ad55, #ed8936);
}

.stat-bar span {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  font-weight: 700;
  font-size: 0.75rem;
  color: white;
}

.total-orders {
  font-weight: 700;
  font-size: 1.125rem;
  color: #1a202c;
}

.category-badge {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.category-badge.pickup_heavy {
  background: #bee3f8;
  color: #2c5282;
}

.category-badge.delivery_heavy {
  background: #feebc8;
  color: #7c2d12;
}

.category-badge.balanced {
  background: #c6f6d5;
  color: #22543d;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  color: #718096;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .analytics-dashboard {
    padding: 1rem;
  }

  .pairs-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group input {
    width: 100%;
  }
}
</style>