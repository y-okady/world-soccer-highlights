# world-soccer-highlights

## ローカル環境での実行
```bash
$ firebase emulators:start --project=default --inspect-functions --only functions,hosting
```
```bash
$ npm start --prefix web
```

## ステージング環境へのデプロイ
```bash
$ firebase deploy --project=default
```

## 本番環境へのデプロイ
```bash
$ firebase deploy --project=prod
```
