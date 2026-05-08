<!-- src/views/restaurant/components/ProductSearch.vue -->
<template>
  <v-text-field
    v-model="searchText"
    :label="label"
    :placeholder="placeholder"
    variant="outlined"
    density="comfortable"
    prepend-inner-icon="mdi-magnify"
    clearable
    @update:model-value="onSearch"
    class="product-search"
  >
    <template v-slot:append>
      <v-chip v-if="searchText" size="small" color="primary" class="mr-2">
        {{ resultsCount }} resultados
      </v-chip>
    </template>
  </v-text-field>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: 'Buscar producto',
  },
  placeholder: {
    type: String,
    default: 'Nombre del producto...',
  },
  items: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['search', 'results'])

const searchText = ref('')
const results = ref([])

const resultsCount = computed(() => results.value.length)

const onSearch = () => {
  if (!searchText.value) {
    results.value = props.items
    emit('results', results.value)
    emit('search', '')
    return
  }

  const term = searchText.value.toLowerCase()
  results.value = props.items.filter(
    (item) =>
      item.nombre.toLowerCase().includes(term) || item.descripcion?.toLowerCase().includes(term),
  )

  emit('results', results.value)
  emit('search', searchText.value)
}

watch(
  () => props.items,
  () => {
    onSearch()
  },
  { immediate: true },
)
</script>
