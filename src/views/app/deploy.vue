<template>
  <div class="deployment-management">
    <!-- 顶部搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索发布单名称或应用实例名称"
        clearable
        style="width: 400px"
        @clear="handleSearchClear"
        @keyup.enter.native="handleSearch"
      >
        <el-button slot="append" icon="el-icon-search" @click="handleSearch" />
      </el-input>
    </div>

    <!-- 发布单卡片列表 -->
    <div class="deployment-cards">
      <el-card
        v-for="deployment in filteredDeployments"
        :key="deployment.id"
        class="deployment-card"
        :class="getStatusClass(deployment.status)"
      >
        <div slot="header" class="card-header">
          <span class="deployment-name">{{ deployment.name }}</span>
          <el-tag
            :type="getStatusTagType(deployment.status)"
            size="small"
            class="status-tag"
          >
            {{ deployment.status }}
          </el-tag>
        </div>

        <div class="card-content">
          <div class="info-item">
            <span class="info-label">应用实例:</span>
            <span class="info-value">{{ deployment.instanceName }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">版本:</span>
            <span class="info-value">{{ deployment.version }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">部署人:</span>
            <span class="info-value">{{ deployment.deployer }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">部署时间:</span>
            <span class="info-value">{{ formatDate(deployment.deployTime) }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">耗时:</span>
            <span class="info-value">{{ deployment.duration }}秒</span>
          </div>
        </div>

        <div class="card-footer">
          <el-button
            size="mini"
            type="primary"
            @click="handleView(deployment)"
          >
            详情
          </el-button>
          <el-button
            size="mini"
            :type="deployment.status === 'RUNNING' ? 'danger' : 'info'"
            :disabled="deployment.status !== 'RUNNING'"
            @click="handleStop(deployment)"
          >
            {{ deployment.status === 'RUNNING' ? '停止' : '已结束' }}
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 分页 -->
    <el-pagination
      :current-page="pagination.currentPage"
      :page-sizes="[12, 24, 48, 96]"
      :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      class="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 详情对话框 -->
    <el-dialog
      :title="`发布单详情 - ${currentDeployment.name}`"
      :visible.sync="dialogVisible"
      width="60%"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="发布单ID">{{ currentDeployment.id }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(currentDeployment.status)">
            {{ currentDeployment.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="应用实例">{{ currentDeployment.instanceName }}</el-descriptions-item>
        <el-descriptions-item label="应用版本">{{ currentDeployment.version }}</el-descriptions-item>
        <el-descriptions-item label="部署人">{{ currentDeployment.deployer }}</el-descriptions-item>
        <el-descriptions-item label="部署时间">{{ formatDate(currentDeployment.deployTime) }}</el-descriptions-item>
        <el-descriptions-item v-if="currentDeployment.finishTime" label="结束时间">
          {{ formatDate(currentDeployment.finishTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="耗时">{{ currentDeployment.duration }}秒</el-descriptions-item>
        <el-descriptions-item v-if="currentDeployment.buildId" label="构建ID">
          {{ currentDeployment.buildId }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentDeployment.gitBranch" label="Git分支">
          {{ currentDeployment.gitBranch }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentDeployment.commitId" label="提交ID">
          {{ currentDeployment.commitId }}
        </el-descriptions-item>
      </el-descriptions>

      <div v-if="currentDeployment.logs" class="log-container">
        <h4>部署日志:</h4>
        <pre class="deployment-logs">{{ currentDeployment.logs }}</pre>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      deployments: [], // 所有发布单数据
      filteredDeployments: [], // 过滤后的发布单数据
      searchQuery: '', // 搜索关键词
      dialogVisible: false, // 对话框显示状态
      currentDeployment: {}, // 当前查看的发布单
      pagination: {
        currentPage: 1,
        pageSize: 12,
        total: 0
      }
    }
  },
  created() {
    this.fetchDeployments()
  },
  methods: {
    // 获取发布单列表
    async fetchDeployments() {
      try {
        // 这里替换为实际的API调用
        // const response = await this.$http.get('/api/deployments', {
        //   params: {
        //     page: this.pagination.currentPage,
        //     size: this.pagination.pageSize,
        //     search: this.searchQuery
        //   }
        // })
        // this.deployments = response.data.items
        // this.filteredDeployments = this.deployments
        // this.pagination.total = response.data.total

        // 模拟数据
        this.deployments = [
          {
            id: 'dep-001',
            name: '用户服务-生产环境-20230620',
            instanceName: '用户服务-生产',
            version: 'v1.2.3',
            status: 'SUCCESS',
            deployer: '张三',
            deployTime: '2023-06-20T10:30:00Z',
            finishTime: '2023-06-20T10:32:15Z',
            duration: 135,
            buildId: 'build-12345',
            gitBranch: 'release/v1.2.3',
            commitId: 'a1b2c3d4',
            logs: '2023-06-20 10:30:00 - 开始部署...\n2023-06-20 10:30:15 - 拉取镜像成功\n2023-06-20 10:31:30 - 启动容器\n2023-06-20 10:32:00 - 健康检查通过\n2023-06-20 10:32:15 - 部署成功'
          },
          {
            id: 'dep-002',
            name: '订单服务-测试环境-20230621',
            instanceName: '订单服务-测试',
            version: 'v1.5.0-beta',
            status: 'RUNNING',
            deployer: '李四',
            deployTime: '2023-06-21T14:15:00Z',
            duration: 240,
            buildId: 'build-12346',
            gitBranch: 'feature/new-payment',
            commitId: 'e5f6g7h8',
            logs: '2023-06-21 14:15:00 - 开始部署...\n2023-06-21 14:15:30 - 拉取镜像成功\n2023-06-21 14:16:45 - 启动容器\n2023-06-21 14:17:30 - 正在进行健康检查...'
          },
          {
            id: 'dep-003',
            name: '支付服务-生产环境-20230618',
            instanceName: '支付服务-生产',
            version: 'v2.0.1',
            status: 'FAILED',
            deployer: '王五',
            deployTime: '2023-06-18T09:00:00Z',
            finishTime: '2023-06-18T09:02:30Z',
            duration: 150,
            buildId: 'build-12344',
            gitBranch: 'hotfix/payment-bug',
            commitId: 'i9j0k1l2',
            logs: '2023-06-18 09:00:00 - 开始部署...\n2023-06-18 09:00:20 - 拉取镜像成功\n2023-06-18 09:01:45 - 启动容器失败\n2023-06-18 09:02:30 - 部署失败: 端口冲突'
          },
          {
            id: 'dep-004',
            name: '库存服务-开发环境-20230619',
            instanceName: '库存服务-开发',
            version: 'v1.1.0-SNAPSHOT',
            status: 'STOPPED',
            deployer: '赵六',
            deployTime: '2023-06-19T16:45:00Z',
            finishTime: '2023-06-19T17:30:00Z',
            duration: 2700,
            buildId: 'build-12347',
            gitBranch: 'develop',
            commitId: 'm3n4o5p6',
            logs: '2023-06-19 16:45:00 - 开始部署...\n2023-06-19 16:46:30 - 拉取镜像成功\n2023-06-19 16:48:15 - 启动容器\n2023-06-19 17:25:00 - 手动停止部署'
          }
        ]
        this.filteredDeployments = this.deployments
        this.pagination.total = this.deployments.length
      } catch (error) {
        this.$message.error('获取发布单列表失败')
        console.error(error)
      }
    },

    // 处理搜索
    handleSearch() {
      if (!this.searchQuery.trim()) {
        this.filteredDeployments = this.deployments
        return
      }
      const query = this.searchQuery.toLowerCase()
      this.filteredDeployments = this.deployments.filter(deployment =>
        deployment.name.toLowerCase().includes(query) ||
        deployment.instanceName.toLowerCase().includes(query)
      )
    },

    // 清除搜索
    handleSearchClear() {
      this.searchQuery = ''
      this.filteredDeployments = this.deployments
    },

    // 查看发布单详情
    handleView(deployment) {
      this.currentDeployment = { ...deployment }
      this.dialogVisible = true
    },

    // 停止发布单
    handleStop(deployment) {
      this.$confirm(`确定要停止发布单 "${deployment.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.stopDeployment(deployment.id)
      }).catch(() => {})
    },

    // 停止发布单
    async stopDeployment(id) {
      try {
        // await this.$http.post(`/api/deployments/${id}/stop`)

        // 模拟停止
        const index = this.deployments.findIndex(d => d.id === id)
        if (index !== -1) {
          this.deployments[index].status = 'STOPPED'
          this.deployments[index].finishTime = new Date().toISOString()
          this.filteredDeployments = [...this.deployments]
        }

        this.$message.success('发布单已停止')
      } catch (error) {
        this.$message.error('停止发布单失败')
        console.error(error)
      }
    },

    // 分页大小变化
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.fetchDeployments()
    },

    // 当前页变化
    handleCurrentChange(page) {
      this.pagination.currentPage = page
      this.fetchDeployments()
    },

    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },

    // 根据状态获取卡片类名
    getStatusClass(status) {
      switch (status) {
        case 'SUCCESS': return 'status-success'
        case 'RUNNING': return 'status-running'
        case 'FAILED': return 'status-failed'
        case 'STOPPED': return 'status-stopped'
        default: return ''
      }
    },

    // 根据状态获取标签类型
    getStatusTagType(status) {
      switch (status) {
        case 'SUCCESS': return 'success'
        case 'RUNNING': return 'primary'
        case 'FAILED': return 'danger'
        case 'STOPPED': return 'info'
        default: return 'warning'
      }
    }
  }
}
</script>

<style scoped>
.deployment-management {
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
}

.deployment-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.deployment-card {
  transition: all 0.3s;
}

.deployment-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.deployment-name {
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-grow: 1;
}

.status-tag {
  margin-left: 10px;
  flex-shrink: 0;
}

.card-content {
  padding: 10px 0;
}

.info-item {
  margin-bottom: 10px;
  display: flex;
}

.info-label {
  font-weight: bold;
  color: #909399;
  width: 80px;
  flex-shrink: 0;
}

.info-value {
  flex-grow: 1;
  word-break: break-all;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

/* 状态卡片边框颜色 */
.status-success {
  border-top: 4px solid #67C23A;
}

.status-running {
  border-top: 4px solid #409EFF;
}

.status-failed {
  border-top: 4px solid #F56C6C;
}

.status-stopped {
  border-top: 4px solid #909399;
}

.log-container {
  margin-top: 20px;
}

.deployment-logs {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
