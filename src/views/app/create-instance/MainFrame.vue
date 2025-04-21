<template>
  <div class="app-container">
    <header class="app-header">
      <h1>应用实例创建系统</h1>
    </header>
    <main class="app-main">
      <el-steps
        :active="activeStep"
        finish-status="success"
      >
        <el-step title="基础信息" />
        <el-step title="Deployment配置" />
        <el-step title="服务配置" />
        <el-step title="确认信息" />
      </el-steps>

      <div class="step-content">
        <BasicInfo
          v-if="activeStep === 0"
          :form="instance"
          @next="handleNext"
        />
        <DeploymentConfig
          v-if="activeStep === 1"
          :form="instance.applicationInstanceReplication.deploymentConfig"
          @next="handleNext"
          @prev="handlePrev"
        />
        <ServiceConfig
          v-if="activeStep === 2"
          :form="instance.applicationInstanceReplication.serviceConfig"
          @next="handleNext"
          @prev="handlePrev"
        />
        <ReviewConfig
          v-if="activeStep === 3 "
          :form="instance"
          @submit="createInstance"
          @prev="handlePrev"
        />
      </div>
    </main>
  </div>
</template>

<script>
import BasicInfo from './BasicInfo.vue'
import DeploymentConfig from './DeploymentConfig.vue'
import ReviewConfig from './ReviewConfig.vue'
import ServiceConfig from './ServiceConfig.vue'
import { detailAppInstance, createAppInstance, updateAppInstance } from '@/api/app/appInstance'

export default {
  components: {
    BasicInfo,
    DeploymentConfig,
    ReviewConfig,
    ServiceConfig
  },
  data() {
    return {
      activeStep: 0,
      instanceId: null,
      oldInstance: null,
      instance: {
        name: '',
        description: '',
        appName: '',
        namespace: '',
        createdBy: '',
        version: 0,
        applicationInstanceReplication: {
          deploymentConfig: {
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
          },
          serviceConfig: {
            type: 'ClusterIP',
            ports: []
          }
        }

      },
      deploymentConfig: {
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
      },
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
      },
      serviceConfig: {
        type: 'ClusterIP',
        ports: []
      },
      containerPort: {
        name: '',
        containerPort: null,
        protocol: 'TCP'
      },
      serverPort: {
        'name': '',
        'port': null,
        'targetPort': null,
        'protocol': 'TCP',
        'nodePort': null,
        'portType': ''
      },
      instanceLoaded: false
    }
  },
  created() {
    this.instanceId = this.$route.query.instanceId
    if (this.instanceId) {
      this.getDetailInstance(this.instanceId)
    }
  },
  methods: {
    isCreateMode() {
      // 方式1：检查路由路径
      return this.$route.path.includes('/create')
    },
    createInstance() {
      if (this.isCreateMode()) {
        const username = this.$store.state.user.name
        this.instance.createdBy = username
        createAppInstance(this.instance).then(response => {
          this.$router.push({
            path: '/app/instance/detail',
            query: {
              instanceId: response.data
            }
          })
          // this.instanceLoaded = true
          // 在这里处理返回的数据
        })
          .catch(error => {
            console.error('Error fetching cluster resources:', error)
          // 在这里处理错误
          })
      } else {
        console.log('update')
        updateAppInstance(this.instance).then(response => {
          this.$router.push({
            path: '/app/instance/detail',
            query: {
              instanceId: this.$route.query.instanceId
            }
          })
        // this.instanceLoaded = true
        // 在这里处理返回的数据
        })
          .catch(error => {
            console.error('Error fetching cluster resources:', error)
            // 在这里处理错误
          })
      }
    },
    getDetailInstance(id) {
      detailAppInstance(id).then(response => {
        this.instance = response.data

        this.oldInstance = response.data
        this.deploymentConfig = this.instance.applicationInstanceReplication.deploymentConfig
        this.serviceConfig = this.instance.applicationInstanceReplication.serviceConfig
        this.resource = this.deploymentConfig.resource
        this.healthCheck = this.deploymentConfig.healthCheck
        // this.instanceLoaded = true
        // 在这里处理返回的数据
      })
        .catch(error => {
          console.error('Error fetching cluster resources:', error)
          // 在这里处理错误
        })
    },
    handleNext() {
      if (this.activeStep < 3) {
        this.activeStep++
      }
    },
    handlePrev() {
      if (this.activeStep > 0) {
        this.activeStep--
      }
    },
    handleSubmit() {
      this.$message.success('应用实例创建成功！')
      console.log('提交数据:', this.form)
      // 这里可以添加API调用
    }
  }
}
</script>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    Arial, sans-serif;
}

.app-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.app-header h1 {
  color: #409eff;
  font-weight: 500;
}

.app-main {
  background: #fff;
  padding: 30px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.step-content {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.el-steps {
  margin-bottom: 20px;
}
</style>
