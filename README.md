# my-chinese-dictionary

Duolingoで勉強した中国語の単語と例文をまとめるサイト。

## 単語の追加
`data/words.json` に以下の形式で追記してコミットするだけ。

```json
{
  "hanzi": "你好", "pinyin": "nǐ hǎo", "meaning": "こんにちは", "unit": "基礎1",
  "examples": [{ "zh": "你好。", "pinyin": "Nǐ hǎo.", "ja": "こんにちは。" }]
}
```

## Claudeに追加させる
「「苹果」を追加して。例文もお願い」のように頼むと、`.claude/skills/add-word` のskillに沿って `data/words.json` に追記する。

## ローカル確認
`python3 -m http.server` → http://localhost:8000
