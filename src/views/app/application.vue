<template>
  <div class="app-management">
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索应用名称"
        style="width: 300px"
        clearable
        @clear="handleSearchClear"
        @keyup.enter.native="handleSearch"
      >
        <el-button slot="append" icon="el-icon-search" @click="handleSearch" />
      </el-input>

      <div class="action-buttons">
        <el-button type="primary" @click="showCreateDialog">创建应用</el-button>
        <el-button
          type="danger"
          :disabled="selectedApps.length === 0"
          @click="confirmDeleteMultiple"
        >
          批量删除
        </el-button>
      </div>
    </div>

    <!-- 应用列表 -->
    <el-table
      :data="filteredApps"
      style="width: 100%"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column
        prop="id"
        label="ID"
        width="80"
      />
      <el-table-column
        prop="name"
        label="应用名称"
      />
      <el-table-column
        prop="description"
        label="描述"
      />
      <el-table-column
        prop="createTime"
        label="创建时间"
        width="180"
      >
        <template slot-scope="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="180"
      >
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="confirmDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      :current-page="pagination.currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      style="margin-top: 20px; text-align: right;"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 创建/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
      <el-form ref="appForm" :model="currentApp" :rules="rules" label-width="100px">
        <el-form-item label="应用名称" prop="name">
          <el-input v-model="currentApp.name" />
        </el-form-item>
        <el-form-item label="应用描述" prop="description">
          <el-input v-model="currentApp.description" type="textarea" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { listApp, createApp, updateApp, deleteApp } from '@/api/app/app'
export default {
  data() {
    return {
      apps: [], // 所有应用数据
      filteredApps: [], // 过滤后的应用数据
      searchQuery: '', // 搜索关键词
      selectedApps: [], // 选中的应用
      dialogVisible: false, // 对话框显示状态
      currentApp: { // 当前编辑的应用
        id: '',
        name: '',
        description: ''
      },
      isEditMode: false, // 是否为编辑模式
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      rules: {
        name: [
          { required: true, message: '请输入应用名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        description: [
          { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.isEditMode ? '编辑应用' : '创建应用'
    }
  },
  created() {
    // this.fetchApps()
    this.listApp()
  },
  methods: {
    // 获取应用列表
    listApp() {
      listApp().then(response => {
        this.apps = response.data
        this.filteredApps = this.apps
        this.pagination.total = this.apps.length
        // 在这里处理返回的数据
      })
        .catch(error => {
          console.error('Error fetching cluster resources:', error)
        // 在这里处理错误
        })
    },
    createApp() {
      createApp().then(response => {
        this.apps = response.data
        this.filteredApps = this.apps
        this.pagination.total = this.apps.length
        // 在这里处理返回的数据
      })
        .catch(error => {
          console.error('Error fetching cluster resources:', error)
        // 在这里处理错误
        })
    },
    async fetchApps() {
      try {
        // const response = await this.$http.get('/api/apps', {
        //   params: {
        //     page: this.pagination.currentPage,
        //     size: this.pagination.pageSize,
        //     search: this.searchQuery
        //   }
        // })
        // this.apps = response.data.items
        // this.pagination.total = response.data.total

        // 模拟数据
        this.apps = [
          { id: 1, name: '用户管理系统', description: '管理用户信息和权限', createdAt: '2023-01-15T10:30:00Z' },
          { id: 2, name: '订单系统', description: '处理订单和支付', createdAt: '2023-02-20T14:45:00Z' },
          { id: 3, name: '库存管理', description: '管理产品库存', createdAt: '2023-03-10T09:15:00Z' }
        ]
        this.filteredApps = this.apps
        this.pagination.total = this.apps.length
      } catch (error) {
        this.$message.error('获取应用列表失败')
        console.error(error)
      }
    },

    // 处理搜索
    handleSearch() {
      if (!this.searchQuery.trim()) {
        this.filteredApps = this.apps
        return
      }
      this.filteredApps = this.apps.filter(app =>
        app.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    },

    // 清除搜索
    handleSearchClear() {
      this.searchQuery = ''
      this.filteredApps = this.apps
    },

    // 表格选择变化
    handleSelectionChange(val) {
      this.selectedApps = val
    },

    // 显示创建对话框
    showCreateDialog() {
      this.isEditMode = false
      this.currentApp = {
        id: '',
        name: '',
        description: ''
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.appForm && this.$refs.appForm.clearValidate()
      })
    },
    showDetail() {

    },

    // 显示编辑对话框
    handleEdit(app) {
      this.isEditMode = true
      this.currentApp = { ...app }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.appForm && this.$refs.appForm.clearValidate()
      })
    },

    // 提交表单
    submitForm() {
      this.$refs.appForm.validate(async(valid) => {
        if (!valid) return

        try {
          const request = this.isEditMode ? updateApp : createApp
          request(this.currentApp)
            .then(() => {
              this.$message.success(this.isEditMode ? '更新成功' : '创建成功')
              this.dialogVisible = false
              this.listApp()
              // this.fetchDeployments()
            })
            .catch(error => {
              this.$message.error((this.isEditMode ? '更新失败: ' : '创建失败: ') + (error.message || error))
            })
            .finally(() => {
              this.submitLoading = false
            })

          // this.dialogVisible = false
        } catch (error) {
          this.$message.error(this.isEditMode ? '更新应用失败' : '创建应用失败')
          console.error(error)
        }
      })
    },

    // 确认删除单个应用
    confirmDelete(app) {
      this.$confirm(`确定要删除应用 "${app.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteApp(app.id)
      }).catch(() => {})
    },

    // 确认批量删除
    confirmDeleteMultiple() {
      if (this.selectedApps.length === 0) return

      const names = this.selectedApps.map(a => a.name).join(', ')
      this.$confirm(`确定要删除选中的 ${this.selectedApps.length} 个应用吗? (${names})`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteMultipleApps()
      }).catch(() => {})
    },

    // 删除单个应用
    async deleteApp(id) {
      try {
        // await this.$http.delete(`/api/apps/${id}`)

        // 模拟删除
        const index = this.apps.findIndex(a => a.id === id)
        if (index !== -1) {
          this.apps.splice(index, 1)
          this.filteredApps = [...this.apps]
          this.pagination.total -= 1
        }

        this.$message.success('应用删除成功')
      } catch (error) {
        this.$message.error('应用删除失败')
        console.error(error)
      }
    },

    // 批量删除应用
    async deleteMultipleApps() {
      try {
        // const ids = this.selectedApps.map(a => a.id)
        // await this.$http.delete('/api/apps/batch', { data: { ids } })

        // 模拟批量删除
        const ids = this.selectedApps.map(a => a.id)
        this.apps = this.apps.filter(a => !ids.includes(a.id))
        this.filteredApps = [...this.apps]
        this.pagination.total = this.apps.length
        this.selectedApps = []

        this.$message.success(`成功删除 ${ids.length} 个应用`)
      } catch (error) {
        this.$message.error('批量删除失败')
        console.error(error)
      }
    },

    // 分页大小变化
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.fetchApps()
    },

    // 当前页变化
    handleCurrentChange(page) {
      this.pagination.currentPage = page
      this.fetchApps()
    },

    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    }
  }
}
</script>

<style scoped>
.app-management {
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

.el-table {
  margin-top: 20px;
}
</style>
