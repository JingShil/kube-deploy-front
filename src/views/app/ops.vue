<template>
  <div class="operation-management">
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索运维单名称或应用实例名称"
        clearable
        style="width: 400px"
        @clear="handleSearchClear"
        @keyup.enter.native="handleSearch"
      >
        <el-button slot="append" icon="el-icon-search" @click="handleSearch" />
      </el-input>

      <div class="action-buttons">
        <el-button type="primary" icon="el-icon-plus" @click="showCreateDialog">创建运维单</el-button>
      </div>
    </div>

    <!-- 运维单卡片列表 -->
    <div class="operation-cards">
      <el-card
        v-for="operation in filteredOperations"
        :key="operation.id"
        class="operation-card"
        :class="getStatusClass(operation.status)"
      >
        <div slot="header" class="card-header">
          <span class="operation-name">{{ operation.name }}</span>
          <el-tag
            :type="getStatusTagType(operation.status)"
            size="small"
            class="status-tag"
          >
            {{ operation.status }}
          </el-tag>
        </div>

        <div class="card-content">
          <div class="info-item">
            <span class="info-label">应用实例:</span>
            <span class="info-value">{{ operation.instanceName }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">运维类型:</span>
            <span class="info-value">{{ operation.type }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">发起人:</span>
            <span class="info-value">{{ operation.operator }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">开始时间:</span>
            <span class="info-value">{{ formatDate(operation.startTime) }}</span>
          </div>

          <div v-if="operation.endTime" class="info-item">
            <span class="info-label">结束时间:</span>
            <span class="info-value">{{ formatDate(operation.endTime) }}</span>
          </div>
        </div>

        <div class="card-footer">
          <el-button
            size="mini"
            type="primary"
            @click="handleView(operation)"
          >
            详情
          </el-button>
          <el-button
            size="mini"
            :type="operation.status === 'RUNNING' ? 'danger' : 'info'"
            :disabled="!['PENDING', 'RUNNING'].includes(operation.status)"
            @click="handleControl(operation)"
          >
            {{ getControlButtonText(operation.status) }}
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

    <!-- 创建运维单对话框 -->
    <el-dialog
      :title="'创建运维单'"
      :visible.sync="createDialogVisible"
      width="50%"
      @closed="resetForm"
    >
      <el-form
        ref="operationForm"
        :model="newOperation"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="运维单名称" prop="name">
          <el-input v-model="newOperation.name" placeholder="请输入运维单名称" />
        </el-form-item>

        <el-form-item label="应用实例" prop="instanceId">
          <el-select
            v-model="newOperation.instanceId"
            placeholder="请选择应用实例"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="instance in instances"
              :key="instance.id"
              :label="instance.name"
              :value="instance.id"
            >
              <span style="float: left">{{ instance.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ instance.appName }} ({{ instance.status }})
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="运维类型" prop="type">
          <el-select
            v-model="newOperation.type"
            placeholder="请选择运维类型"
            style="width: 100%"
          >
            <el-option label="配置变更" value="CONFIG_CHANGE" />
            <el-option label="服务重启" value="SERVICE_RESTART" />
            <el-option label="扩容/缩容" value="SCALE" />
            <el-option label="数据迁移" value="DATA_MIGRATION" />
            <el-option label="版本回滚" value="ROLLBACK" />
          </el-select>
        </el-form-item>

        <el-form-item label="运维描述" prop="description">
          <el-input
            v-model="newOperation.description"
            type="textarea"
            :rows="3"
            placeholder="请输入运维描述"
          />
        </el-form-item>

        <el-form-item label="执行时间" prop="scheduleType">
          <el-radio-group v-model="newOperation.scheduleType">
            <el-radio label="IMMEDIATE">立即执行</el-radio>
            <el-radio label="SCHEDULED">定时执行</el-radio>
          </el-radio-group>

          <el-date-picker
            v-if="newOperation.scheduleType === 'SCHEDULED'"
            v-model="newOperation.scheduledTime"
            type="datetime"
            placeholder="选择执行时间"
            style="margin-top: 10px; width: 100%"
            :picker-options="pickerOptions"
          />
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitOperationForm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 运维单详情对话框 -->
    <el-dialog
      :title="`运维单详情 - ${currentOperation.name}`"
      :visible.sync="detailDialogVisible"
      width="60%"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="运维单ID">{{ currentOperation.id }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(currentOperation.status)">
            {{ currentOperation.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="应用实例">{{ currentOperation.instanceName }}</el-descriptions-item>
        <el-descriptions-item label="运维类型">{{ currentOperation.type }}</el-descriptions-item>
        <el-descriptions-item label="发起人">{{ currentOperation.operator }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ formatDate(currentOperation.startTime) }}</el-descriptions-item>
        <el-descriptions-item v-if="currentOperation.endTime" label="结束时间">
          {{ formatDate(currentOperation.endTime) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentOperation.endTime" label="耗时">
          {{ calculateDuration(currentOperation.startTime, currentOperation.endTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentOperation.description }}</el-descriptions-item>
      </el-descriptions>

      <div v-if="currentOperation.logs" class="log-container">
        <h4>运维日志:</h4>
        <pre class="operation-logs">{{ currentOperation.logs }}</pre>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      operations: [], // 所有运维单数据
      filteredOperations: [], // 过滤后的运维单数据
      instances: [], // 应用实例列表
      searchQuery: '', // 搜索关键词
      createDialogVisible: false, // 创建对话框显示状态
      detailDialogVisible: false, // 详情对话框显示状态
      currentOperation: {}, // 当前查看的运维单
      newOperation: { // 新建运维单表单
        name: '',
        instanceId: '',
        type: '',
        description: '',
        scheduleType: 'IMMEDIATE',
        scheduledTime: null
      },
      pagination: {
        currentPage: 1,
        pageSize: 12,
        total: 0
      },
      rules: {
        name: [
          { required: true, message: '请输入运维单名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        instanceId: [
          { required: true, message: '请选择应用实例', trigger: 'change' }
        ],
        type: [
          { required: true, message: '请选择运维类型', trigger: 'change' }
        ],
        description: [
          { max: 500, message: '长度不能超过 500 个字符', trigger: 'blur' }
        ]
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7 // 不能选择今天之前的日期
        }
      }
    }
  },
  created() {
    this.fetchOperations()
    this.fetchInstances()
  },
  methods: {
    // 获取运维单列表
    async fetchOperations() {
      try {
        // 这里替换为实际的API调用
        // const response = await this.$http.get('/api/operations', {
        //   params: {
        //     page: this.pagination.currentPage,
        //     size: this.pagination.pageSize,
        //     search: this.searchQuery
        //   }
        // })
        // this.operations = response.data.items
        // this.filteredOperations = this.operations
        // this.pagination.total = response.data.total

        // 模拟数据
        this.operations = [
          {
            id: 'op-001',
            name: '用户服务-生产-配置变更-20230620',
            instanceId: 'inst-001',
            instanceName: '用户服务-生产',
            type: 'CONFIG_CHANGE',
            status: 'SUCCESS',
            operator: '张三',
            startTime: '2023-06-20T14:30:00Z',
            endTime: '2023-06-20T14:35:15Z',
            description: '更新数据库连接池配置',
            logs: '2023-06-20 14:30:00 - 开始配置变更...\n2023-06-20 14:31:30 - 备份当前配置\n2023-06-20 14:33:45 - 应用新配置\n2023-06-20 14:34:30 - 验证配置生效\n2023-06-20 14:35:15 - 配置变更完成'
          },
          {
            id: 'op-002',
            name: '订单服务-测试-服务重启-20230621',
            instanceId: 'inst-002',
            instanceName: '订单服务-测试',
            type: 'SERVICE_RESTART',
            status: 'RUNNING',
            operator: '李四',
            startTime: '2023-06-21T10:15:00Z',
            description: '重启服务以应用最新配置',
            logs: '2023-06-21 10:15:00 - 开始服务重启...\n2023-06-21 10:16:30 - 停止服务\n2023-06-21 10:17:45 - 启动服务\n2023-06-21 10:18:30 - 等待服务健康检查...'
          },
          {
            id: 'op-003',
            name: '支付服务-生产-版本回滚-20230618',
            instanceId: 'inst-003',
            instanceName: '支付服务-生产',
            type: 'ROLLBACK',
            status: 'FAILED',
            operator: '王五',
            startTime: '2023-06-18T16:00:00Z',
            endTime: '2023-06-18T16:05:30Z',
            description: '回滚到v1.2.3版本',
            logs: '2023-06-18 16:00:00 - 开始版本回滚...\n2023-06-18 16:01:30 - 停止当前服务\n2023-06-18 16:02:45 - 回滚到v1.2.3版本\n2023-06-18 16:04:00 - 启动服务失败\n2023-06-18 16:05:30 - 回滚失败: 镜像拉取错误'
          },
          {
            id: 'op-004',
            name: '库存服务-开发-扩容-20230619',
            instanceId: 'inst-004',
            instanceName: '库存服务-开发',
            type: 'SCALE',
            status: 'PENDING',
            operator: '赵六',
            description: '从2个Pod扩容到4个Pod',
            scheduledTime: '2023-06-22T02:00:00Z'
          }
        ]
        this.filteredOperations = this.operations
        this.pagination.total = this.operations.length
      } catch (error) {
        this.$message.error('获取运维单列表失败')
        console.error(error)
      }
    },

    // 获取应用实例列表
    async fetchInstances() {
      try {
        // 这里替换为实际的API调用
        // const response = await this.$http.get('/api/instances')
        // this.instances = response.data

        // 模拟数据
        this.instances = [
          { id: 'inst-001', name: '用户服务-生产', appName: '用户服务', status: 'RUNNING' },
          { id: 'inst-002', name: '订单服务-测试', appName: '订单服务', status: 'RUNNING' },
          { id: 'inst-003', name: '支付服务-生产', appName: '支付服务', status: 'RUNNING' },
          { id: 'inst-004', name: '库存服务-开发', appName: '库存服务', status: 'RUNNING' }
        ]
      } catch (error) {
        this.$message.error('获取应用实例列表失败')
        console.error(error)
      }
    },

    // 处理搜索
    handleSearch() {
      if (!this.searchQuery.trim()) {
        this.filteredOperations = this.operations
        return
      }
      const query = this.searchQuery.toLowerCase()
      this.filteredOperations = this.operations.filter(operation =>
        operation.name.toLowerCase().includes(query) ||
        operation.instanceName.toLowerCase().includes(query)
      )
    },

    // 清除搜索
    handleSearchClear() {
      this.searchQuery = ''
      this.filteredOperations = this.operations
    },

    // 显示创建对话框
    showCreateDialog() {
      this.createDialogVisible = true
    },

    // 重置表单
    resetForm() {
      this.$refs.operationForm && this.$refs.operationForm.resetFields()
      this.newOperation.scheduledTime = null
    },

    // 提交运维单表单
    submitOperationForm() {
      this.$refs.operationForm.validate(async(valid) => {
        if (!valid) return

        try {
          // 这里替换为实际的API调用
          // const payload = {
          //   ...this.newOperation,
          //   scheduledTime: this.newOperation.scheduleType === 'SCHEDULED'
          //     ? this.newOperation.scheduledTime
          //     : null
          // }
          // const response = await this.$http.post('/api/operations', payload)

          // 模拟创建
          const instance = this.instances.find(i => i.id === this.newOperation.instanceId)
          const newOperation = {
            id: `op-${Math.random().toString(36).substr(2, 8)}`,
            name: this.newOperation.name,
            instanceId: this.newOperation.instanceId,
            instanceName: instance ? instance.name : '',
            type: this.newOperation.type,
            status: this.newOperation.scheduleType === 'IMMEDIATE' ? 'PENDING' : 'SCHEDULED',
            operator: '当前用户',
            description: this.newOperation.description,
            startTime: this.newOperation.scheduleType === 'IMMEDIATE' ? new Date().toISOString() : null,
            scheduledTime: this.newOperation.scheduleType === 'SCHEDULED'
              ? this.newOperation.scheduledTime
              : null,
            logs: ''
          }

          this.operations.unshift(newOperation)
          this.filteredOperations = [...this.operations]
          this.pagination.total += 1

          this.$message.success('运维单创建成功')
          this.createDialogVisible = false
        } catch (error) {
          this.$message.error('创建运维单失败')
          console.error(error)
        }
      })
    },

    // 查看运维单详情
    handleView(operation) {
      this.currentOperation = { ...operation }
      this.detailDialogVisible = true
    },

    // 控制运维单（执行/停止）
    handleControl(operation) {
      if (operation.status === 'PENDING') {
        this.$confirm(`确定要立即执行运维单 "${operation.name}" 吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.executeOperation(operation.id)
        }).catch(() => {})
      } else if (operation.status === 'RUNNING') {
        this.$confirm(`确定要停止运维单 "${operation.name}" 吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.stopOperation(operation.id)
        }).catch(() => {})
      }
    },

    // 执行运维单
    async executeOperation(id) {
      try {
        // await this.$http.post(`/api/operations/${id}/execute`)

        // 模拟执行
        const index = this.operations.findIndex(o => o.id === id)
        if (index !== -1) {
          this.operations[index].status = 'RUNNING'
          this.operations[index].startTime = new Date().toISOString()
          this.filteredOperations = [...this.operations]
        }

        this.$message.success('运维单已开始执行')
      } catch (error) {
        this.$message.error('执行运维单失败')
        console.error(error)
      }
    },

    // 停止运维单
    async stopOperation(id) {
      try {
        // await this.$http.post(`/api/operations/${id}/stop`)

        // 模拟停止
        const index = this.operations.findIndex(o => o.id === id)
        if (index !== -1) {
          this.operations[index].status = 'STOPPED'
          this.operations[index].endTime = new Date().toISOString()
          this.filteredOperations = [...this.operations]
        }

        this.$message.success('运维单已停止')
      } catch (error) {
        this.$message.error('停止运维单失败')
        console.error(error)
      }
    },

    // 分页大小变化
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.fetchOperations()
    },

    // 当前页变化
    handleCurrentChange(page) {
      this.pagination.currentPage = page
      this.fetchOperations()
    },

    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '未开始'
      const date = new Date(dateString)
      return date.toLocaleString()
    },

    // 计算耗时
    calculateDuration(startTime, endTime) {
      if (!startTime || !endTime) return ''
      const start = new Date(startTime)
      const end = new Date(endTime)
      const seconds = Math.round((end - start) / 1000)

      if (seconds < 60) return `${seconds}秒`
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}分${remainingSeconds}秒`
    },

    // 根据状态获取卡片类名
    getStatusClass(status) {
      switch (status) {
        case 'SUCCESS': return 'status-success'
        case 'RUNNING': return 'status-running'
        case 'FAILED': return 'status-failed'
        case 'PENDING': return 'status-pending'
        case 'SCHEDULED': return 'status-scheduled'
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
        case 'PENDING': return 'warning'
        case 'SCHEDULED': return 'info'
        case 'STOPPED': return 'info'
        default: return 'warning'
      }
    },

    // 获取控制按钮文本
    getControlButtonText(status) {
      switch (status) {
        case 'PENDING': return '执行'
        case 'RUNNING': return '停止'
        case 'SCHEDULED': return '计划中'
        default: return '已完成'
      }
    }
  }
}
</script>

<style scoped>
.operation-management {
  padding: 20px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.operation-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.operation-card {
  transition: all 0.3s;
}

.operation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.operation-name {
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

.status-pending {
  border-top: 4px solid #E6A23C;
}

.status-scheduled {
  border-top: 4px solid #909399;
}

.status-stopped {
  border-top: 4px solid #909399;
}

.log-container {
  margin-top: 20px;
}

.operation-logs {
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
