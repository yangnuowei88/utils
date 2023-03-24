##  js 基础工具库

### 用法

```sh
npm i geoonlineutil
```

or

```sh
yarn  geoonlineutil
```

#### 导入项目

```js
import utils from 'geoonlineutil';

console.log( utils.reverseString('abc'));
```

## 核心脚本命令

| Command            | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `npm run jsDoc`    | 根据代码注释生成文档（即便代码有误，因为只扫描代码注释） |
| `npm run test:all` | 完整测试                                                 |
| `npm run test:dev` | 开发单测 按 o 进入 o 模式：只运行与更改文件相关测试      |
| `npm run types`    | 根据 jsdoc 注释生成 d.ts 文件                            |
| `npm run compile`  | 仅打包                                                   |
| `npm run build`    | 生产环境，打包，生成文档，types                          |
| `npm run pub`  | 采用 np 协助发包 npm                                     |


## 注意
#### 认真编写函数描述内容，将影响检索结果
#### 跑单测呀，保障覆盖率

## 参考链接（原版）
##[点我](https://github.com/201flaviosilva-labs/utilidades)
