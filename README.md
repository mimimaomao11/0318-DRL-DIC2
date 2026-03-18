# Grid World Value Iteration Web App 

這是一個基於 Flask 與強化學習 (Reinforcement Learning) 演算法構建的「格子世界 (Grid World)」Web 應用程式。本專案展示了**價值迭代 (Value Iteration)** 演算法如何幫助智能體 (Agent) 在帶有障礙物的環境中找到抵達目標的最佳策略 (Optimal Policy) 與各狀態的價值 (State Values)。

## 🚀 快速開始

demo site:https://0-three-pied.vercel.app/

## 🌟 專案特色

* **互動式網頁介面**：使用者可以在前端動態調整網格環境，並且即時看到價值迭代的收斂結果。
* **自訂環境參數**：支援自訂網格長寬、起點、終點 (目標點)，以及新增或移除障礙物。
* **價值矩陣與策略矩陣展示**：以視覺化的方式，並排呈現：
  * **價值矩陣 (Value Matrix)**: 顯示每個狀態 (State) 收斂後的最大預期回報 (數值計算至小數點)。
  * **策略矩陣 (Policy Matrix)**: 顯示在每個狀態下應採取的最優動作 (Up, Down, Left, Right)。遇到多重最佳解時，根據優先級 (Up > Down > Left > Right) 進行決策。
* **特殊狀態視覺化**：直觀顯示目標點 (G)、起點標示，以及使用灰色區塊標記障礙物，並同步兩個矩陣的色彩表示。

## 💡 強化學習環境設定 (`rl_env.py`)

* **動作 (Actions)**: 上 (Up)、下 (Down)、左 (Left)、右 (Right)
* **獎勵機制 (Rewards)**:
  * 抵達目標狀態 (Goal Reward): `+1.0`
  * 移動步數懲罰 (Step Penalty): `-0.1` 
  * 碰到邊界或障礙物預設會彈回 (Bounce back)。
* **折扣因子 (Gamma)**: `0.9`
* **收斂條件 (Tolerance)**: `1e-4` (前後迭代價值最大差值小於此值即視為收斂)

## 📁 專案架構

```
DIC2/
├── app.py              # Flask 後端應用程式入口，提供 API 端點 (如 /api/solve) 計算結果
├── rl_env.py           # 負責運行 Grid World 環境與 Value Iteration 演算法核心邏輯
├── requirements.txt    # 系統及套件依賴檔案 (Flask, Werkzeug)
├── static/
│   ├── script.js       # 前端 AJAX 請求邏輯、DOM 動態更新與視覺化渲染
│   └── style.css       # 網頁樣式排版設計
└── templates/
    └── index.html      # 應用程式主頁面結構
```

## 🛠️ 技術棧

* **後端**: Python 3, Flask
* **前端**: HTML5, Vanilla CSS3, Vanilla JavaScript (Fetch API)
* **演算法**: Reinforcement Learning - Value Iteration
