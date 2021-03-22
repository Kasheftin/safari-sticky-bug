<template>
  <ScrollableGrid
    :head-size="headSize"
    :side-size="sideSize"
    :head-width="containerWidth"
    :fill-height="fillHeight"
  >
    <template #stub-head>
      <div class="pa-3">
        <v-btn class="mb-1" @click="addItem">
          Add Item
        </v-btn>
        <v-btn @click="fillHeight = !fillHeight">
          {{ fillHeight ? 'Turn Off Fill Height' : 'Turn On Fill Height' }}
        </v-btn>
      </div>
    </template>
    <template #head>
      <div class="ssb-head" />
    </template>
    <template #side>
      <div class="ssb-side">
        <div class="ssb-side-header">
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn v-on="on">
                Show Tooltip
              </v-btn>
            </template>
            <span>
              Tooltip Text
            </span>
          </v-tooltip>
        </div>
      </div>
    </template>
    <template #body>
      <div class="ssb-rows">
        <div 
          v-for="item in items"
          :key="item.id"
          :style="rowStyle"
          class="ssb-row"
        >
          <div :style="getItemStyle(item)" class="ssb-item">
            <div class="pa-3">
              <v-card>
                <v-card-actions>
                  <v-btn icon @click="item.n = Math.max(0, item.n - 1)">
                    <v-icon>mdi-minus</v-icon>
                  </v-btn>
                  <v-btn icon @click="item.n++">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                  <v-btn icon @click="item.columns = Math.max(1, item.columns - 1)">
                    <v-icon>mdi-arrow-left</v-icon>
                  </v-btn>
                  <v-btn icon @click="item.columns++">
                    <v-icon>mdi-arrow-right</v-icon>
                  </v-btn>
                  <v-btn icon @click="deleteItem(item)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-card-actions>
                <v-card-text>
                  {{ getItemText(item) }}
                </v-card-text>
              </v-card>
            </div>
          </div>
        </div>
      </div>    
    </template>
  </ScrollableGrid>
</template>

<script>
import ScrollableGrid from '@/components/ScrollableGrid'
import { addCssSuffix } from '@/utils/string' 

export default {
  components: {
    ScrollableGrid
  },
  data () {
    return {
      headSize: 100,
      sideSize: 300,
      items: [],
      cellWidth: 250,
      columnsCount: 100,
      testContent: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      fillHeight: false
    }
  },
  computed: {
    containerWidth () {
      return this.cellWidth * this.columnsCount
    },
    rowStyle () {
      return addCssSuffix({
        width: this.containerWidth 
      })
    }
  },
  methods: {
    addItem () {
      this.items.push({
        id: this.items.reduce((max, item) => Math.max(max, item.id), 0) + 1,
        columnIndex: 0,
        columns: 1,
        n: 1
      })
    },
    getItemStyle (item) {
      return addCssSuffix({
        left: item.columnIndex * this.cellWidth,
        width: item.columns * this.cellWidth
      })
    },
    getItemText (item) {
      return Array(item.n).fill(this.testContent).join(' ')
    },
    deleteItem (item) {
      this.items = this.items.filter(({ id }) => id !== item.id)
    }
  }
}
</script>