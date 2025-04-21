<template>
  <div class="k8s-node-management">
    <h1>Kubernetes Node 管理</h1>

    <div class="control-panel">
      <el-button type="primary" @click="refreshNodes">刷新</el-button>
      <el-button type="success" @click="showAddDialog = true">添加节点</el-button>
      <el-button type="danger" :disabled="selectedNodes.length === 0" @click="batchDelete">批量删除</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="nodeList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="节点名称" width="180" />
      <el-table-column prop="status" label="状态" width="120">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="ip" label="IP地址" />
      <!-- <el-table-column prop="cpu" label="CPU" />
      <el-table-column prop="memory" label="内存" /> -->
      <el-table-column prop="osImage" label="操作系统" />
      <el-table-column prop="kubeletVersion" label="Kubelet版本" />
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <el-button size="mini" @click="editNode(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="deleteNode(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑节点对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="showAddDialog" width="30%">
      <el-form :model="currentNode" label-width="100px">
        <el-form-item label="节点名称">
          <el-input v-model="currentNode.name" />
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input v-model="currentNode.ip" />
        </el-form-item>
        <el-form-item label="CPU">
          <el-input v-model="currentNode.cpu" />
        </el-form-item>
        <el-form-item label="内存">
          <el-input v-model="currentNode.memory" />
        </el-form-item>
        <el-form-item label="操作系统">
          <el-input v-model="currentNode.os" />
        </el-form-item>
        <el-form-item label="Kubelet版本">
          <el-input v-model="currentNode.kubeletVersion" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddDialog = false">取 消</el-button>
        <el-button type="primary" @click="saveNode">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { listNode } from '@/api/k8s/node.js'

export default {
  name: 'K8sNodeManagement',
  data() {
    return {
      loading: false,
      nodes: [],
      selectedNodes: [],
      showAddDialog: false,
      isEditMode: false,
      currentNode: {
        name: '',
        ip: '',
        cpu: '',
        memory: '',
        os: '',
        kubeletVersion: '',
        status: 'Ready'
      },
      // 模拟数据
      mockNodes: [
        {
          name: 'node-1',
          status: 'Ready',
          ip: '192.168.1.101',
          cpu: '4 Core',
          memory: '16GB',
          os: 'Ubuntu 20.04',
          kubeletVersion: 'v1.22.5'
        },
        {
          name: 'node-2',
          status: 'Ready',
          ip: '192.168.1.102',
          cpu: '8 Core',
          memory: '32GB',
          os: 'CentOS 7.9',
          kubeletVersion: 'v1.22.5'
        },
        {
          name: 'node-3',
          status: 'NotReady',
          ip: '192.168.1.103',
          cpu: '2 Core',
          memory: '8GB',
          os: 'Ubuntu 18.04',
          kubeletVersion: 'v1.22.4'
        },
        {
          name: 'node-4',
          status: 'Ready',
          ip: '192.168.1.104',
          cpu: '16 Core',
          memory: '64GB',
          os: 'CentOS 8.2',
          kubeletVersion: 'v1.22.5'
        }
      ],
      nodeList: [
        {
          'name': 'example',
          'status': 'example',
          'ip': 'example',
          'osImage': 'example',
          'kubeletVersion': 'example'
        }
      ]
    }
  },
  computed: {
    dialogTitle() {
      return this.isEditMode ? '编辑节点' : '添加节点'
    }
  },
  created() {
    this.refreshNodes()
    this.listNode()
  },
  methods: {
    listNode() {
      listNode().then(response => {
        this.nodeList = response.data

        // 在这里处理返回的数据
      })
        .catch(error => {
          console.error('Error list node:', error)
        })
    },
    refreshNodes() {
      this.loading = true
      // 模拟异步请求
      setTimeout(() => {
        this.nodes = JSON.parse(JSON.stringify(this.mockNodes))
        this.loading = false
      }, 800)
    },
    handleSelectionChange(val) {
      this.selectedNodes = val
    },
    getStatusType(status) {
      switch (status) {
        case 'Ready': return 'success'
        case 'NotReady': return 'danger'
        default: return 'info'
      }
    },
    editNode(node) {
      this.currentNode = JSON.parse(JSON.stringify(node))
      this.isEditMode = true
      this.showAddDialog = true
    },
    deleteNode(node) {
      this.$confirm(`确定要删除节点 ${node.name} 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.mockNodes = this.mockNodes.filter(n => n.name !== node.name)
        this.refreshNodes()
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    batchDelete() {
      const names = this.selectedNodes.map(n => n.name).join(', ')
      this.$confirm(`确定要删除选中的节点 ${names} 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.mockNodes = this.mockNodes.filter(n => !this.selectedNodes.some(sn => sn.name === n.name))
        this.refreshNodes()
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    saveNode() {
      if (this.isEditMode) {
        // 更新现有节点
        const index = this.mockNodes.findIndex(n => n.name === this.currentNode.name)
        if (index !== -1) {
          this.mockNodes.splice(index, 1, JSON.parse(JSON.stringify(this.currentNode)))
        }
      } else {
        // 添加新节点
        this.mockNodes.push(JSON.parse(JSON.stringify(this.currentNode)))
      }
      this.refreshNodes()
      this.showAddDialog = false
      this.resetCurrentNode()
      this.$message({
        type: 'success',
        message: '操作成功!'
      })
    },
    resetCurrentNode() {
      this.currentNode = {
        name: '',
        ip: '',
        cpu: '',
        memory: '',
        os: '',
        kubeletVersion: '',
        status: 'Ready'
      }
      this.isEditMode = false
    }
  }
}
</script>

<style scoped>
.k8s-node-management {
  padding: 20px;
}

.control-panel {
  margin-bottom: 20px;
}
</style>
