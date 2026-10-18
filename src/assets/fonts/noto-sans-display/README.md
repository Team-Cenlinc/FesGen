# Noto Sans Display（静态实例）

FTA 牌子的西文和数字字体。opentype.js 读不了可变字体的轴，所以从官方可变字体用 fontTools 固定出四个静态实例：

```sh
python3 -m fontTools.varLib.instancer NotoSansDisplay-VariableFont_wdth,wght.ttf wght=500 wdth=100 -o NotoSansDisplay-Medium.ttf
python3 -m fontTools.varLib.instancer NotoSansDisplay-VariableFont_wdth,wght.ttf wght=700 wdth=100 -o NotoSansDisplay-Bold.ttf
python3 -m fontTools.varLib.instancer NotoSansDisplay-VariableFont_wdth,wght.ttf wght=800 wdth=100 -o NotoSansDisplay-ExtraBold.ttf
python3 -m fontTools.varLib.instancer NotoSansDisplay-Italic-VariableFont_wdth,wght.ttf wght=500 wdth=100 -o NotoSansDisplay-MediumItalic.ttf
```

源文件与 Fetarute 官网用的是同一份（官网仓库 `fonts-source/`）。授权为 SIL Open Font License 1.1，见 `OFL.txt`。
