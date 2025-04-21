<template>
  <el-table :data="pods" style="width: 100%">
    <el-table-column prop="name" label="Pod名称" width="180">
      <template slot-scope="scope">
        <el-link type="primary" @click="showPodDetail(scope.row.name)">
          {{ scope.row.name }}
        </el-link>
      </template>
    </el-table-column>
    <el-table-column prop="status" label="状态" width="120">
      <template slot-scope="scope">
        <el-tag :type="getStatusType(scope.row.status)">
          {{ scope.row.status }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="node" label="所在节点" />
    <el-table-column prop="ip" label="IP地址" />
    <el-table-column prop="restarts" label="重启次数" width="100" />
    <el-table-column prop="age" label="运行时间" />
    <el-table-column label="操作" width="120">
      <template slot-scope="scope">
        <el-button size="mini" @click="showLogs(scope.row.name)">日志</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'PodStatusTable',
  props: {
    pods: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    // 获取状态对应的标签类型
    getStatusType(status) {
      const statusMap = {
        Running: 'success',
        Pending: 'warning',
        Failed: 'danger',
        Succeeded: 'info',
        Unknown: 'danger'
      }
      return statusMap[status] || ''
    },
    // 显示Pod详情
    showPodDetail(podName) {
      this.$emit('detail', podName)
    },
    // 显示Pod日志
    showPodLogs(podName) {
      this.$emit('show-logs', podName)
    },
    // 格式化运行时间
    formatAge(startTime) {
      if (!startTime) return '-'
      const start = new Date(startTime)
      const now = new Date()
      const diff = now - start

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      let result = ''
      if (days > 0) result += `${days}d `
      if (hours > 0 || days > 0) result += `${hours}h `
      result += `${minutes}m`

      return result
    }
  }
}
</script>

