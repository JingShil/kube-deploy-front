<template>
  <div class="review-config">
    <h3 class="review-title">确认信息</h3>

    <!-- 基础信息卡片 - 改为横向布局 -->
    <el-card class="info-card custom-card">
      <div
        slot="header"
        class="card-header"
      >
        <span>基础信息</span>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">应用名称：</span>
          <span class="info-value">{{ form.appName }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">应用实例名称：</span>
          <span class="info-value">{{ form.name }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">部署名称：</span>
          <span class="info-value">{{ form.deployName }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">命名空间：</span>
          <span class="info-value">{{ form.namespace }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">描述：</span>
          <span class="info-value">{{ form.description || '无' }}</span>
        </div>
      </div>
    </el-card>

    <!-- 部署配置卡片 - 改为横向布局 -->
    <el-card class="info-card custom-card">
      <div
        slot="header"
        class="card-header"
      >
        <span>部署配置</span>
      </div>
      <div class="deploy-grid">
        <div class="deploy-section">
          <h4 class="section-title">基本配置</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">镜像：</span>
              <span class="info-value">{{ form.applicationInstanceReplication.deploymentConfig.image }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">副本数：</span>
              <span class="info-value">{{ form.applicationInstanceReplication.deploymentConfig.replicas }}</span>
            </div>
          </div>
        </div>

        <div class="deploy-section">
          <h4 class="section-title">资源限制</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">CPU请求：</span>
              <span class="info-value">{{ form.applicationInstanceReplication.deploymentConfig.resource.cpuRequest || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">内存请求：</span>
              <span class="info-value">{{ form.applicationInstanceReplication.deploymentConfig.resource.memoryRequest || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">CPU限制：</span>
              <span class="info-value">{{ form.applicationInstanceReplication.deploymentConfig.resource.cpuLimit || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">内存限制：</span>
              <span class="info-value">{{ form.applicationInstanceReplication.deploymentConfig.resource.memoryLimit || '未设置' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 端口配置保持表格形式 -->
      <h4 class="section-title">端口配置</h4>
      <el-table
        :data="form.applicationInstanceReplication.deploymentConfig.ports"
        border
        class="custom-table"
        header-row-class-name="table-header"
      >
        <el-table-column
          prop="containerPort"
          label="容器端口"
          width="120"
        />
        <el-table-column
          prop="protocol"
          label="协议"
          width="120"
        />
      </el-table>
    </el-card>

    <el-card class="info-card custom-card">
      <div
        slot="header"
        class="card-header"
      >
        <span>服务配置</span>
      </div>

      <el-descriptions
        :column="2"
        border
        class="custom-descriptions"
      >
        <el-descriptions-item
          label-class-name="desc-label"
          content-class-name="desc-content"
          label="服务类型"
          :span="2"
        >
          <el-tag :type="getServiceTypeTag(form.applicationInstanceReplication.serviceConfig.type)">
            {{ form.applicationInstanceReplication.serviceConfig.type }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-table
        v-if="form.applicationInstanceReplication.serviceConfig.ports.length > 0"
        :data="form.applicationInstanceReplication.serviceConfig.ports"
        border
        class="custom-table"
        header-row-class-name="table-header"
      >
        <el-table-column
          label="服务端口"
          prop="port"
          width="100"
        />
        <el-table-column
          label="目标端口"
          prop="targetPort"
          width="100"
        />
        <el-table-column
          label="协议"
          prop="protocol"
          width="100"
        >
          <template #default="{row}">
            <el-tag :type="row.protocol === 'TCP' ? '' : 'success'">
              {{ row.protocol }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="hasNodePort"
          label="节点端口"
          prop="nodePort"
          width="120"
        />
      </el-table>
    </el-card>

    <div class="form-actions">
      <el-button
        size="medium"
        @click="$emit('prev')"
      >上一步</el-button>
      <el-button
        type="primary"
        size="medium"
        @click="$emit('submit')"
      >提交</el-button>
    </div>
  </div>
</template>

<script>

export default {

  props: {
    form: {
      type: Object,
      required: true
    }
  },
  computed: {
    hasNodePort() {
      return this.form.applicationInstanceReplication.serviceConfig.type === 'NodePort'
    }
  },
  created() {
    console.log(this.form)
    if (!this.form.applicationInstanceReplication.deploymentConfig) {
      this.form.applicationInstanceReplication.deploymentConfig = {
        image: '',
        replicas: 1,
        ports: [{
          name: '',
          containerPort: null,
          protocol: 'TCP'
        }],
        envVars: {},
        resource: {
          cpuRequest: '',
          memoryRequest: '',
          cpuLimit: '',
          memoryLimit: ''
        },
        healthCheck: {
          type: '',
          path: '',
          port: null,
          initialDelaySeconds: null,
          periodSeconds: null,
          timeoutSeconds: null
        }
      }
    }
    if (!this.form.applicationInstanceReplication.deploymentConfig.resource) {
      this.form.applicationInstanceReplication.deploymentConfig.resource = {
        cpuRequest: '',
        memoryRequest: '',
        cpuLimit: '',
        memoryLimit: ''
      }
    }
    if (!this.form.applicationInstanceReplication.deploymentConfig.healthCheck) {
      this.form.applicationInstanceReplication.deploymentConfig.healthCheck = {
        type: '',
        path: '',
        port: null,
        initialDelaySeconds: null,
        periodSeconds: null,
        timeoutSeconds: null
      }
    }

    if (!this.form.applicationInstanceReplication.serviceConfig) {
      this.form.applicationInstanceReplication.serviceConfig = {
        type: '',
        ports: []
      }
    }
    if (!this.form.applicationInstanceReplication.serviceConfig.ports) {
      this.form.applicationInstanceReplication.serviceConfig.ports = []
    }
  },
  methods: {
    getServiceTypeTag(type) {
      const map = {
        'ClusterIP': '',
        'NodePort': 'warning',
        'LoadBalancer': 'success'
      }
      return map[type] || ''
    },
    isCreateMode() {
      // 方式1：检查路由路径
      return this.$route.path.includes('/create')
    }
  }
}
</script>

<style scoped>
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: baseline;
  line-height: 1.6;
}

.info-label {
  color: #909399;
  min-width: 100px;
  margin-right: 8px;
  font-weight: normal;
}

.info-value {
  color: #606266;
  word-break: break-word;
  flex: 1;
}

.deploy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.deploy-section {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 4px;
}

/* 调整原有样式 */
.custom-card {
  margin-bottom: 24px;
  padding: 20px;
}

.section-title {
  color: #409eff;
  margin: 24px 0 16px;
  font-size: 16px;
  font-weight: 500;
}

.review-config {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.review-title {
  color: #303133;
  margin-bottom: 30px;
  text-align: center;
  font-size: 24px;
  font-weight: 500;
}

.custom-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  border: none;
}

.card-header {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.section-title {
  color: #606266;
  margin: 20px 0 15px;
  font-size: 16px;
  font-weight: 500;
}

.custom-descriptions {
  margin-bottom: 20px;
}

.custom-descriptions >>> .el-descriptions-item__cell {
  padding: 12px 15px;
}

.desc-label {
  background-color: #f5f7fa;
  color: #909399;
  width: 150px;
}

.desc-content {
  color: #606266;
}

.custom-table {
  margin-bottom: 20px;
}

.custom-table >>> .el-table__header {
  background-color: #f5f7fa;
}

.custom-table >>> .el-table__header th {
  background-color: transparent;
  color: #606266;
}

.custom-table >>> .el-table__body tr:hover > td {
  background-color: #f5f7fa !important;
}

.table-header {
  background-color: #f5f7fa;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  gap: 20px;
}

.el-tag {
  font-size: 13px;
}
</style>
