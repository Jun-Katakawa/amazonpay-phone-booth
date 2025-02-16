#!/bin/bash
rm -rf dist
rm -rf build
mkdir dist
mkdir build

# # # コンパイル
tsc

# # # 依存関係のインストール
npm install --production
cp -r node_modules dist
cp -r config dist

# Zipファイルを作成
cd ./dist
"C:\Program Files\7-Zip\7z.exe" a -x!driver.js -x!local_server.js "..\build\lambda.zip" "*"

cd ../build
# AWS Lambdaへのアップロード
aws lambda update-function-code \
  --function-name AmazonPayPhoneBoothAPI \
  --zip-file fileb://lambda.zip \
  --publish

npm install