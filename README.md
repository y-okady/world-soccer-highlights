# world-soccer-highlights

## ローカル環境での実行
### Webアプリ
```bash
$ npm start --prefix web
```

### 定期実行処理
```bash
$ firebase emulators:start --inspect-functions --only functions
```
```bash
$ GOOGLE_APPLICATION_CREDENTIALS=$(pwd)/serviceAccount.json firebase functions:shell --port=5002
firebase > syncVideos()
```

## デプロイ
```bash
$ firebase deploy
```
