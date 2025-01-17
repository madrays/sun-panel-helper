# Deploy Directory

此目录用于开发参考，对应容器内的 `/app/deploy` 目录。

在实际部署时：
1. 容器内的 `/app/deploy` 由 Dockerfile 创建
2. Sun-Panel 的 custom 目录会被挂载到容器的 `/app/deploy`
3. 所有 CSS 样式会直接写入到 index.css 文件中

目录结构：
```
/app/deploy/
└── index.css    # 样式文件
```

注意：此目录仅用于开发参考，不会包含在最终的 Docker 镜像中。 