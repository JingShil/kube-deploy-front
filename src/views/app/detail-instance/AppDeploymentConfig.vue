<template>
  <el-descriptions :column="2" border>
    <el-descriptions-item label="更新策略">{{ config.strategy }}</el-descriptions-item>
    <el-descriptions-item label="历史版本保留数">{{ config.revisionHistoryLimit }}</el-descriptions-item>
    <el-descriptions-item label="资源限制">
      CPU: {{ config.resources.limits.cpu }} 内存: {{ config.resources.limits.memory }}
    </el-descriptions-item>
    <el-descriptions-item label="资源请求">
      CPU: {{ config.resources.requests.cpu }} 内存: {{ config.resources.requests.memory }}
    </el-descriptions-item>
    <el-descriptions-item label="环境变量">
      <el-tag
        v-for="(env, index) in config.env"
        :key="index"
        size="small"
        style="margin-right: 5px"
      >
        {{ env.name }}: {{ env.value }}
      </el-tag>
    </el-descriptions-item>
  </el-descriptions>
</template>
