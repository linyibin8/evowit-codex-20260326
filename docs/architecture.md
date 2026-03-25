# 架构建议

## 最优工程路线

### 阶段 1：验证产品价值

- iPhone 本地完成：
  - gaze proxy
  - ROI crop
  - 本地 Speech 转写
- 局域网边缘服务完成：
  - 多模态状态聚合
  - 教学策略 prompt 编排
  - OpenAI 请求代理

### 阶段 2：压低延迟

- OpenAI Realtime 负责语音回路
- 边缘节点负责：
  - 会话 memory
  - ROI OCR
  - 关键帧筛选
  - tool call

### 阶段 3：强化过程理解

- 使用时序缓存而非单帧
- 把学习过程抽象为：
  - `observe`
  - `hypothesize`
  - `scaffold`
  - `verify`

## 技术折中

- 真正“精确 gaze 落到纸张像素坐标”需要标定、双摄、姿态解算与空间映射。
- MVP 先做近似：用前置 gaze 向量 + 设备姿态 + 书本 ROI 估计关注区块。
- 在验证期，这个近似已经足够把上行图像从整帧压缩为小块。

