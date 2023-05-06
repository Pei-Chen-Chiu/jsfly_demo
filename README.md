# linebot deploy on `fly.io`
>language: `JavaScript`
## 一、本地端部署
1. [安裝 flyctl](https://fly.io/docs/hands-on/install-flyctl/)
    ```powershell!
    iwr https://fly.io/install.ps1 -useb | iex  # Windows
    ```
2. git clone [jsfly_demo](https://github.com/Pei-Chen-Chiu/jsflt_demo)
    ```powershell!
    # 移至欲存放路徑
    cd d:

    git clone https://github.com/Pei-Chen-Chiu/jsfly_demo

    # 移至專案資料夾內
    cd jsfly_demo

    # 打開 vscode
    code .
    ```
    **檔案結構如下:**
    ```powershell!
    jsfly_demo
    ├─ app.js # 主程式
    ├─ .env # token
    ├─ Procfile # Paas 執行 app.js 指令
    └─ package.json # node.js 套件
    ```
3. Deploy
    1. 登入、建置與啟用 fly
        ```powershell!
        flyctl auth login

        flyctl launch
        ```
        ![](https://hackmd.io/_uploads/S17JcMN42.png)
        1. 幫欲部署網址命名 
        `https://<your_app_name>.fly.dev/`
        2.  選擇虛擬機位置
        3.  是否建立資料庫   
        4.  完成會自動生成
            * `Dockerfile`
            * `fly.toml`
            * `dockerignore`
    2. 部署
        ```powershell!
        flyctl deploy
        ```
        ![](https://hackmd.io/_uploads/HykN9GN4h.png)

## 二、 [Github Action](https://fly.io/docs/app-guides/continuous-deployment-with-github-actions/)
更新 Github 即自動部署
1. 取得 fly API token
    ```powershell!
    flyctl auth token
    ```
    token如下:

    `gSeq_dD9rYqMpLaaaaaaaaaaaaNBtyeUbfufp7o`

    將產生後的 token 放在 Setting >> secrets and variables >> actions 內，並將其命名為 `FLY_API_TOKEN`
    ![](https://hackmd.io/_uploads/S1VNy7NV3.png)

2. 建立 yml 檔在 .github 的 workflows 內
    ![](https://hackmd.io/_uploads/Hk7kMXNN2.png)
    ```yaml!
    name: Fly Deploy
    on:
    push:
        branches:
        - main # 分支名稱
    env:
    FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
    jobs:
    deploy:
        name: Deploy app
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: superfly/flyctl-actions/setup-flyctl@master
            - run: flyctl deploy --remote-only
    ```

