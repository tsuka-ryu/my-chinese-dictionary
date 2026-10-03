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

## ローカル確認
`python3 -m http.server` → http://localhost:8000
