<template>
  <Teleport to="body">
    <Transition name="admin-modal">
      <div
        v-if="open"
        class="fixed inset-0 z-[280] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-modal-title"
      >
        <div class="absolute inset-0 bg-black/80" aria-hidden="true" @click="emit('close')" />
        <div class="relative w-full max-w-3xl border border-white/20 bg-zinc-950 p-4 sm:p-6 shadow-2xl">
          <h2 id="crop-modal-title" class="font-headline text-lg font-semibold text-white mb-1">
            {{ presetConfig.title }}
          </h2>
          <p class="text-white/60 text-sm mb-4">
            {{ presetConfig.description }}
          </p>

          <div
            ref="viewportRef"
            class="crop-viewport relative mx-auto w-full max-w-xl overflow-hidden border border-white/15 select-none touch-none"
            :class="{ 'crop-viewport--filled': isCoverFill }"
            :style="{ aspectRatio: `${presetConfig.aspectW} / ${presetConfig.aspectH}` }"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
            @pointerleave="onPointerUp"
            @wheel.prevent="onWheel"
          >
            <canvas ref="canvasRef" class="absolute inset-0 w-full h-full" />
          </div>

          <label class="block mt-4 text-sm text-white/80">
            Zoom
            <input
              v-model.number="scale"
              type="range"
              :min="scaleMin"
              :max="scaleMax"
              step="0.01"
              class="mt-2 w-full accent-white"
              @input="draw"
            >
          </label>

          <div class="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              class="font-headline px-5 py-2.5 border text-sm transition-colors"
              :class="isCenteredHorizontal
                ? 'border-white/15 text-white/35 cursor-not-allowed'
                : 'border-white/30 text-white/90 hover:border-white/50 hover:bg-white/5'"
              :disabled="!imageReady || isCenteredHorizontal"
              @click="centerHorizontal"
            >
              Horizontal zentrieren
            </button>
            <button
              type="button"
              class="font-headline px-5 py-2.5 border text-sm transition-colors"
              :class="isCenteredVertical
                ? 'border-white/15 text-white/35 cursor-not-allowed'
                : 'border-white/30 text-white/90 hover:border-white/50 hover:bg-white/5'"
              :disabled="!imageReady || isCenteredVertical"
              @click="centerVertical"
            >
              Vertikal zentrieren
            </button>
          </div>

          <div class="flex flex-wrap gap-3 justify-end mt-6">
            <button
              type="button"
              class="font-headline px-5 py-2.5 border border-white/30 text-sm text-white/90"
              @click="emit('close')"
            >
              Abbrechen
            </button>
            <button
              type="button"
              class="font-headline px-5 py-2.5 bg-white text-black font-semibold text-sm disabled:opacity-50"
              :disabled="!imageReady || exporting"
              @click="confirmCrop"
            >
              {{ exporting ? 'Export …' : 'Übernehmen' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
export type ImageCropPreset = 'referenz' | 'ugc'

const CROP_PRESETS = {
  referenz: {
    aspectW: 3,
    aspectH: 1,
    outputW: 600,
    outputH: 200,
    coverFill: false,
    title: 'Logo zuschneiden',
    description: 'Ausgabe 3:1 (600×200). Bild verschieben, rein- und rauszoomen — freie Fläche bleibt transparent.'
  },
  ugc: {
    aspectW: 4,
    aspectH: 3,
    outputW: 800,
    outputH: 600,
    coverFill: true,
    title: 'Foto zuschneiden',
    description: 'Ausgabe 4:3 (800×600). Bild verschieben und reinzoomen — die Breite bleibt immer vollständig gefüllt.'
  }
} as const satisfies Record<ImageCropPreset, {
  aspectW: number
  aspectH: number
  outputW: number
  outputH: number
  coverFill: boolean
  title: string
  description: string
}>

const props = withDefaults(
  defineProps<{
    open: boolean
    file: File | null
    sourceUrl?: string | null
    preset?: ImageCropPreset
  }>(),
  { preset: 'referenz', sourceUrl: null }
)

const emit = defineEmits<{
  close: []
  cropped: [blob: Blob]
  loadError: []
}>()

const presetConfig = computed(() => CROP_PRESETS[props.preset])
const isCoverFill = computed(() => presetConfig.value.coverFill)
const outputW = computed(() => presetConfig.value.outputW)
const outputH = computed(() => presetConfig.value.outputH)

const viewportRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const image = ref<HTMLImageElement | null>(null)
const imageReady = ref(false)
const exporting = ref(false)
const scale = ref(1)
const scaleMin = ref(0.05)
const scaleMax = ref(4)
const offsetX = ref(0)
const offsetY = ref(0)
const dragging = ref(false)
let dragStartX = 0
let dragStartY = 0
let offsetStartX = 0
let offsetStartY = 0

const CENTER_EPS = 0.5

const isCenteredHorizontal = computed(() => Math.abs(offsetX.value) < CENTER_EPS)
const isCenteredVertical = computed(() => Math.abs(offsetY.value) < CENTER_EPS)

function centerHorizontal() {
  offsetX.value = 0
  draw()
}

function centerVertical() {
  offsetY.value = 0
  draw()
}

function fitScaleForViewport(img: HTMLImageElement, vw: number, vh: number): number {
  const ow = outputW.value
  const oh = outputH.value
  if (!vw || !vh) {
    return Math.min(ow / img.naturalWidth, oh / img.naturalHeight)
  }
  return Math.min(vw / img.naturalWidth, vh / img.naturalHeight)
}

function coverScaleForOutput(img: HTMLImageElement): number {
  return Math.max(outputW.value / img.naturalWidth, outputH.value / img.naturalHeight)
}

function coverScaleForViewport(img: HTMLImageElement, vw: number, vh: number): number {
  if (!vw || !vh) return coverScaleForOutput(img)
  return Math.max(vw / img.naturalWidth, vh / img.naturalHeight)
}

function updateScaleLimits(img: HTMLImageElement) {
  const vp = viewportRef.value
  const vw = vp?.clientWidth ?? outputW.value
  const vh = vp?.clientHeight ?? outputH.value
  const fit = fitScaleForViewport(img, vw, vh)
  const coverVp = coverScaleForViewport(img, vw, vh)
  const coverOut = coverScaleForOutput(img)

  if (isCoverFill.value) {
    scaleMin.value = coverVp
    scaleMax.value = Math.max(coverVp * 3, coverOut * 3, 0.2)
  } else {
    scaleMin.value = Math.min(fit * 0.15, fit * 0.5)
    scaleMax.value = Math.max(coverOut * 3, fit * 4, 0.2)
  }
}

function clampOffset() {
  if (!isCoverFill.value) return
  const vp = viewportRef.value
  const img = image.value
  if (!vp || !img) return

  const vw = vp.clientWidth
  const vh = vp.clientHeight
  const drawW = img.naturalWidth * scale.value
  const drawH = img.naturalHeight * scale.value

  // Bildposition: (vw - drawW) / 2 + offset — Grenzen auf offsetX/Y, nicht auf Pixel x/y
  const maxOffsetX = Math.max(0, (drawW - vw) / 2)
  const maxOffsetY = Math.max(0, (drawH - vh) / 2)
  offsetX.value = Math.min(maxOffsetX, Math.max(-maxOffsetX, offsetX.value))
  offsetY.value = Math.min(maxOffsetY, Math.max(-maxOffsetY, offsetY.value))
}

function applyScale(value: number) {
  scale.value = Math.min(scaleMax.value, Math.max(scaleMin.value, value))
  clampOffset()
}

function setupLoadedImage(img: HTMLImageElement) {
  image.value = img
  offsetX.value = 0
  offsetY.value = 0
  imageReady.value = true
  nextTick(() => {
    const vp = viewportRef.value
    const vw = vp?.clientWidth ?? outputW.value
    const vh = vp?.clientHeight ?? outputH.value
    updateScaleLimits(img)
    const initial = isCoverFill.value
      ? coverScaleForViewport(img, vw, vh)
      : fitScaleForViewport(img, vw, vh)
    applyScale(initial)
    draw()
  })
}

function onImageLoadFailed() {
  image.value = null
  imageReady.value = false
  emit('loadError')
  emit('close')
}

function loadFile(file: File) {
  imageReady.value = false
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    URL.revokeObjectURL(url)
    setupLoadedImage(img)
  }
  img.onerror = () => {
    URL.revokeObjectURL(url)
    onImageLoadFailed()
  }
  img.src = url
}

function loadFromUrl(url: string) {
  imageReady.value = false
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => setupLoadedImage(img)
  img.onerror = () => onImageLoadFailed()
  img.src = url
}

function loadSource() {
  if (props.file) {
    loadFile(props.file)
    return
  }
  if (props.sourceUrl) {
    loadFromUrl(props.sourceUrl)
  }
}

function draw() {
  const canvas = canvasRef.value
  const vp = viewportRef.value
  const img = image.value
  if (!canvas || !vp || !img) return

  const vw = vp.clientWidth
  const vh = vp.clientHeight
  if (!vw || !vh) return

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  canvas.width = Math.round(vw * dpr)
  canvas.height = Math.round(vh * dpr)
  canvas.style.width = `${vw}px`
  canvas.style.height = `${vh}px`

  const ctx = canvas.getContext('2d', { alpha: !isCoverFill.value })
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  if (isCoverFill.value) {
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, vw, vh)
  } else {
    ctx.clearRect(0, 0, vw, vh)
  }

  const drawW = img.naturalWidth * scale.value
  const drawH = img.naturalHeight * scale.value
  const x = (vw - drawW) / 2 + offsetX.value
  const y = (vh - drawH) / 2 + offsetY.value
  ctx.drawImage(img, x, y, drawW, drawH)
}

function onPointerDown(e: PointerEvent) {
  if (!imageReady.value) return
  dragging.value = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  offsetStartX = offsetX.value
  offsetStartY = offsetY.value
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  offsetX.value = offsetStartX + (e.clientX - dragStartX)
  offsetY.value = offsetStartY + (e.clientY - dragStartY)
  clampOffset()
  draw()
}

function onPointerUp(e: PointerEvent) {
  if (!dragging.value) return
  dragging.value = false
  try {
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  } catch {}
}

function onWheel(e: WheelEvent) {
  if (!imageReady.value) return
  const delta = e.deltaY > 0 ? -0.04 : 0.04
  applyScale(scale.value * (1 + delta))
  draw()
}

async function confirmCrop() {
  const img = image.value
  const vp = viewportRef.value
  if (!img || !vp || exporting.value) return

  exporting.value = true
  try {
    const vw = vp.clientWidth
    const vh = vp.clientHeight
    const ow = outputW.value
    const oh = outputH.value
    const out = document.createElement('canvas')
    out.width = ow
    out.height = oh
    const ctx = out.getContext('2d', { alpha: !isCoverFill.value })
    if (!ctx) return

    if (isCoverFill.value) {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, ow, oh)
    } else {
      ctx.clearRect(0, 0, ow, oh)
    }

    const drawW = img.naturalWidth * scale.value
    const drawH = img.naturalHeight * scale.value
    const x = (vw - drawW) / 2 + offsetX.value
    const y = (vh - drawH) / 2 + offsetY.value
    const ratioX = ow / vw
    const ratioY = oh / vh

    ctx.drawImage(
      img,
      x * ratioX,
      y * ratioY,
      drawW * ratioX,
      drawH * ratioY
    )

    const mime = isCoverFill.value ? 'image/jpeg' : 'image/png'
    const blob = await new Promise<Blob | null>((resolve) => {
      out.toBlob((b) => resolve(b), mime, isCoverFill.value ? 0.92 : undefined)
    })
    if (!blob) {
      throw new Error('Export fehlgeschlagen')
    }
    emit('cropped', blob)
  } finally {
    exporting.value = false
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) return
    if (isOpen && (props.file || props.sourceUrl)) {
      loadSource()
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    } else {
      image.value = null
      imageReady.value = false
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }
)

watch(
  () => [props.file, props.sourceUrl] as const,
  () => {
    if (!import.meta.client || !props.open) return
    if (props.file || props.sourceUrl) loadSource()
  }
)

watch(scale, () => {
  clampOffset()
  draw()
})

onMounted(() => {
  if (props.open && (props.file || props.sourceUrl)) loadSource()
  if (import.meta.client) {
    window.addEventListener('resize', onResize)
  }
})

function onResize() {
  const img = image.value
  if (!img) return
  updateScaleLimits(img)
  applyScale(scale.value)
  draw()
}

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('resize', onResize)
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.crop-viewport {
  background-color: #27272a;
  background-image:
    linear-gradient(45deg, #3f3f46 25%, transparent 25%),
    linear-gradient(-45deg, #3f3f46 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #3f3f46 75%),
    linear-gradient(-45deg, transparent 75%, #3f3f46 75%);
  background-size: 16px 16px;
  background-position:
    0 0,
    0 8px,
    8px -8px,
    -8px 0;
}

.crop-viewport--filled {
  background-color: #000000;
  background-image: none;
}

.admin-modal-enter-active,
.admin-modal-leave-active {
  transition: opacity 0.2s ease;
}
.admin-modal-enter-from,
.admin-modal-leave-to {
  opacity: 0;
}
</style>
