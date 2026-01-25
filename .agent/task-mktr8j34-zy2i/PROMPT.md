# Task: TODOアプリのコア機能を実装

## Labels
(none)

## Description

## 概要
シンプルなCLI TODOアプリを実装する。

## 要件
- TODOの追加（タイトル必須）
- TODOの一覧表示
- TODOの完了マーク
- TODOの削除
- データはJSONファイルに永続化

## 技術仕様
- TypeScript + Bun
- `src/todo.ts` - Todoクラス/型定義
- `src/store.ts` - JSONファイルへの永続化
- `src/cli.ts` - CLIインターフェース
- テストも書く

## 完了条件
- `bun test` が全てパス
- `bun run src/cli.ts add "買い物"` でTODO追加できる
- `bun run src/cli.ts list` で一覧表示できる
- `bun run src/cli.ts done 1` で完了マークできる
- `bun run src/cli.ts remove 1` で削除できる

## Instructions

1. Analyze the task requirements
2. Plan the implementation approach
3. Implement the solution step by step
4. Verify with tests
5. When complete, output: LOOP_COMPLETE

## Scratchpad

Use .agent/scratchpad.md to track progress and share context between iterations.

---

**Important**: Output "LOOP_COMPLETE" when the task is fully complete.
