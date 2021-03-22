<template>
  <div class="sis-grid-css" @mousemove="handleEdgeScroll">
    <div :style="stubHeadBox" class="sis-grid-css__stub-head">
      <slot name="stub-head" :scroll-ref="$refs.scroll" />
      <div
        v-if="sideResizeable"
        class="sis-grid-css__side-resize"
        draggable="false"
        @mousedown="sideResizeStartHandler"
        @touchstart="sideResizeStartHandler"
      />
    </div>
    <div
      ref="scroll"
      v-dragscroll
      class="sis-grid-css__scroll"
      @scroll="setScrolls"
    >
      <div :style="headBox" class="sis-grid-css__head">
        <slot name="head" />
      </div>
      <div :style="sideBox" class="sis-grid-css__side">
        <slot name="side" />
        <div
          v-if="sideResizeable"
          class="sis-grid-css__side-resize"
          draggable="false"
          @mousedown="sideResizeStartHandler"
          @touchstart="sideResizeStartHandler"
        />
      </div>
      <div
        :style="bodyBox"
        class="sis-grid-css__body"
      >
        <slot name="body" />
      </div>
    </div>
    <slot name="default" />
  </div>
</template>

<script>
import {addCssSuffix} from '@/utils/string'

export default {
  props: {
    headSize: {
      type: Number,
      default: 0
    },
    sideSize: {
      type: Number,
      default: 0
    },
    sideSizeMin: {
      type: Number,
      default: 100
    },
    sideSizeMax: {
      type: Number,
      default: 600
    },
    headWidth: {
      type: Number,
      default: null
    },
    sideHeight: {
      type: Number,
      default: null
    },
    xScroll: {
      type: Number,
      default: undefined
    },
    yScroll: {
      type: Number,
      default: undefined
    },
    syncPropDirection: {
      type: String,
      default: 'inner->value'
    },
    edgeScrollEnabled: {
      type: Boolean,
      default: undefined
    },
    edgeSize: {
      type: Number,
      default: 100
    },
    edgeScrollSpeed: {
      type: Number,
      default: 50
    },
    sideResizeable: {
      type: Boolean,
      default: false
    },
    fillHeight: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      syncScrollDirection: null,
      xScrollInner: 0,
      yScrollInner: 0,
      edgeScrollBox: null,
      sideResizing: {enabled: false}
    }
  },
  computed: {
    stubHeadBox () {
      return addCssSuffix({
        height: this.headSize,
        width: this.sideSize
      })
    },
    headBox () {
      return addCssSuffix({
        height: this.headSize,
        width: this.headWidth,
        marginLeft: this.sideSize
      })
    },
    sideBox () {
      return addCssSuffix({
        height: this.sideHeight,
        width: this.sideSize,
        minHeight: this.fillHeight ? `calc(100% - ${addCssSuffix(this.headSize)})` : 0
      })
    },
    bodyBox () {
      return addCssSuffix({
        top: this.headSize,
        left: this.sideSize,
        minHeight: this.fillHeight ? `calc(100% - ${addCssSuffix(this.headSize)})` : 0
      })
    }
  },
  watch: {
    xScroll: {
      immediate: true,
      handler (value) {
        if (this.syncPropDirection === 'inner->value') { return false }
        this.xScrollInner = value
        if (this.$refs.scroll) {
          this.$refs.scroll.scrollLeft = value
        }
      }
    },
    yScroll: {
      immediate: true,
      handler (value) {
        if (this.syncPropDirection === 'inner->value') { return false }
        this.yScrollInner = value
        if (this.$refs.scroll) {
          this.$refs.scroll.scrollTop = value
        }
      }
    },
    xScrollInner: {
      immediate: true,
      handler (value) {
        if (this.syncPropDirection === 'value->inner') { return false }
        this.$emit('update:x-scroll', value)
      }
    },
    yScrollInner: {
      immediate: true,
      handler (value) {
        if (this.syncPropDirection === 'value->inner') { return false }
        this.$emit('update:y-scroll', value)
      }
    },
    edgeScrollEnabled (value) {
      if (value && this.$refs.scroll) {
        const rect = this.$refs.scroll.getBoundingClientRect()
        this.edgeScrollBox = {
          top: rect.top + this.headSize,
          left: rect.left + this.sideSize,
          width: rect.width - this.sideSize,
          height: rect.height - this.sideSize
        }
      } else {
        this.edgeScrollBox = null
      }
    }
  },
  mounted () {
    window.addEventListener('mouseup', this.sideResizeStopHandler)
    window.addEventListener('mousemove', this.sideResizeHandler)
    window.addEventListener('touchend', this.sideResizeStopHandler)
    window.addEventListener('touchmove', this.sideResizeHandler)
  },
  beforeDestroy () {
    window.removeEventListener('mouseup', this.sideResizeStopHandler)
    window.removeEventListener('mousemove', this.sideResizeHandler)
    window.removeEventListener('touchend', this.sideResizeStopHandler)
    window.removeEventListener('touchmove', this.sideResizeHandler)
  },
  methods: {
    setScrolls () {
      if (this.$refs.scroll) {
        this.xScrollInner = this.$refs.scroll.scrollLeft
        this.yScrollInner = this.$refs.scroll.scrollTop
      }
    },
    handleEdgeScroll () {
      if (!this.edgeScrollEnabled || !this.edgeScrollBox) {
        return false
      }
      const coords = {
        x: event.pageX - this.edgeScrollBox.left,
        y: event.pageY - this.edgeScrollBox.top
      }
      const isInLeftEdge = (coords.x > 0 && coords.x < this.edgeSize)
      const isInRightEdge = (coords.x < this.edgeScrollBox.width && coords.x > this.edgeScrollBox.width - this.edgeSize)
      const isInTopEdge = (coords.y > 0 && coords.y < this.edgeSize)
      const isInBottomEdge = (coords.y < this.edgeScrollBox.height && coords.y > this.edgeScrollBox.height - this.edgeSize)
      if (!isInLeftEdge && !isInRightEdge && !isInTopEdge && !isInBottomEdge) {
        this._edgeTimeout && clearTimeout(this._edgeTimeout)
        return false
      }
      const bodyWidth = this.$refs.scroll.scrollWidth
      const bodyHeight = this.$refs.scroll.scrollHeight
      const maxScrollX = (bodyWidth - this.edgeScrollBox.width)
      const maxScrollY = (bodyHeight - this.edgeScrollBox.height)
      const adjustScroll = () => {
        const canScrollLeft = this.xScrollInner > 0
        const canScrollRight = this.xScrollInner < maxScrollX
        const canScrollUp = this.yScrollInner > 0
        const canScrollDown = this.yScrollInner < maxScrollY
        let nextX = this.xScrollInner
        let nextY = this.yScrollInner
        if (isInLeftEdge && canScrollLeft) {
          nextX -= this.edgeScrollSpeed * (this.edgeSize - coords.x) / this.edgeSize
        }
        if (isInRightEdge && canScrollRight) {
          nextX += this.edgeScrollSpeed * (this.edgeSize - this.edgeScrollBox.width + coords.x) / this.edgeSize
        }
        if (isInTopEdge && canScrollUp) {
          nextY -= this.edgeScrollSpeed * (this.edgeSize - coords.y) / this.edgeSize
        }
        if (isInBottomEdge && canScrollDown) {
          nextY += this.edgeScrollSpeed * (this.edgeSize - this.edgeScrollBox.height + coords.y) / this.edgeSize
        }
        nextX = Math.max(0, Math.min(maxScrollX, nextX))
        nextY = Math.max(0, Math.min(maxScrollY, nextY))
        if (nextX !== this.xScrollInner || nextY !== this.yScrollInner) {
          this.xScrollInner = nextX
          this.yScrollInner = nextY
          this.$refs.scroll.scrollLeft = nextX
          this.$refs.scroll.scrollTop = nextY
          return true
        } else {
          return false
        }
      }
      const run = () => {
        this._edgeTimeout && clearTimeout(this._edgeTimeout)
        if (adjustScroll()) {
          this._edgeTimeout = setTimeout(run, 30)
        }
      }
      run()
    },
    getEventCoords (e) {
      if (e.changedTouches && e.changedTouches.length > 0) {
        e = e.changedTouches[0]
      } else if (e.touches && e.touches.length > 0) {
        e = e.touches[0]
      }
      return {pageX: e.pageX, pageY: e.pageY}
    },
    sideResizeStartHandler (event) {
      if (!this.sideResizeable) {
        return false
      }
      this.sideResizing = {
        enabled: true,
        startCoords: this.getEventCoords(event),
        startSideSize: this.sideSize
      }
    },
    sideResizeHandler (event) {
      if (!this.sideResizeable || !this.sideResizing.enabled) {
        return false
      }
      const coords = this.getEventCoords(event)
      const offset = coords.pageX - this.sideResizing.startCoords.pageX
      const newSideSize = Math.max(this.sideSizeMin, Math.min(this.sideSizeMax, this.sideResizing.startSideSize + offset))
      if (newSideSize !== this.sideSize) {
        this.$emit('update:side-size', newSideSize)
      }
    },
    sideResizeStopHandler () {
      if (!this.sideResizeable || !this.sideResizing) {
        return false
      }
      this.sideResizing = {enabled: false}
    }
  }
}
</script>
