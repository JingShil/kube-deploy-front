<template>
  <div class="operation-log-container">
    <div class="search-form-container">
      <el-form
        :inline="true"
        :model="searchForm"
        class="operation-log-form"
      >
        <!-- 人员搜索 -->
        <el-form-item label="操作人员">
          <el-select
            v-model="searchForm.operator"
            filterable
            clearable
            placeholder="请选择操作人员"
            class="form-item-select"
          >
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <!-- 资源类型搜索 -->
        <el-form-item label="资源类型">
          <el-select
            v-model="searchForm.resourceType"
            clearable
            placeholder="请选择资源类型"
            class="form-item-select"
          >
            <el-option
              v-for="type in resourceTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>

        <!-- 操作类型搜索 -->
        <el-form-item label="操作类型">
          <el-select
            v-model="searchForm.actionType"
            clearable
            placeholder="请选择操作类型"
            class="form-item-select"
          >
            <el-option
              v-for="action in actionTypes"
              :key="action.value"
              :label="action.label"
              :value="action.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item class="form-action-buttons">
          <el-button
            type="primary"
            @click="handleSearch"
          >搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 日志表格 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="operationLogs"
        border
        style="width: 720px; margin: 0 auto"
        class="operation-log-table"
      >
        <el-table-column
          prop="operatorName"
          label="操作人员"
          width="200"
        >
          <template slot-scope="scope">
            {{ formatResourceType(scope.row.username) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="resourceType"
          label="资源名称"
          width="200"
        >
          <template slot-scope="scope">
            {{ formatResourceType(scope.row.resourceType) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="actionType"
          label="操作类型"
          width="120"
        >
          <template slot-scope="scope">
            {{ formatActionType(scope.row.operationType) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="operationTime"
          label="操作时间"
          width="200"
        >
          <template slot-scope="scope">
            {{ formatDate(scope.row.operationTime) }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="pagination.currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { listOperationLog } from '@/api/log/operation-log'
export default {
  data() {
    return {
      searchForm: {
        operator: '',
        resourceType: '',
        actionType: ''
      },
      logs: [], // 原始日志数据
      filteredLogs: [], // 过滤后的日志数据
      userList: [], // 用户列表
      resourceTypes: [
        { value: 'user', label: '用户' },
        { value: 'role', label: '角色' },
        { value: 'permission', label: '权限' },
        { value: 'department', label: '部门' }
      ],
      actionTypes: [
        { value: 'create', label: '创建' },
        { value: 'update', label: '更新' },
        { value: 'delete', label: '删除' },
        { value: 'grant', label: '授权' }
      ],
      loading: false,
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      operationLogs: [{}]
    }
  },
  created() {
    this.fetchLogList()
  },
  methods: {
    fetchLogList() {
      listOperationLog().then(response => {
        this.operationLogs = response.data
      })
        .catch(error => {
          console.error('Error fetching log list:', error)
        })
    },
    fetchUserList() {
      this.$api.getUserList().then(res => {
        this.userList = res.data
      })
    },
    filterLogs() {
      let filtered = [...this.logs]
      if (this.searchForm.operator) {
        filtered = filtered.filter(log => log.operatorId === this.searchForm.operator)
      }
      if (this.searchForm.resourceType) {
        filtered = filtered.filter(log => log.resourceType === this.searchForm.resourceType)
      }
      if (this.searchForm.actionType) {
        filtered = filtered.filter(log => log.actionType === this.searchForm.actionType)
      }
      this.filteredLogs = filtered
    },
    handleSearch() {
      this.pagination.currentPage = 1
      this.fetchLogs()
    },
    resetSearch() {
      this.searchForm = {
        operator: '',
        resourceType: '',
        actionType: ''
      }
      this.handleSearch()
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.fetchLogs()
    },
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.fetchLogs()
    },
    formatResourceType(type) {
      const item = this.resourceTypes.find(item => item.value === type)
      return item ? item.label : type
    },
    formatActionType(type) {
      const item = this.actionTypes.find(item => item.value === type)
      return item ? item.label : type
    },
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleString()
    }
  }
}
</script>

<style scoped lang="scss">
.operation-log-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .search-form-container {
    margin-bottom: 20px;

    .operation-log-form {
      display: flex;
      flex-wrap: wrap;
      align-items: center;

      .el-form-item {
        margin-right: 20px;
        margin-bottom: 15px;

        &:last-child {
          margin-right: 0;
        }
      }

      .form-item-select {
        width: 180px;
      }

      .form-action-buttons {
        margin-left: auto;
      }
    }
  }

  .table-container {
    margin-bottom: 20px;

    .operation-log-table {
      border-radius: 4px;
      overflow: hidden;

      .el-table__header {
        th {
          background-color: #f5f7fa;
          color: #333;
          font-weight: 600;
        }
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
