import notoSansJpBoldUrl from "@expo-google-fonts/noto-sans-jp/700Bold/NotoSansJP_700Bold.ttf?url";
import notoSansJpRegularUrl from "@expo-google-fonts/noto-sans-jp/400Regular/NotoSansJP_400Regular.ttf?url";
import notoSansScBoldUrl from "@expo-google-fonts/noto-sans-sc/700Bold/NotoSansSC_700Bold.ttf?url";
import notoSansScExtraBoldUrl from "@expo-google-fonts/noto-sans-sc/800ExtraBold/NotoSansSC_800ExtraBold.ttf?url";
import notoSansScRegularUrl from "@expo-google-fonts/noto-sans-sc/400Regular/NotoSansSC_400Regular.ttf?url";
import notoSansTcBoldUrl from "@expo-google-fonts/noto-sans-tc/700Bold/NotoSansTC_700Bold.ttf?url";
import notoSansTcRegularUrl from "@expo-google-fonts/noto-sans-tc/400Regular/NotoSansTC_400Regular.ttf?url";
import notoSansDisplayBoldUrl from "@/assets/fonts/noto-sans-display/NotoSansDisplay-Bold.ttf?url";
import notoSansDisplayExtraBoldUrl from "@/assets/fonts/noto-sans-display/NotoSansDisplay-ExtraBold.ttf?url";
import notoSansDisplayMediumUrl from "@/assets/fonts/noto-sans-display/NotoSansDisplay-Medium.ttf?url";
import notoSansDisplayMediumItalicUrl from "@/assets/fonts/noto-sans-display/NotoSansDisplay-MediumItalic.ttf?url";
import texGyreHerosBoldUrl from "@/assets/fonts/tex-gyre-heros/texgyreheros-bold.otf?url";
import texGyreHerosRegularUrl from "@/assets/fonts/tex-gyre-heros/texgyreheros-regular.otf?url";
import type { FontId } from "./stacks";

export type { FontId } from "./stacks";

/**
 * 牌子用的字体文件。牌子上的文字都按字形转成矢量路径，导出的 SVG、PNG 和地图画因此不依赖本机字体；
 * 字体文件和网站同源托管，只在用户确认后才下载（见 FontDependencyDialog）。
 */
export interface FontAsset {
  id: FontId;
  /** 给用户看的名字，例如“Noto Sans JP 常规”。 */
  label: string;
  url: string;
  /** 下载前提示用的大小；以实际下载为准。 */
  approxBytes: number;
  license: string;
}

const OFL = "SIL OFL 1.1";

export const FONT_CATALOG: Readonly<Record<FontId, FontAsset>> = {
  "noto-sans-jp-400": {
    id: "noto-sans-jp-400",
    label: "Noto Sans JP 常规",
    url: notoSansJpRegularUrl,
    approxBytes: 5_731_428,
    license: OFL,
  },
  "noto-sans-jp-700": {
    id: "noto-sans-jp-700",
    label: "Noto Sans JP 粗体",
    url: notoSansJpBoldUrl,
    approxBytes: 5_726_432,
    license: OFL,
  },
  "noto-sans-sc-400": {
    id: "noto-sans-sc-400",
    label: "Noto Sans SC 常规（简体中文）",
    url: notoSansScRegularUrl,
    approxBytes: 10_559_284,
    license: OFL,
  },
  "noto-sans-sc-700": {
    id: "noto-sans-sc-700",
    label: "Noto Sans SC 粗体（简体中文）",
    url: notoSansScBoldUrl,
    approxBytes: 10_549_020,
    license: OFL,
  },
  "noto-sans-sc-800": {
    id: "noto-sans-sc-800",
    label: "Noto Sans SC 特粗（简体中文）",
    url: notoSansScExtraBoldUrl,
    approxBytes: 10_544_016,
    license: OFL,
  },
  "noto-sans-tc-400": {
    id: "noto-sans-tc-400",
    label: "Noto Sans TC 常规（繁体中文）",
    url: notoSansTcRegularUrl,
    approxBytes: 7_109_460,
    license: OFL,
  },
  "noto-sans-tc-700": {
    id: "noto-sans-tc-700",
    label: "Noto Sans TC 粗体（繁体中文）",
    url: notoSansTcBoldUrl,
    approxBytes: 7_104_212,
    license: OFL,
  },
  "tex-gyre-heros-400": {
    id: "tex-gyre-heros-400",
    label: "TeX Gyre Heros 常规",
    url: texGyreHerosRegularUrl,
    approxBytes: 133_600,
    license: "GUST Font License",
  },
  "tex-gyre-heros-700": {
    id: "tex-gyre-heros-700",
    label: "TeX Gyre Heros 粗体",
    url: texGyreHerosBoldUrl,
    approxBytes: 135_204,
    license: "GUST Font License",
  },
  "noto-sans-display-500": {
    id: "noto-sans-display-500",
    label: "Noto Sans Display 中等",
    url: notoSansDisplayMediumUrl,
    approxBytes: 356_756,
    license: OFL,
  },
  "noto-sans-display-500-italic": {
    id: "noto-sans-display-500-italic",
    label: "Noto Sans Display 中等斜体",
    url: notoSansDisplayMediumItalicUrl,
    approxBytes: 383_820,
    license: OFL,
  },
  "noto-sans-display-700": {
    id: "noto-sans-display-700",
    label: "Noto Sans Display 粗体",
    url: notoSansDisplayBoldUrl,
    approxBytes: 356_644,
    license: OFL,
  },
  "noto-sans-display-800": {
    id: "noto-sans-display-800",
    label: "Noto Sans Display 特粗",
    url: notoSansDisplayExtraBoldUrl,
    approxBytes: 357_296,
    license: OFL,
  },
};

/** 把字节数写成“5.5 MB”这样的提示文字。 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
