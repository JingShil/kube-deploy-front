<template>
  <div class="namespace-management">
    <h1>Kubernetes Namespace 管理</h1>

    <div class="operation-bar">
      <el-button type="primary" @click="showCreateDialog = true">
        <i class="el-icon-plus" /> 创建 Namespace
      </el-button>

      <el-input
        v-model="searchQuery"
        placeholder="搜索 Namespace"
        style="width: 300px; margin-left: 20px;"
        clearable
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>

    <el-table
      :data="namespaceResponseList"
      style="width: 100%; margin-top: 20px;"
      border
      stripe
    >
      <el-table-column prop="name" label="名称" sortable />
      <el-table-column prop="status" label="状态" sortable>
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 'Active' ? 'success' : 'danger'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="creationTimestamp" label="创建时间" sortable />
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建 Namespace 对话框 -->
    <el-dialog title="创建 Namespace" :visible.sync="showCreateDialog" width="30%">
      <el-form :model="namespaceRequest" label-width="100px">
        <el-form-item label="名称" required>
          <el-input v-model="namespaceRequest.name" autocomplete="off" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createNamespace(namespaceRequest)">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="showDeleteConfirm"
      width="30%"
    >
      <span>确定要删除 Namespace "{{ namespaceToDelete.name }}" 吗？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showDeleteConfirm = false">取 消</el-button>
        <el-button type="primary" @click="deleteNamespace(namespaceToDelete.name)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { listNamespace, createNamespace, deleteNamespace } from '@/api/k8s/namespace.js'
export default {
  name: 'NamespaceManagement',
  data() {
    return {
      namespaces: [
        { name: 'default', status: 'Active', creationTimestamp: '2023-01-01 10:00:00' },
        { name: 'kube-system', status: 'Active', creationTimestamp: '2023-01-01 10:00:00' },
        { name: 'kube-public', status: 'Active', creationTimestamp: '2023-01-01 10:00:00' },
        { name: 'development', status: 'Active', creationTimestamp: '2023-01-15 14:30:00' },
        { name: 'production', status: 'Terminating', creationTimestamp: '2023-01-10 09:15:00' },
        { name: 'staging', status: 'Active', creationTimestamp: '2023-02-01 11:20:00' },
        { name: 'monitoring', status: 'Active', creationTimestamp: '2023-02-15 16:45:00' }
      ],
      searchQuery: '',
      showCreateDialog: false,
      showDeleteConfirm: false,
      namespaceToDelete: {},
      newNamespace: {
        name: '',
        labels: []
      },
      labelInputVisible: false,
      labelInputValue: '',
      namespaceResponseList: [
        {
          'name': 'example',
          'creationTimestamp': 'example',
          'labels': {
            'example': 'example'
          },
          'status': 'example'
        }
      ],
      namespaceRequest: {
        'name': null
        // "labels": {
        //   "example": "example"
        // },
        // "annotations": {
        //   "example": "example"
        // },
        // "description": "example"
      }
    }
  },
  computed: {
    filteredNamespaces() {
      return this.namespaces.filter(ns =>
        ns.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }

  },
  mounted() {
    this.listNamespace()
  },
  methods: {
    listNamespace() {
      listNamespace().then(response => {
        this.namespaceResponseList = response.data

        // 在这里处理返回的数据
      })
        .catch(error => {
          console.error('Error list namespace:', error)
        // 在这里处理错误
        })
    },
    createNamespace(namespaceRequest) {
      createNamespace(namespaceRequest).then(response => {
        this.showCreateDialog = false
        this.listNamespace()
        // 在这里处理返回的数据
      })
        .catch(error => {
          console.error('Error create namespaces:', error)
        // 在这里处理错误
        })
    },
    deleteNamespace(name) {
      deleteNamespace(name).then(response => {
        this.showDeleteConfirm = false
        this.listNamespace()
        // 在这里处理返回的数据
      })
        .catch(error => {
          console.error('Error delete namespace:', error)
        // 在这里处理错误
        })
    },
    handleDelete(namespace) {
      this.namespaceToDelete = namespace
      this.showDeleteConfirm = true
    },
    confirmDelete() {
      this.namespaces = this.namespaces.filter(ns => ns.name !== this.namespaceToDelete.name)
      this.showDeleteConfirm = false
      this.$message.success(`Namespace ${this.namespaceToDelete.name} 删除成功`)
    },
    // createNamespace() {
    //   if (!this.newNamespace.name) {
    //     this.$message.error('请填写 Namespace 名称')
    //     return
    //   }

    //   if (this.namespaces.some(ns => ns.name === this.newNamespace.name)) {
    //     this.$message.error('该 Namespace 已存在')
    //     return
    //   }

    //   const newNs = {
    //     name: this.newNamespace.name,
    //     status: 'Active',
    //     creationTimestamp: new Date().toLocaleString()
    //   }

    //   this.namespaces.push(newNs)
    //   this.showCreateDialog = false
    //   this.resetNewNamespace()
    //   this.$message.success(`Namespace ${newNs.name} 创建成功`)
    // },
    resetNewNamespace() {
      this.newNamespace = {
        name: '',
        labels: []
      }
    },
    removeLabel(tag) {
      this.newNamespace.labels = this.newNamespace.labels.filter(t => t !== tag)
    },
    showLabelInput() {
      this.labelInputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleLabelInputConfirm() {
      const inputValue = this.labelInputValue
      if (inputValue) {
        // 简单解析 key:value 格式
        const parts = inputValue.split(':')
        if (parts.length === 2) {
          this.newNamespace.labels.push({
            key: parts[0].trim(),
            value: parts[1].trim()
          })
        } else {
          this.$message.warning('请输入 key:value 格式的标签')
        }
      }
      this.labelInputVisible = false
      this.labelInputValue = ''
    }
  }
}
</script>

<style scoped>
.namespace-management {
  padding: 20px;
}

.operation-bar {
  margin: 20px 0;
  display: flex;
  align-items: center;
}

.el-tag {
  margin-right: 10px;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
