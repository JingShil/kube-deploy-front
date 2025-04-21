<template>
  <div class="app-container">
    <!-- 搜索和操作栏 -->
    <div class="filter-container">
      <el-select
        v-model="listQuery.namespace"
        placeholder="Namespace"
        clearable
        style="width: 200px"
        @change="fetchDeployments"
      >
        <el-option
          v-for="ns in namespaces"
          :key="ns.name"
          :label="ns.name"
          :value="ns.name"
        />
      </el-select>

      <el-input
        v-model="listQuery.name"
        placeholder="Deployment名称"
        style="width: 200px; margin-left: 10px;"
        clearable
        @keyup.enter.native="fetchDeployments"
      />

      <el-button
        type="primary"
        icon="el-icon-search"
        style="margin-left: 10px;"
        @click="fetchDeployments"
      >
        搜索
      </el-button>

      <el-button
        type="success"
        icon="el-icon-plus"
        style="margin-left: 10px;"
        @click="handleCreate"
      >
        创建
      </el-button>
    </div>

    <!-- Deployment表格 -->
    <el-table
      v-loading="listLoading"
      :data="deployments"
      border
      fit
      highlight-current-row
      style="width: 100%; margin-top: 20px;"
    >
      <el-table-column label="名称" prop="name" min-width="150">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Namespace" prop="namespace" width="120">
        <template slot-scope="{row}">
          <el-tag>{{ row.namespace }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="副本数" width="100" align="center">
        <template slot-scope="{row}">
          <span>{{ row.availableReplicas }}/{{ row.replicas }}</span>
        </template>
      </el-table-column>

      <el-table-column label="镜像" prop="image" min-width="200">
        <template slot-scope="{row}">
          <span>{{ row.image }}</span>
          <el-tag v-if="row.imageTag" size="mini" style="margin-left: 5px;">
            {{ row.imageTag }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="创建时间" width="180">
        <template slot-scope="{row}">
          <span>{{ row.creationTimestamp | parseTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="{row}">
          <el-button
            size="mini"
            type="primary"
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
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

    <!-- 创建/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="50%"
      @close="resetForm"
    >
      <el-form
        ref="deploymentForm"
        :model="currentDeployment"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="currentDeployment.name"
            :disabled="isEditMode"
            placeholder="请输入Deployment名称"
          />
        </el-form-item>

        <el-form-item label="Namespace" prop="namespace">
          <el-select
            v-model="currentDeployment.namespace"
            placeholder="请选择Namespace"
            style="width: 100%"
          >
            <el-option
              v-for="ns in namespaces"
              :key="ns.name"
              :label="ns.name"
              :value="ns.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="副本数" prop="replicas">
          <el-input-number
            v-model="currentDeployment.replicas"
            :min="1"
            :max="10"
          />
        </el-form-item>

        <el-form-item label="容器镜像" prop="image">
          <el-input
            v-model="currentDeployment.image"
            placeholder="例如: nginx:1.19"
          />
        </el-form-item>

        <el-form-item label="镜像拉取策略">
          <el-select
            v-model="currentDeployment.imagePullPolicy"
            placeholder="默认 IfNotPresent"
            style="width: 100%"
          >
            <el-option label="IfNotPresent" value="IfNotPresent" />
            <el-option label="Always" value="Always" />
            <el-option label="Never" value="Never" />
          </el-select>
        </el-form-item>

        <el-form-item label="容器端口">
          <el-tag
            v-for="port in currentDeployment.ports"
            :key="port"
            closable
            @close="removePort(port)"
          >
            {{ port }}
          </el-tag>
          <el-input
            v-model="portInput"
            placeholder="输入端口号"
            style="width: 120px; margin-right: 10px;"
          />
          <el-button @click="addPort">添加端口</el-button>
        </el-form-item>

        <el-form-item label="环境变量">
          <div
            v-for="(value, key) in currentDeployment.env"
            :key="key"
            style="margin-bottom: 5px;"
          >
            <el-tag closable @close="removeEnvVar(key)">
              {{ key }}: {{ value }}
            </el-tag>
          </div>
          <div style="display: flex; margin-top: 10px;">
            <el-input
              v-model="envVarKey"
              placeholder="变量名"
              style="width: 120px; margin-right: 10px;"
            />
            <el-input
              v-model="envVarValue"
              placeholder="变量值"
              style="width: 120px; margin-right: 10px;"
            />
            <el-button @click="addEnvVar">添加</el-button>
          </div>
        </el-form-item>

        <el-form-item label="标签">
          <div
            v-for="(value, key) in currentDeployment.labels"
            :key="key"
            style="margin-bottom: 5px;"
          >
            <el-tag closable @close="removeLabel(key)">
              {{ key }}: {{ value }}
            </el-tag>
          </div>
          <div style="display: flex; margin-top: 10px;">
            <el-input
              v-model="labelKey"
              placeholder="标签名"
              style="width: 120px; margin-right: 10px;"
            />
            <el-input
              v-model="labelValue"
              placeholder="标签值"
              style="width: 120px; margin-right: 10px;"
            />
            <el-button @click="addLabel">添加</el-button>
          </div>
        </el-form-item>

        <el-form-item label="资源请求">
          <div style="display: flex;">
            <el-input
              v-model="currentDeployment.resourceRequests.cpu"
              placeholder="CPU (例如: 500m)"
              style="width: 150px; margin-right: 10px;"
            />
            <el-input
              v-model="currentDeployment.resourceRequests.memory"
              placeholder="内存 (例如: 512Mi)"
              style="width: 150px;"
            />
          </div>
        </el-form-item>

        <el-form-item label="资源限制">
          <div style="display: flex;">
            <el-input
              v-model="currentDeployment.resourceLimits.cpu"
              placeholder="CPU (例如: 1000m)"
              style="width: 150px; margin-right: 10px;"
            />
            <el-input
              v-model="currentDeployment.resourceLimits.memory"
              placeholder="内存 (例如: 1Gi)"
              style="width: 150px;"
            />
          </div>
        </el-form-item>

        <el-form-item label="镜像拉取密钥">
          <el-input
            v-model="currentDeployment.imagePullSecret"
            placeholder="可选"
          />
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="submitForm"
        >
          确认
        </el-button>
      </span>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="deleteDialogVisible"
      width="30%"
    >
      <span>确定要删除 Deployment "{{ currentDeployment.name }}" 吗？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          :loading="deleteLoading"
          @click="confirmDelete"
        >
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { listDeployment, createDeployment, updateDeployment, deleteDeployment } from '@/api/k8s/deployment'
import { listNamespace } from '@/api/k8s/namespace'

export default {
  name: 'DeploymentManagement',
  filters: {
    parseTime(time) {
      if (!time || time === 'Unknown(OffsetDateTime)') return '未知'
      return new Date(time).toLocaleString()
    }
  },
  data() {
    return {
      // 列表相关
      deployments: [],
      namespaces: [],
      listLoading: false,
      listQuery: {
        namespace: '',
        name: ''
      },

      // 对话框相关
      dialogVisible: false,
      deleteDialogVisible: false,
      dialogTitle: '',
      isEditMode: false,
      submitLoading: false,
      deleteLoading: false,

      // 当前操作的Deployment
      currentDeployment: {
        namespace: '',
        name: '',
        image: '',
        replicas: 1,
        imagePullPolicy: 'IfNotPresent',
        ports: [],
        env: {},
        labels: {},
        selector: {},
        resourceRequests: {
          cpu: '',
          memory: ''
        },
        resourceLimits: {
          cpu: '',
          memory: ''
        },
        imagePullSecret: ''
      },

      // 表单输入
      portInput: '',
      envVarKey: '',
      envVarValue: '',
      labelKey: '',
      labelValue: '',

      // 表单验证规则
      rules: {
        name: [
          { required: true, message: '请输入Deployment名称', trigger: 'blur' },
          { pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, message: '名称只能包含小写字母、数字和连字符(-)' }
        ],
        namespace: [
          { required: true, message: '请选择Namespace', trigger: 'change' }
        ],
        image: [
          { required: true, message: '请输入容器镜像', trigger: 'blur' }
        ],
        replicas: [
          { required: true, message: '请设置副本数', trigger: 'blur' },
          { type: 'number', min: 1, message: '副本数至少为1', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchNamespaces()
  },
  methods: {
    // 获取Namespace列表
    fetchNamespaces() {
      listNamespace().then(response => {
        this.namespaces = response.data || []
        if (this.namespaces.length > 0 && !this.listQuery.namespace) {
          this.listQuery.namespace = this.namespaces[0].name
        }
        this.fetchDeployments()
      })
    },

    // 获取Deployment列表
    fetchDeployments() {
      this.listLoading = true
      listDeployment(this.listQuery.namespace || 'default')
        .then(response => {
          this.deployments = response.data || []
        })
        .finally(() => {
          this.listLoading = false
        })
    },

    // 打开创建对话框
    handleCreate() {
      this.dialogTitle = '创建 Deployment'
      this.isEditMode = false
      this.dialogVisible = true

      // 默认添加app标签
      this.$nextTick(() => {
        this.resetForm()
      })
    },

    // 打开编辑对话框
    handleEdit(row) {
      this.dialogTitle = '编辑 Deployment'
      this.isEditMode = true
      this.dialogVisible = true

      // 填充表单数据
      this.currentDeployment = {
        namespace: row.namespace,
        name: row.name,
        image: row.image,
        replicas: row.replicas,
        imagePullPolicy: 'IfNotPresent', // 从接口获取或默认
        ports: row.ports || [],
        env: row.env || {},
        labels: row.labels || {},
        selector: { app: row.name }, // 通常selector与labels匹配
        resourceRequests: {
          cpu: '',
          memory: ''
        },
        resourceLimits: {
          cpu: '',
          memory: ''
        },
        imagePullSecret: ''
      }
    },

    // 打开删除确认对话框
    handleDelete(row) {
      this.currentDeployment = {
        namespace: row.namespace,
        name: row.name
      }
      this.deleteDialogVisible = true
    },

    // 确认删除
    confirmDelete() {
      this.deleteLoading = true
      deleteDeployment(this.currentDeployment.namespace, this.currentDeployment.name)
        .then(() => {
          this.$message.success('删除成功')
          this.fetchDeployments()
          this.deleteDialogVisible = false
        })
        .catch(error => {
          this.$message.error('删除失败: ' + (error.message || error))
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },

    // 提交表单（创建/更新）
    submitForm() {
      this.$refs.deploymentForm.validate(valid => {
        if (valid) {
          this.submitLoading = true

          // 确保selector存在
          if (!this.currentDeployment.selector.app) {
            this.currentDeployment.selector.app = this.currentDeployment.name
          }

          // 确保有app标签
          if (!this.currentDeployment.labels.app) {
            this.currentDeployment.labels.app = this.currentDeployment.name
          }

          const request = this.isEditMode ? updateDeployment : createDeployment
          request(this.currentDeployment)
            .then(() => {
              this.$message.success(this.isEditMode ? '更新成功' : '创建成功')
              this.dialogVisible = false
              this.fetchDeployments()
            })
            .catch(error => {
              this.$message.error((this.isEditMode ? '更新失败: ' : '创建失败: ') + (error.message || error))
            })
            .finally(() => {
              this.submitLoading = false
            })
        } else {
          return false
        }
      })
    },

    // 重置表单
    resetForm() {
      this.currentDeployment = {
        namespace: this.listQuery.namespace || (this.namespaces[0]?.name || ''),
        name: '',
        image: '',
        replicas: 1,
        imagePullPolicy: 'IfNotPresent',
        ports: [],
        env: {},
        labels: {},
        selector: {},
        resourceRequests: {
          cpu: '',
          memory: ''
        },
        resourceLimits: {
          cpu: '',
          memory: ''
        },
        imagePullSecret: ''
      }
      this.portInput = ''
      this.envVarKey = ''
      this.envVarValue = ''
      this.labelKey = ''
      this.labelValue = ''
      this.$nextTick(() => {
        this.$refs.deploymentForm?.clearValidate()
      })
    },

    // 添加端口
    addPort() {
      if (this.portInput && !isNaN(this.portInput)) {
        const port = parseInt(this.portInput)
        if (!this.currentDeployment.ports.includes(port)) {
          this.currentDeployment.ports.push(port)
          this.portInput = ''
        } else {
          this.$message.warning('该端口已存在')
        }
      } else {
        this.$message.warning('请输入有效的端口号')
      }
    },

    // 删除端口
    removePort(port) {
      this.currentDeployment.ports = this.currentDeployment.ports.filter(p => p !== port)
    },

    // 添加环境变量
    addEnvVar() {
      if (this.envVarKey && this.envVarValue) {
        this.$set(this.currentDeployment.env, this.envVarKey, this.envVarValue)
        this.envVarKey = ''
        this.envVarValue = ''
      } else {
        this.$message.warning('请输入变量名和变量值')
      }
    },

    // 删除环境变量
    removeEnvVar(key) {
      this.$delete(this.currentDeployment.env, key)
    },

    // 添加标签
    addLabel() {
      if (this.labelKey && this.labelValue) {
        this.$set(this.currentDeployment.labels, this.labelKey, this.labelValue)
        this.labelKey = ''
        this.labelValue = ''
      } else {
        this.$message.warning('请输入标签名和标签值')
      }
    },

    // 删除标签
    removeLabel(key) {
      this.$delete(this.currentDeployment.labels, key)
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
}
.el-tag {
  margin-right: 5px;
}
</style>
