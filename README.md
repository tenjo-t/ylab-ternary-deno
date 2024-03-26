# 三角相図

三角相図をプロットするやつです。JavaScriptファイルで設定を書いて、SVGファイルが書き出されます。

## 準備

[Deno](https://deno.com/)をインストールしましょう。DenoはJavaScriptをブラウザ以外でも実行できるようにしたランタイムです。

## 使い方

プロットする点やグラフの設定を書いたJavaScriptファイルを用意します。書き方は[example.js](./example.js)を参考にしてください。

JavaScriptファイルが準備出来たら、ターミナルで`plot.js`、`deno.json`があるディレクトリに移動して下のコマンドを実行するとJavaScriptファイルと同じディレクトリに同じファイル名で拡張子が`.svg`のファイルが出来ています。

```shell
deno task plot <filepath>
```
