<script setup lang="ts">
import { PhArrowCounterClockwise, PhCheckCircle, PhWarning } from "@phosphor-icons/vue";
import { computed } from "vue";
import GridPicker from "@/components/mapart/GridPicker.vue";
import NumberStepper from "@/components/NumberStepper.vue";
import SegmentedControl from "@/components/SegmentedControl.vue";
import SwitchToggle from "@/components/SwitchToggle.vue";
import type { EditorCheck } from "@/composables/useSignEditor";
import { messages as m } from "@/i18n";
import type { FitMode } from "@/mapart/fit";
import { clampGridSide, MAX_GRID_SIDE, type MapGrid } from "@/mapart/grid";
import { MAX_FREE_SIDE, MIN_FREE_SIDE, signPixelSize } from "@/signs/registry";
import { isIdentityTweak, tweakOf } from "@/signs/render";
import type {
  ConditionalField,
  Lighting,
  MapArtSettings,
  ModuleTweak,
  SignDocument,
  SignSize,
  SignStyle,
} from "@/signs/types";
import { getAtPath } from "@/signs/values";
import FieldControl from "./FieldControl.vue";

/** 属性面板：没选中模块时编辑整块牌子（尺寸、灯光、全局字段、地图画），选中时编辑该模块和它的微调。 */
const props = defineProps<{
  style: SignStyle<unknown>;
  doc: SignDocument;
  selected: string | null;
  checks: readonly EditorCheck[];
}>();
const emit = defineEmits<{
  field: [path: string, value: unknown];
  tweak: [moduleId: string, patch: Partial<ModuleTweak>];
  resetTweak: [moduleId: string];
  action: [actionId: string];
  size: [size: SignSize];
  lighting: [lighting: Lighting];
  mapArt: [patch: Partial<MapArtSettings>];
}>();

const module = computed(
  () => props.style.modules.find((item) => item.id === props.selected) ?? null,
);
const region = computed(() => props.style.regions.find((item) => item.id === module.value?.region));
const tweak = computed(() => (module.value ? tweakOf(props.doc.tweaks, module.value.id) : null));
const moduleChecks = computed(() =>
  props.checks.filter((check) => check.module === props.selected),
);

function visible(field: ConditionalField): boolean {
  return !field.visibleWhen || Boolean(getAtPath(props.doc.content, field.visibleWhen));
}

const sizeModeOptions = [
  { value: "grid", label: m.editor.sizeGrid },
  { value: "free", label: m.editor.sizeFree },
] as const;
const lightingOptions = [
  { value: "none", label: m.editor.lightingNone },
  { value: "fluore", label: m.editor.lightingFluore },
  { value: "led", label: m.editor.lightingLed },
] as const;
const fitOptions = [
  { value: "contain", label: m.mapArt.fit.contain },
  { value: "cover", label: m.mapArt.fit.cover },
  { value: "stretch", label: m.mapArt.fit.stretch },
] as const;

/** 切换尺寸模式时保留视觉大小：地图格换成同样像素的自由尺寸，自由尺寸换成最接近的格子。 */
function setSizeMode(mode: "grid" | "free") {
  if (mode === props.doc.size.mode) return;
  const pixels = signPixelSize(props.doc.size);
  emit(
    "size",
    mode === "free"
      ? { mode: "free", ...pixels }
      : {
          mode: "grid",
          grid: {
            rows: clampGridSide(Math.round(pixels.height / 128)),
            columns: clampGridSide(Math.round(pixels.width / 128)),
          },
        },
  );
}

function setGrid(grid: MapGrid) {
  emit("size", { mode: "grid", grid });
}

function setFree(side: "width" | "height", value: number) {
  if (props.doc.size.mode !== "free") return;
  emit("size", { ...props.doc.size, [side]: value });
}

const freeSize = computed(() => (props.doc.size.mode === "free" ? props.doc.size : null));
const gridSize = computed(() => (props.doc.size.mode === "grid" ? props.doc.size.grid : null));
</script>

<template>
  <div class="properties">
    <!-- —— 选中模块 —— -->
    <template v-if="module && tweak">
      <header class="properties__head">
        <h2 class="properties__title">{{ module.label }}</h2>
        <p class="properties__subtitle">{{ region?.label }}</p>
      </header>

      <section class="properties__group">
        <template v-for="field in module.fields" :key="field.path">
          <FieldControl
            v-if="visible(field)"
            :field="field"
            :value="getAtPath(doc.content, field.path)"
            @update="emit('field', field.path, $event)"
          />
        </template>
        <div v-if="module.actions?.length" class="properties__actions">
          <button
            v-for="action in module.actions"
            :key="action.id"
            type="button"
            class="button button--small"
            @click="emit('action', action.id)"
          >
            {{ action.label }}
          </button>
        </div>
      </section>

      <section class="properties__group">
        <h3 class="properties__group-title">{{ m.editor.tweak }}</h3>
        <div class="tweak-row">
          <span class="field__label">{{ m.editor.tweakX }}</span>
          <NumberStepper
            :model-value="Math.round(tweak.dx)"
            :min="-600"
            :max="600"
            :label="m.editor.tweakX"
            @update:model-value="emit('tweak', module.id, { dx: $event })"
          />
        </div>
        <div class="tweak-row">
          <span class="field__label">{{ m.editor.tweakY }}</span>
          <NumberStepper
            :model-value="Math.round(tweak.dy)"
            :min="-600"
            :max="600"
            :label="m.editor.tweakY"
            @update:model-value="emit('tweak', module.id, { dy: $event })"
          />
        </div>
        <div class="tweak-row">
          <span class="field__label">{{ m.editor.tweakScale }}</span>
          <span class="tweak-row__control">
            <NumberStepper
              :model-value="Math.round(tweak.scale * 100)"
              :min="10"
              :max="400"
              :label="m.editor.tweakScale"
              @update:model-value="emit('tweak', module.id, { scale: $event / 100 })"
            />
            <span class="tweak-row__unit">%</span>
          </span>
        </div>
        <div class="tweak-row">
          <SwitchToggle
            :model-value="!tweak.hidden"
            @update:model-value="emit('tweak', module.id, { hidden: !$event })"
          >
            {{ m.editor.tweakVisible }}
          </SwitchToggle>
        </div>
        <button
          v-if="!isIdentityTweak(tweak)"
          type="button"
          class="button button--small properties__reset"
          @click="emit('resetTweak', module.id)"
        >
          <PhArrowCounterClockwise :size="16" weight="bold" aria-hidden="true" />
          {{ m.editor.tweakReset }}
        </button>
      </section>

      <ul v-if="moduleChecks.length" class="checks">
        <li v-for="check in moduleChecks" :key="check.text" class="checks__item">
          <PhWarning :size="18" weight="bold" aria-hidden="true" />
          {{ check.text }}
        </li>
      </ul>
    </template>

    <!-- —— 整块牌子 —— -->
    <template v-else>
      <header class="properties__head">
        <h2 class="properties__title">{{ m.editor.global }}</h2>
        <p class="properties__subtitle">{{ style.label }}</p>
      </header>

      <section class="properties__group">
        <h3 class="properties__group-title">{{ m.editor.size }}</h3>
        <SegmentedControl
          :model-value="doc.size.mode"
          size="sm"
          :options="sizeModeOptions"
          :label="m.editor.size"
          @update:model-value="setSizeMode"
        />
        <GridPicker v-if="gridSize" :model-value="gridSize" @update:model-value="setGrid" />
        <div v-else-if="freeSize" class="free-size">
          <div class="tweak-row">
            <span class="field__label">{{ m.editor.width }}</span>
            <NumberStepper
              :model-value="freeSize.width"
              :min="MIN_FREE_SIDE"
              :max="MAX_FREE_SIDE"
              :label="m.editor.width"
              @update:model-value="setFree('width', $event)"
            />
          </div>
          <div class="tweak-row">
            <span class="field__label">{{ m.editor.height }}</span>
            <NumberStepper
              :model-value="freeSize.height"
              :min="MIN_FREE_SIDE"
              :max="MAX_FREE_SIDE"
              :label="m.editor.height"
              @update:model-value="setFree('height', $event)"
            />
          </div>
        </div>
      </section>

      <section class="properties__group">
        <h3 class="properties__group-title">{{ m.editor.lighting }}</h3>
        <SegmentedControl
          :model-value="doc.lighting"
          size="sm"
          :options="lightingOptions"
          :label="m.editor.lighting"
          @update:model-value="emit('lighting', $event)"
        />
      </section>

      <section class="properties__group">
        <template v-for="field in style.globalFields" :key="field.path">
          <FieldControl
            v-if="visible(field)"
            :field="field"
            :value="getAtPath(doc.content, field.path)"
            @update="emit('field', field.path, $event)"
          />
        </template>
        <div v-if="style.globalActions.length" class="properties__actions">
          <button
            v-for="action in style.globalActions"
            :key="action.id"
            type="button"
            class="button button--small"
            @click="emit('action', action.id)"
          >
            {{ action.label }}
          </button>
        </div>
      </section>

      <section class="properties__group">
        <h3 class="properties__group-title">{{ m.editor.mapArt }}</h3>
        <template v-if="doc.size.mode === 'free'">
          <div class="tweak-row">
            <span class="field__label">{{ m.editor.mapArtGrid }}</span>
            <span class="tweak-row__control">
              <NumberStepper
                :model-value="doc.mapArt.gridForFree.rows"
                :min="1"
                :max="MAX_GRID_SIDE"
                :label="m.mapArt.grid.rows"
                @update:model-value="
                  emit('mapArt', { gridForFree: { ...doc.mapArt.gridForFree, rows: $event } })
                "
              />
              <span class="tweak-row__unit">×</span>
              <NumberStepper
                :model-value="doc.mapArt.gridForFree.columns"
                :min="1"
                :max="MAX_GRID_SIDE"
                :label="m.mapArt.grid.columns"
                @update:model-value="
                  emit('mapArt', { gridForFree: { ...doc.mapArt.gridForFree, columns: $event } })
                "
              />
            </span>
          </div>
          <div class="tweak-row">
            <span class="field__label">{{ m.editor.mapArtFit }}</span>
            <SegmentedControl
              :model-value="doc.mapArt.fit"
              size="sm"
              :options="fitOptions"
              :label="m.editor.mapArtFit"
              @update:model-value="emit('mapArt', { fit: $event as FitMode })"
            />
          </div>
        </template>
        <SwitchToggle
          :model-value="doc.mapArt.applyLighting"
          @update:model-value="emit('mapArt', { applyLighting: $event })"
        >
          {{ m.editor.mapArtLighting }}
        </SwitchToggle>
        <p class="hint">{{ m.editor.mapArtLightingHint }}</p>
      </section>

      <section class="properties__group">
        <h3 class="properties__group-title">{{ m.editor.checks }}</h3>
        <ul v-if="checks.length" class="checks">
          <li v-for="check in checks" :key="check.text" class="checks__item">
            <PhWarning :size="18" weight="bold" aria-hidden="true" />
            {{ check.text }}
          </li>
        </ul>
        <p v-else class="checks__ok">
          <PhCheckCircle :size="18" weight="bold" aria-hidden="true" />
          {{ m.editor.checksOk }}
        </p>
      </section>
    </template>
  </div>
</template>

<style scoped>
.properties {
  display: grid;
  align-content: start;
  gap: 18px;
}

.properties__head {
  display: grid;
  gap: 2px;
}

.properties__title {
  font-size: 20px;
  font-weight: 790;
  letter-spacing: -0.03em;
}

.properties__subtitle {
  font-size: 13px;
  font-weight: 650;
  color: var(--color-muted);
}

.properties__group {
  display: grid;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.properties__group-title {
  font-size: 14px;
  font-weight: 790;
}

.properties__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.properties__reset {
  justify-self: start;
}

.tweak-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
}

.tweak-row__control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.tweak-row__unit {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-muted);
}

.free-size {
  display: grid;
  gap: 10px;
}

.checks {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.checks__item {
  display: flex;
  gap: 8px;
  padding: 8px 10px;
  border-left: 4px solid var(--color-status-caution);
  background: color-mix(in srgb, var(--color-status-caution) 10%, transparent);
  font-size: 13px;
  font-weight: 650;
  line-height: 1.5;
}

.checks__item svg {
  flex: 0 0 auto;
  margin-top: 1px;
  color: var(--color-status-caution);
}

.checks__ok {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 650;
  color: var(--color-status-ok);
}
</style>
