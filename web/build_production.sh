#!/bin/bash
# # # コンパイル
mv src/config/default.ts src/config/default.ts_bk
mv src/config/default_production.ts src/config/default.ts

npm run build

mv src/config/default.ts src/config/default_production.ts
mv src/config/default.ts_bk src/config/default.ts
