<template>
  <div class="pod-management-container">
    <!-- 筛选区域 -->
    <div class="filter-area">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-select
            v-model="currentNamespace"
            filterable
            clearable
            placeholder="请选择命名空间"
            style="width: 100%"
            @change="handleNamespaceChange"
          >
            <el-option
              v-for="ns in namespaceList"
              :key="ns.name"
              :label="ns.name"
              :value="ns.name"
            />
            <el-option
              label="全部命名空间"
              value=""
            />
          </el-select>
        </el-col>

        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            placeholder="输入Pod名称搜索"
            clearable
            style="width: 100%"
            @clear="handleSearchClear"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button icon="el-icon-search" @click="handleSearch" />
            </template>
          </el-input>
        </el-col>

        <el-col :span="8" style="text-align: right">
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="showCreateDialog()"
          >
            创建Pod
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- Pod列表表格 -->
    <el-table
      v-loading="loading"
      :data="filteredPods"
      border
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column prop="name" label="Pod名称" min-width="150" />
      <el-table-column prop="namespace" label="命名空间" width="120" />
      <el-table-column prop="nodeName" label="节点名称" width="150" />
      <el-table-column prop="phase" label="状态" width="100">
        <template #default="{row}">
          <el-tag :type="getStatusType(row.phase)">
            {{ row.phase }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="podIP" label="IP地址" width="150" />
      <el-table-column label="容器" min-width="200">
        <template #default="{row}">
          <div v-for="container in row.containers" :key="container.name">
            {{ container.name }} ({{ container.image }})
            <el-tag size="mini" :type="container.ready ? 'success' : 'danger'">
              {{ container.ready ? '就绪' : '未就绪' }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{row}">
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建Pod对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建Pod"
      width="50%"
    >
      <el-form
        ref="podFormRef"
        :model="podForm"
        :rules="podRules"
        label-width="120px"
      >
        <el-form-item label="Pod名称" prop="name">
          <el-input v-model="podForm.name" />
        </el-form-item>
        <el-form-item label="命名空间" prop="namespace">
          <el-select v-model="podForm.namespace" placeholder="请选择命名空间">
            <el-option
              v-for="ns in namespaceList"
              :key="ns"
              :label="ns"
              :value="ns"
            />
          </el-select>
        </el-form-item>
        <!-- 其他表单字段可以根据需要添加 -->
        <el-form-item label="容器镜像" prop="containers[0].image">
          <el-input v-model="podForm.containers[0].image" placeholder="例如: nginx:latest" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { listPod, createPod, deletePod } from '@/api/k8s/pod'
import { listNamespace } from '@/api/k8s/namespace'
export default {
  name: 'PodManagement',
  data() {
    return {
      // 筛选相关
      currentNamespace: 'default',
      namespaceList: ['default', 'kube-system', 'kube-public'], // 示例命名空间列表
      searchKeyword: '',

      // Pod列表
      podList: [],
      loading: false,

      // 创建Pod相关
      createDialogVisible: false,
      podForm: {
        name: '',
        namespace: 'default',
        labels: {},
        nodeName: '',
        restartPolicy: 'Always',
        containers: [
          {
            name: '',
            image: '',
            ports: [],
            env: {}
          }
        ]
      },
      podRules: {
        name: [{ required: true, message: '请输入Pod名称', trigger: 'blur' }],
        namespace: [{ required: true, message: '请选择命名空间', trigger: 'change' }],
        'containers[0].image': [{ required: true, message: '请输入容器镜像', trigger: 'blur' }]
      }
    }
  },
  computed: {
    // 过滤后的Pod列表
    filteredPods() {
      return this.podList.filter(pod => {
        const matchesNamespace = this.currentNamespace ? pod.namespace === this.currentNamespace : true
        const matchesSearch = this.searchKeyword ? pod.name.includes(this.searchKeyword) : true
        return matchesNamespace && matchesSearch
      })
    }
  },
  created() {
    // 实际项目中可能需要先获取命名空间列表
    this.fetchNamespace()
  },
  methods: {
    fetchNamespace() {
      listNamespace().then(response => {
        this.namespaceList = response.data

        this.fetchPods()
        // 在这里处理返回的数据
      })
        .catch(error => {
          console.error('Error list namespace:', error)
        // 在这里处理错误
        })
    },
    // 获取Pod列表
    async fetchPods() {
      this.loading = true
      try {
        const res = await listPod(this.currentNamespace || 'default')
        this.podList = res.data
      } catch (error) {
        console.error('获取Pod列表失败:', error)
        this.$message.error('获取Pod列表失败')
      } finally {
        this.loading = false
      }
    },

    // 命名空间变更处理
    handleNamespaceChange() {
      this.fetchPods()
    },

    // 搜索处理
    handleSearch() {
      // 计算属性会自动处理过滤
    },

    // 清除搜索
    handleSearchClear() {
      this.searchKeyword = ''
    },

    // 显示创建对话框
    showCreateDialog() {
      this.podForm = {
        name: '',
        namespace: this.currentNamespace || 'default',
        labels: {},
        nodeName: '',
        restartPolicy: 'Always',
        containers: [
          {
            name: '',
            image: '',
            ports: [],
            env: {}
          }
        ]
      }
      this.createDialogVisible = true
      this.$nextTick(() => {
        this.$refs.podFormRef?.clearValidate()
      })
    },

    // 创建Pod
    async handleCreate() {
      try {
        await this.$refs.podFormRef.validate()
        this.loading = true
        await createPod(this.podForm)
        this.$message.success('Pod创建成功')
        this.createDialogVisible = false
        this.fetchPods()
      } catch (error) {
        if (error.name !== 'ValidationError') {
          console.error('创建Pod失败:', error)
          this.$message.error('创建Pod失败')
        }
      } finally {
        this.loading = false
      }
    },

    // 删除Pod
    async handleDelete(pod) {
      try {
        await this.$confirm(`确定要删除Pod ${pod.name} 吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.loading = true
        await deletePod(pod.namespace, pod.name)
        this.$message.success('Pod删除成功')
        this.fetchPods()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除Pod失败:', error)
          this.$message.error('删除Pod失败')
        }
      } finally {
        this.loading = false
      }
    },

    // 获取状态标签类型
    getStatusType(phase) {
      switch (phase.toLowerCase()) {
        case 'running': return 'success'
        case 'pending': return 'warning'
        case 'failed': return 'danger'
        default: return 'info'
      }
    }
  }
}
</script>

<style scoped>
.pod-management-container {
  padding: 20px;
}
.filter-area {
  margin-bottom: 20px;
}
</style>
