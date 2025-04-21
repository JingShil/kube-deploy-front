<template>
  <div class="instance-detail">
    <!-- 上半部分：基本信息 -->
    <div class="detail-header">
      <el-card shadow="hover">
        <div slot="header" class="clearfix">
          <span>应用实例详情</span>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="goToUpdateApp">更新</el-button>
            <el-button type="success" size="small" @click="handleDeploy">发布</el-button>
            <el-button type="info" size="small" @click="handleRollback">回滚</el-button>
          </div>
        </div>

        <div class="instance-info">
          <!-- 基本信息卡片 -->
          <el-card shadow="hover" class="info-card">
            <div slot="header" class="card-header">
              <span>基本信息</span>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <label>实例ID</label>
                <div class="info-value">{{ instance.id }}</div>
              </div>
              <div class="info-item">
                <label>名称</label>
                <div class="info-value">{{ instance.name }}</div>
              </div>
              <div class="info-item">
                <label>部署名称</label>
                <div class="info-value">{{ instance.deploymentName }}</div>
              </div>
              <div class="info-item">
                <label>命名空间</label>
                <div class="info-value">{{ instance.namespace }}</div>
              </div>
              <!-- 其他基本信息项... -->
            </div>
          </el-card>

          <!-- 资源配置卡片 -->
          <el-card shadow="hover" class="info-card">
            <div slot="header" class="card-header">
              <span>资源配置</span>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <label>镜像</label>
                <div class="info-value">{{ instance.applicationInstanceReplication.deploymentConfig.image }}</div>
              </div>
              <div class="info-item">
                <label>副本数</label>
                <div class="info-value">{{ instance.applicationInstanceReplication.deploymentConfig.replicas }}</div>
              </div>
              <!-- 其他资源配置项... -->
            </div>
          </el-card>
        </div>
      </el-card>
    </div>

    <!-- 下半部分：Pod信息 -->
    <div class="detail-content">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="Pod列表" name="pods">
          <el-table
            v-loading="loading"
            :data="instance.podResponseList"
            style="width: 100%"
            border
            stripe
          >
            <el-table-column prop="name" label="Pod名称" width="180" />
            <el-table-column prop="status" label="状态" width="120">
              <template slot-scope="scope">
                <el-tag :type="podStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="nodeName" label="节点名称" width="150" />
            <el-table-column prop="podIP" label="IP地址" width="150" />
            <el-table-column prop="containers" label="重启次数" width="100">
              <template slot-scope="{row}">
                {{ row.containers && row.containers.restartCount || 0 }}
              </template>
            </el-table-column>
            <el-table-column prop="startTime" label="创建时间" width="150" />
            <el-table-column label="操作" width="250">
              <template slot-scope="scope">
                <el-button size="mini" @click="handlePodLog(scope.row)">日志</el-button>
                <el-button size="mini" type="danger" @click="handlePodDelete(scope.row)">删除</el-button>
                <el-button type="warning" size="small" @click="handleRestart">重启</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="事件" name="events">
          <el-table
            v-loading="loadingEvents"
            :data="events"
            style="width: 100%"
            border
          >
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="reason" label="原因" width="180" />
            <el-table-column prop="message" label="消息" />
            <el-table-column prop="count" label="次数" width="80" />
            <el-table-column prop="lastTimestamp" label="最后时间" width="180" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="配置" name="config">
          <json-viewer
            :value="instance.config"
            :expand-depth="3"
            copyable
            boxed
            sort
          />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { updateAppInstance, detailAppInstance } from '@/api/app/appInstance'
import JsonViewer from 'vue-json-viewer'
import 'vue-json-viewer/style.css'
export default {
  name: 'InstanceDetail',
  components: {
    JsonViewer
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      activeTab: 'pods',
      instance: {
        id: '123',
        name: '124',
        namespace: '1241245',
        description: '1251',
        image: '1251',
        replicas: 1,
        cpuLimit: '12412',
        memoryLimit: '124',
        createTime: '124',
        status: '',
        config: {}
      },
      pods: [],
      events: [],
      loading: false,
      loadingEvents: false
    }
  },
  created() {
    if (this.$route.query.instanceId) {
      this.detailAppInstance(this.$route.query.instanceId)
    } else {
      this.fetchData()
    }
  },
  methods: {
    goToUpdateApp() {
      this.$router.push({
        path: '/app/instance/update',
        query: {
          instanceId: this.$route.query.instanceId
        }
      })
      // this.$router.push('/app/instance/create/basic') // 跳转到创建流程的第一步
    },
    detailAppInstance(id) {
      detailAppInstance(id).then(response => {
        this.instance = response.data
        // 在这里处理返回的数据
      })
        .catch(error => {
          console.error('Error fetching cluster resources:', error)
        // 在这里处理错误
        })
    },
    fetchData() {
      this.loading = true

      // 模拟获取实例详情
      setTimeout(() => {
        this.instance = this.mockInstanceData()
        this.loading = false
      }, 500)

      // 模拟获取Pod列表
      this.fetchPods()

      // 模拟获取事件列表
      this.fetchEvents()
    },
    fetchPods() {
      setTimeout(() => {
        this.pods = this.mockPodData()
      }, 300)
    },
    fetchEvents() {
      this.loadingEvents = true
      setTimeout(() => {
        this.events = this.mockEventData()
        this.loadingEvents = false
      }, 400)
    },

    // 模拟数据生成方法
    mockInstanceData() {
      return {
        id: this.id,
        name: 'my-application',
        namespace: 'default',
        description: '这是一个测试应用实例',
        image: 'nginx:1.21.0',
        replicas: 3,
        cpuLimit: '2',
        memoryLimit: '4Gi',
        createTime: '2023-06-15 10:30:45',
        status: 'Running',
        config: {
          metadata: {
            name: 'my-application',
            namespace: 'default',
            labels: {
              app: 'my-application',
              env: 'production'
            }
          },
          spec: {
            replicas: 3,
            selector: {
              matchLabels: {
                app: 'my-application'
              }
            },
            template: {
              metadata: {
                labels: {
                  app: 'my-application'
                }
              },
              spec: {
                containers: [
                  {
                    name: 'nginx',
                    image: 'nginx:1.21.0',
                    ports: [
                      {
                        containerPort: 80
                      }
                    ],
                    resources: {
                      limits: {
                        cpu: '2',
                        memory: '4Gi'
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    },
    mockPodData() {
      return [
        {
          name: 'my-application-5f8d4c6b7-abcde',
          status: 'Running',
          node: 'node-1',
          ip: '10.244.1.2',
          restarts: 0,
          age: '2d'
        },
        {
          name: 'my-application-5f8d4c6b7-fghij',
          status: 'Running',
          node: 'node-2',
          ip: '10.244.2.3',
          restarts: 1,
          age: '1d'
        },
        {
          name: 'my-application-5f8d4c6b7-klmno',
          status: 'Pending',
          node: 'node-3',
          ip: '10.244.3.4',
          restarts: 0,
          age: '5m'
        }
      ]
    },
    mockEventData() {
      return [
        {
          type: 'Normal',
          reason: 'Scheduled',
          message: 'Successfully assigned default/my-application-5f8d4c6b7-abcde to node-1',
          count: 1,
          lastTimestamp: '2023-06-15 10:31:00'
        },
        {
          type: 'Normal',
          reason: 'Pulling',
          message: 'Pulling image "nginx:1.21.0"',
          count: 1,
          lastTimestamp: '2023-06-15 10:31:30'
        },
        {
          type: 'Normal',
          reason: 'Pulled',
          message: 'Successfully pulled image "nginx:1.21.0"',
          count: 1,
          lastTimestamp: '2023-06-15 10:32:00'
        },
        {
          type: 'Normal',
          reason: 'Created',
          message: 'Created container nginx',
          count: 1,
          lastTimestamp: '2023-06-15 10:32:15'
        },
        {
          type: 'Normal',
          reason: 'Started',
          message: 'Started container nginx',
          count: 1,
          lastTimestamp: '2023-06-15 10:32:20'
        },
        {
          type: 'Warning',
          reason: 'Unhealthy',
          message: 'Liveness probe failed: Get "http://10.244.1.2:80/": dial tcp 10.244.1.2:80: connect: connection refused',
          count: 3,
          lastTimestamp: '2023-06-16 08:15:00'
        }
      ]
    },
    goToUpdateInstance() {
      // this.$router.push({
      //   path: '/app/instance/create/basic',
      //   query: {
      //     instance: JSON.stringify(this.instance),
      //   }
      // })
      // localStorage.setItem("instance", JSON.stringify(this.instance))
      // this.$router.push('/app/instance/create/basic') // 跳转到创建流程的第一步
    },

    statusType(status) {
      const statusMap = {
        'Running': 'success',
        'Pending': 'warning',
        'Failed': 'danger',
        'Succeeded': 'info',
        'Unknown': 'info'
      }
      return statusMap[status] || 'info'
    },
    podStatusType(status) {
      const statusMap = {
        'Running': 'success',
        'Pending': 'warning',
        'Failed': 'danger',
        'Succeeded': 'info',
        'Unknown': 'info',
        'ContainerCreating': 'primary',
        'Terminating': 'danger'
      }
      return statusMap[status] || 'info'
    },
    handleUpdate() {
      this.$router.push({ name: 'UpdateInstance', params: { id: this.id }})
    },
    handleDeploy() {
      this.$confirm('确定要发布此应用实例吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('模拟发布成功')
        this.fetchData()
      }).catch(() => {
        this.$message.info('已取消发布')
      })
    },
    handleRestart() {
      this.$confirm('确定要重启此应用实例吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('模拟重启成功')
        this.fetchData()
      }).catch(() => {
        this.$message.info('已取消重启')
      })
    },
    handleRollback() {
      this.$prompt('请输入要回滚到的版本', '回滚', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[a-zA-Z0-9._-]+$/,
        inputErrorMessage: '版本格式不正确'
      }).then(({ value }) => {
        this.$message.success(`模拟回滚到版本 ${value} 成功`)
        this.fetchData()
      }).catch(() => {
        this.$message.info('已取消回滚')
      })
    },
    handlePodLog(pod) {
      this.$router.push({
        name: 'PodLog',
        params: {
          instanceId: this.id,
          podName: pod.name
        }
      })
    },
    handlePodDelete(pod) {
      this.$confirm(`确定要删除Pod ${pod.name} 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('模拟Pod删除成功')
        this.fetchPods()
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    }
  }
}
</script>

<style scoped>
.instance-detail {
  padding: 20px;
}

.detail-header {
  margin-bottom: 20px;
}

.header-actions {
  float: right;
}

.detail-content {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}

.instance-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.info-card {
  margin-bottom: 0;
}

.card-header {
  font-weight: bold;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  color: #909399;
  font-size: 12px;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  word-break: break-all;
}

/* 状态标签特殊样式 */
.status-tag {
  display: inline-flex;
  align-items: center;
}
</style>
