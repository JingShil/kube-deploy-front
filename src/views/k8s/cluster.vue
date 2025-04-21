<template>
  <div class="cluster-monitor">
    <!-- 顶部指标卡片 -->
    <div class="metric-cards">
      <div class="metric-card node-card">
        <div class="metric-icon">
          <i class="el-icon-cpu" />
        </div>
        <div class="metric-content">
          <h3>节点</h3>
          <div class="metric-value">
            <span class="primary-value">{{ data.clusterOverview.readyNodes }}/{{ data.clusterOverview.totalNodes }}</span>
            <span class="metric-label">Ready</span>
          </div>
        </div>
      </div>

      <div class="metric-card pod-card">
        <div class="metric-icon">
          <i class="el-icon-box" />
        </div>
        <div class="metric-content">
          <h3>Pods</h3>
          <div class="metric-value">
            <span class="primary-value">{{ data.clusterOverview.runningPods }}/{{ data.clusterOverview.totalPods }}</span>
            <span class="metric-label">Running</span>
          </div>
        </div>
      </div>

      <div class="metric-card cpu-card">
        <div class="metric-icon">
          <i class="el-icon-data-line" />
        </div>
        <div class="metric-content">
          <h3>CPU Usage</h3>
          <div class="metric-value">
            <span class="primary-value">{{ data.clusterOverview.cpuUsagePercent.toFixed(1) }}%</span>
            <span class="metric-label">{{ data.clusterOverview.usedCpu.toFixed(2) }}/{{ data.clusterOverview.totalCpu }} cores</span>
          </div>
        </div>
      </div>

      <div class="metric-card memory-card">
        <div class="metric-icon">
          <i class="el-icon-pie-chart" />
        </div>
        <div class="metric-content">
          <h3>Memory Usage</h3>
          <div class="metric-value">
            <span class="primary-value">{{ data.clusterOverview.memoryUsagePercent.toFixed(1) }}%</span>
            <span class="metric-label">{{ formatMemory(data.clusterOverview.usedMemory) }}/{{ formatMemory(data.clusterOverview.totalMemory) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主图表区域 -->
    <div class="chart-area">
      <div class="chart-row">
        <!-- 资源使用环形图 -->
        <div class="chart-container resource-chart">
          <div
            ref="resourceChart"
            style="width: 100%; height: 300px;"
          />
        </div>

        <!-- 工作负载分布 -->
        <div class="chart-container workload-chart">
          <div
            ref="workloadChart"
            style="width: 100%; height: 300px;"
          />
        </div>
      </div>

      <div class="chart-row">
        <!-- Pod状态条形图 -->
        <div class="chart-container pod-chart">
          <div
            ref="podChart"
            style="width: 100%; height: 300px;"
          />
        </div>

        <!-- 资源时间趋势图 (占位) -->
        <div class="chart-container trend-chart">
          <div class="placeholder">
            <i class="el-icon-data-analysis" />
            <p>Resource Trend Monitoring</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'
import { resourceCluster } from '@/api/k8s/cluster.js'
export default {
  props: {
    data: {
      type: Object,
      required: true,
      default: () => ({
        totalNodes: 1,
        readyNodes: 1,
        totalPods: 7,
        runningPods: 5,
        deployments: 4,
        statefulSets: 0,
        totalCpu: 1,
        totalMemory: 3953934336,
        usedCpu: 0.115909656,
        usedMemory: 1117175808,
        cpuUsagePercent: 11.5909656,
        memoryUsagePercent: 28.254789105329237,
        clusterOverview: {
          totalNodes: 1,
          readyNodes: 1,
          totalPods: 7,
          runningPods: 5,
          deployments: 4,
          statefulSets: 0,
          totalCpu: 1,
          totalMemory: 3953934336,
          usedCpu: 0.115909656,
          usedMemory: 1117175808,
          cpuUsagePercent: 11.5909656,
          memoryUsagePercent: 28.254789105329237
        }
      })
    }
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.initResourceChart()
          this.initWorkloadChart()
          this.initPodChart()
        })
      }
    }
  },
  mounted() {
    this.initResourceChart()
    this.initWorkloadChart()
    this.initPodChart()
    window.addEventListener('resize', this.handleResize)
    this.getResource()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    formatMemory(bytes) {
      const gb = bytes / (1024 * 1024 * 1024)
      return gb.toFixed(2) + ' GiB'
    },
    getResource() {
      resourceCluster()
        .then(response => {
          this.clusterOverview = response.data

        // 在这里处理返回的数据
        })
        .catch(error => {
          console.error('Error fetching cluster resources:', error)
        // 在这里处理错误
        })
    },
    handleResize() {
      this.$nextTick(() => {
        this.resourceChart && this.resourceChart.resize()
        this.workloadChart && this.workloadChart.resize()
        this.podChart && this.podChart.resize()
      })
    },
    initResourceChart() {
      this.resourceChart = echarts.init(this.$refs.resourceChart)

      const option = {
        title: {
          text: '资源使用率',
          textStyle: {
            color: '#606266'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c}% ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: ['CPU', 'Memory']
        },
        series: [
          {
            name: 'CPU',
            type: 'pie',
            color: '#409EFF',
            radius: ['50%', '60%'],
            center: ['20%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              {
                value: this.data.cpuUsagePercent,
                name: 'CPU Used',
                itemStyle: { color: '#EBEEF5' }
              },
              {
                value: 100 - this.data.cpuUsagePercent,
                name: 'CPU Free',
                itemStyle: { color: '#409EFF' }
              }
            ]
          },
          {
            name: 'Memory',
            type: 'pie',
            color: '#67C23A',
            radius: ['50%', '60%'],
            center: ['60%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              {
                value: this.data.memoryUsagePercent,
                name: 'Memory Used',
                itemStyle: { color: '#F2F6FC' }
              },
              {
                value: 100 - this.data.memoryUsagePercent,
                name: 'Memory Free',
                itemStyle: { color: '#67C23A' }
              }
            ]
          }
        ]
      }

      this.resourceChart.setOption(option)
    },
    initWorkloadChart() {
      this.workloadChart = echarts.init(this.$refs.workloadChart)

      const option = {
        title: {
          text: '工作负载分布',
          textStyle: {
            color: '#606266'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: ['Deployments', 'StatefulSets', 'Others']
        },
        series: [
          {
            name: 'Workloads',
            type: 'pie',
            radius: '70%',
            center: ['50%', '50%'],
            data: [
              {
                value: this.data.deployments,
                name: 'Deployments',
                itemStyle: { color: '#E6A23C' }
              },
              {
                value: this.data.statefulSets,
                name: 'StatefulSets',
                itemStyle: { color: '#F56C6C' }
              },
              {
                value: 1, // 假设其他类型工作负载为1
                name: 'Others',
                itemStyle: { color: '#909399' }
              }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              formatter: '{b}: {c}'
            }
          }
        ]
      }

      this.workloadChart.setOption(option)
    },
    initPodChart() {
      this.podChart = echarts.init(this.$refs.podChart)

      const option = {
        title: {
          text: 'Pod 状态',
          textStyle: {
            color: '#606266'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          boundaryGap: [0, 0.01]
        },
        yAxis: {
          type: 'category',
          data: ['Running Pods', 'Other Pods']
        },
        series: [
          {
            name: 'Pod Count',
            type: 'bar',
            data: [
              {
                value: this.data.runningPods,
                itemStyle: { color: '#67C23A' }
              },
              {
                value: this.data.totalPods - this.data.runningPods,
                itemStyle: { color: '#F56C6C' }
              }
            ],
            label: {
              show: true,
              position: 'right'
            }
          }
        ]
      }

      this.podChart.setOption(option)
    }
  }
}
</script>

<style scoped>
.cluster-monitor {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.metric-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.metric-card {
  background: white;
  border-radius: 4px;
  padding: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: all 0.3s;
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
}

.metric-icon {
  font-size: 36px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.node-card .metric-icon {
  color: #409eff;
  background-color: #ecf5ff;
}

.pod-card .metric-icon {
  color: #e6a23c;
  background-color: #fdf6ec;
}

.cpu-card .metric-icon {
  color: #f56c6c;
  background-color: #fef0f0;
}

.memory-card .metric-icon {
  color: #67c23a;
  background-color: #f0f9eb;
}

.metric-content h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #909399;
}

.metric-value {
  display: flex;
  align-items: baseline;
}

.primary-value {
  font-size: 24px;
  font-weight: bold;
  margin-right: 8px;
  color: #303133;
}

.metric-label {
  font-size: 12px;
  color: #909399;
}

.chart-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 16px;
}

.chart-container {
  background: white;
  border-radius: 4px;
  padding: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.placeholder i {
  font-size: 50px;
  margin-bottom: 15px;
}

.placeholder p {
  margin: 0;
  font-size: 16px;
}

@media (max-width: 768px) {
  .metric-cards {
    grid-template-columns: 1fr 1fr;
  }

  .chart-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .metric-cards {
    grid-template-columns: 1fr;
  }
}
</style>
