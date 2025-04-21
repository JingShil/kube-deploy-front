<template>
  <div class="instance-management">
    <!-- 顶部搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索应用实例名称"
        clearable
        style="width: 300px"
        @clear="handleSearchClear"
        @keyup.enter.native="handleSearch"
      >
        <el-button slot="append" icon="el-icon-search" @click="handleSearch" />
      </el-input>

      <el-button
        type="primary"
        icon="el-icon-plus"
        style="margin-left: 10px;"
        @click="goToCreateApp"
      >
        创建应用实例
      </el-button>
    </div>

    <!-- 应用实例卡片列表 -->
    <div class="instance-cards">
      <el-card
        v-for="instance in filteredInstances"
        :key="instance.id"
        class="instance-card"
        :class="getStatusClass(instance.status)"
      >
        <div slot="header" class="card-header">
          <span class="instance-name">{{ instance.name }}</span>
          <el-tag
            :type="getStatusTagType(instance.status)"
            size="small"
            class="status-tag"
          >
            {{ instance.status }}
          </el-tag>
        </div>

        <div class="card-content">
          <div class="info-item">
            <span class="info-label">应用名称:</span>
            <span class="info-value">{{ instance.appName }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Pod数量:</span>
            <span class="info-value">
              <span class="pod-count">{{ instance.runningPods }}/{{ instance.totalPods }}</span>
              <el-progress
                :percentage="calculatePodPercentage(instance)"
                :show-text="false"
                :stroke-width="5"
                :color="getPodColor(instance)"
                style="width: 60px; display: inline-block; margin-left: 5px;"
              />
            </span>
          </div>

          <div class="info-item">
            <span class="info-label">所属人:</span>
            <span class="info-value">{{ instance.createdBy }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">更新时间:</span>
            <span class="info-value">{{ formatDate(instance.updateTime) }}</span>
          </div>
        </div>

        <div class="card-footer">
          <el-button size="mini" @click="goToInstanceDetail(instance.id)">查看</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="confirmDelete(instance)"
          >
            删除
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

    <!-- 查看对话框 -->
    <el-dialog :title="`应用实例详情 - ${currentInstance.name}`" :visible.sync="dialogVisible" width="50%">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="实例ID">{{ currentInstance.id }}</el-descriptions-item>
        <el-descriptions-item label="应用名称">{{ currentInstance.appName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(currentInstance.status)">
            {{ currentInstance.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Pod运行情况">
          {{ currentInstance.runningPods }}/{{ currentInstance.totalPods }}
          <el-progress
            :percentage="calculatePodPercentage(currentInstance)"
            :color="getPodColor(currentInstance)"
            style="width: 100px; display: inline-block; margin-left: 10px;"
          />
        </el-descriptions-item>
        <el-descriptions-item label="所属人">{{ currentInstance.owner }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(currentInstance.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(currentInstance.updatedAt) }}</el-descriptions-item>
      </el-descriptions>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { listAppInstance, createAppInstance, updateAppInstance } from '@/api/app/appInstance'
export default {
  data() {
    return {
      instances: [], // 所有实例数据
      filteredInstances: [], // 过滤后的实例数据
      searchQuery: '', // 搜索关键词
      dialogVisible: false, // 对话框显示状态
      currentInstance: {}, // 当前查看的实例
      pagination: {
        currentPage: 1,
        pageSize: 12,
        total: 0
      }
    }
  },
  created() {
    this.listAppInstance()
  },
  methods: {
    // 获取实例列表
    listAppInstance() {
      listAppInstance().then(response => {
        this.instances = response.data
        this.filteredInstances = this.instances
        this.pagination.total = this.instances.length
        // 在这里处理返回的数据
      })
        .catch(error => {
          console.error('Error fetching cluster resources:', error)
        // 在这里处理错误
        })
    },
    async fetchInstances() {
      try {
        // 这里替换为实际的API调用
        // const response = await this.$http.get('/api/instances', {
        //   params: {
        //     page: this.pagination.currentPage,
        //     size: this.pagination.pageSize,
        //     search: this.searchQuery
        //   }
        // })
        // this.instances = response.data.items
        // this.filteredInstances = this.instances
        // this.pagination.total = response.data.total

        // 模拟数据
        this.instances = [
          {
            id: 'inst-001',
            name: '用户服务-生产',
            appName: '用户服务',
            status: 'Running',
            runningPods: 3,
            totalPods: 3,
            owner: '张三',
            createdAt: '2023-05-10T09:15:00Z',
            updatedAt: '2023-06-15T14:30:00Z'
          },
          {
            id: 'inst-002',
            name: '订单服务-测试',
            appName: '订单服务',
            status: 'Pending',
            runningPods: 1,
            totalPods: 2,
            owner: '李四',
            createdAt: '2023-06-01T11:20:00Z',
            updatedAt: '2023-06-18T10:45:00Z'
          },
          {
            id: 'inst-003',
            name: '支付服务-生产',
            appName: '支付服务',
            status: 'Error',
            runningPods: 0,
            totalPods: 2,
            owner: '王五',
            createdAt: '2023-04-15T13:10:00Z',
            updatedAt: '2023-06-20T08:15:00Z'
          },
          {
            id: 'inst-004',
            name: '库存服务-开发',
            appName: '库存服务',
            status: 'Running',
            runningPods: 2,
            totalPods: 2,
            owner: '赵六',
            createdAt: '2023-06-05T16:25:00Z',
            updatedAt: '2023-06-19T17:30:00Z'
          }
        ]
        this.filteredInstances = this.instances
        this.pagination.total = this.instances.length
      } catch (error) {
        this.$message.error('获取应用实例列表失败')
        console.error(error)
      }
    },

    goToCreateApp() {
      // this.$router.push({
      //   path: '/app/instance/create',
      //   query: {
      //     instanceId: instanceId
      //   }
      // })
      this.$router.push('/app/instance/create') // 跳转到创建流程的第一步
    },
    goToInstanceDetail(instanceId) {
      this.$router.push({
        path: '/app/instance/detail',
        query: {
          instanceId: instanceId
        }
      })
      // this.$router.push('/app/instance/detail')
    },
    // 处理搜索
    handleSearch() {
      if (!this.searchQuery.trim()) {
        this.filteredInstances = this.instances
        return
      }
      const query = this.searchQuery.toLowerCase()
      this.filteredInstances = this.instances.filter(instance =>
        instance.name.toLowerCase().includes(query) ||
        instance.appName.toLowerCase().includes(query)
      )
    },

    // 清除搜索
    handleSearchClear() {
      this.searchQuery = ''
      this.filteredInstances = this.instances
    },

    // 查看实例详情
    handleView(instance) {
      this.currentInstance = { ...instance }
      this.dialogVisible = true
    },

    // 确认删除实例
    confirmDelete(instance) {
      this.$confirm(`确定要删除实例 "${instance.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteInstance(instance.id)
      }).catch(() => {})
    },

    // 删除实例
    async deleteInstance(id) {
      try {
        // await this.$http.delete(`/api/instances/${id}`)

        // 模拟删除
        const index = this.instances.findIndex(i => i.id === id)
        if (index !== -1) {
          this.instances.splice(index, 1)
          this.filteredInstances = [...this.instances]
          this.pagination.total -= 1
        }

        this.$message.success('实例删除成功')
      } catch (error) {
        this.$message.error('实例删除失败')
        console.error(error)
      }
    },

    // 分页大小变化
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.fetchInstances()
    },

    // 当前页变化
    handleCurrentChange(page) {
      this.pagination.currentPage = page
      this.fetchInstances()
    },

    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },

    // 计算Pod运行百分比
    calculatePodPercentage(instance) {
      if (instance.totalPods === 0) return 0
      return Math.round((instance.runningPods / instance.totalPods) * 100)
    },

    // 根据状态获取卡片类名
    getStatusClass(status) {
      switch (status) {
        case 'Running': return 'status-running'
        case 'Pending': return 'status-pending'
        case 'Error': return 'status-error'
        default: return ''
      }
    },

    // 根据状态获取标签类型
    getStatusTagType(status) {
      switch (status) {
        case 'Running': return 'success'
        case 'Warning': return 'warning'
        case 'Error': return 'danger'
        default: return 'info'
      }
    },

    // 根据Pod状态获取进度条颜色
    getPodColor(instance) {
      const percentage = this.calculatePodPercentage(instance)
      if (percentage === 100) return '#67C23A'
      if (percentage >= 50) return '#E6A23C'
      return '#F56C6C'
    }
  }
}
</script>

<style scoped>
.instance-management {
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
}

.instance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.instance-card {
  transition: all 0.3s;
}

.instance-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.instance-name {
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-tag {
  margin-left: 10px;
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

.pod-count {
  font-family: monospace;
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
.status-running {
  border-top: 4px solid #67C23A;
}

.status-pending {
  border-top: 4px solid #E6A23C;
}

.status-error {
  border-top: 4px solid #F56C6C;
}

</style>
