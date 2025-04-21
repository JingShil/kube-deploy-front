<template>
  <div class="platform-home">
    <!-- 顶部导航 -->

    <!-- 主内容区 -->
    <main class="platform-main">
      <!-- 平台介绍 -->
      <section class="intro-section">
        <div class="intro-content">
          <h2>轻量级K3s驱动的云原生应用管理平台</h2>
          <p class="intro-description">
            基于轻量级Kubernetes发行版K3s构建，提供从开发到生产的一站式应用部署与管理解决方案。
            简化云原生应用部署流程，提升交付效率，降低运维复杂度。
          </p>
          <div class="stats-container">
            <div class="stat-item">
              <div class="stat-value">12</div>
              <div class="stat-label">已连接集群</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">56</div>
              <div class="stat-label">运行中应用</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">328</div>
              <div class="stat-label">总发布次数</div>
            </div>
          </div>
        </div>
        <div class="intro-image">
          <img
            src="@/assets/k8s_images/k3s系统构想图1.png"
            alt="K3s架构图"
          >
        </div>
      </section>

      <!-- 快速入口 -->
      <section class="quick-actions">
        <h3 class="section-title">快速开始</h3>
        <div class="action-steps">
          <div
            class="step-card"
            @click="goToCluster"
          >
            <div class="step-number">1</div>
            <div class="step-content">
              <i class="el-icon-connection step-icon" />
              <h4>绑定集群</h4>
              <p>连接您的K3s集群到平台</p>
            </div>
          </div>
          <div class="step-arrow">→</div>
          <div
            class="step-card"
            @click="goToAppCreate"
          >
            <div class="step-number">2</div>
            <div class="step-content">
              <i class="el-icon-folder-opened step-icon" />
              <h4>创建应用</h4>
              <p>定义应用基本信息</p>
            </div>
          </div>
          <div class="step-arrow">→</div>
          <div
            class="step-card"
            @click="goToImageCreate"
          >
            <div class="step-number">3</div>
            <div class="step-content">
              <i class="el-icon-picture-outline step-icon" />
              <h4>创建镜像</h4>
              <p>构建或上传容器镜像</p>
            </div>
          </div>
          <div class="step-arrow">→</div>
          <div
            class="step-card"
            @click="goToInstanceCreate"
          >
            <div class="step-number">4</div>
            <div class="step-content">
              <i class="el-icon-cpu step-icon" />
              <h4>创建实例</h4>
              <p>配置应用部署规格</p>
            </div>
          </div>
          <div class="step-arrow">→</div>
          <div
            class="step-card"
            @click="goToReleaseCreate"
          >
            <div class="step-number">5</div>
            <div class="step-content">
              <i class="el-icon-ship step-icon" />
              <h4>创建发布单</h4>
              <p>准备应用发布</p>
            </div>
          </div>
          <div class="step-arrow">→</div>
          <div
            class="step-card"
            @click="goToDeploy"
          >
            <div class="step-number">6</div>
            <div class="step-content">
              <i class="el-icon-success step-icon" />
              <h4>发布</h4>
              <p>将应用部署到集群</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 最近活动 -->
      <section class="recent-activity">
        <h3 class="section-title">最近活动</h3>
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in activities"
            :key="index"
            :timestamp="activity.time"
            :type="activity.type"
            :color="activity.color"
          >
            {{ activity.content }}
          </el-timeline-item>
        </el-timeline>
      </section>
    </main>

    <!-- 平台特性 -->
    <section class="features-section">
      <h3 class="section-title">平台核心特性</h3>
      <div class="features-grid">
        <div class="feature-card">
          <i class="el-icon-lightning feature-icon" />
          <h4>轻量高效</h4>
          <p>基于K3s的轻量级架构，资源消耗低，启动速度快</p>
        </div>
        <div class="feature-card">
          <i class="el-icon-set-up feature-icon" />
          <h4>简化部署</h4>
          <p>直观的部署流程，5分钟完成应用从开发到生产的部署</p>
        </div>
        <div class="feature-card">
          <i class="el-icon-guide feature-icon" />
          <h4>多集群管理</h4>
          <p>统一管理多个K3s集群，实现跨集群应用部署</p>
        </div>
        <div class="feature-card">
          <i class="el-icon-monitor feature-icon" />
          <h4>可视化监控</h4>
          <p>内置应用监控面板，实时掌握应用运行状态</p>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="platform-footer">
      <div class="footer-links">
        <a href="#">文档中心</a>
        <a href="#">API参考</a>
        <a href="#">社区支持</a>
        <a href="#">关于我们</a>
      </div>
      <div class="copyright">
        © 2023 K3s云原生平台 - 基于Rancher K3s构建
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: {
        name: '管理员'
        // avatar: require('@/assets/default-avatar.png')
      },
      activities: [
        {
          time: '2023-05-15 14:30',
          content: '用户张三发布了应用订单服务 v1.2.0',
          type: 'primary',
          color: '#409EFF'
        },
        {
          time: '2023-05-15 13:45',
          content: '集群k3s-prod-01节点扩容完成',
          type: 'success',
          color: '#67C23A'
        },
        {
          time: '2023-05-15 11:20',
          content: '新集群k3s-dev-02成功接入',
          type: 'info',
          color: '#909399'
        }
      ]
    }
  },
  methods: {
    goToCluster() {
      this.$router.push('/k8s/cluster/bind')
    },
    goToAppCreate() {
      this.$router.push('/app/application')
    },
    goToImageCreate() {
      this.$router.push('/app/image')
    },
    goToInstanceCreate() {
      this.$router.push('/app/instance/create')
    },
    goToReleaseCreate() {
      this.$router.push('/app/deploy')
    },
    goToDeploy() {
      this.$router.push('/app/deploy')
    }
  }
}
</script>

<style scoped>
.platform-home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

/* 头部样式 */
.platform-header {
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.logo-area {
  display: flex;
  align-items: center;
}

.logo-area img {
  height: 36px;
  margin-right: 12px;
}

.logo-area h1 {
  font-size: 18px;
  color: #303133;
  margin: 0;
}

.user-area {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.el-dropdown-link .el-avatar {
  margin-right: 8px;
}

/* 主内容区样式 */
.platform-main {
  flex: 1;
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  width: 100%;
}

.section-title {
  color: #303133;
  margin: 30px 0 20px;
  font-size: 20px;
}

/* 平台介绍区域 */
.intro-section {
  display: flex;
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.intro-content {
  flex: 1;
}

.intro-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.intro-image img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
}

.intro-description {
  color: #606266;
  line-height: 1.6;
  margin: 20px 0;
}

.stats-container {
  display: flex;
  margin-top: 30px;
}

.stat-item {
  text-align: center;
  padding: 0 20px;
  border-right: 1px solid #ebeef5;
}

.stat-item:last-child {
  border-right: none;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

/* 快速入口样式 */
.quick-actions {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.action-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.step-card {
  flex: 1;
  min-width: 120px;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  margin: 0 5px;
}

.step-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.1);
  background: #f0f7ff;
}

.step-number {
  width: 30px;
  height: 30px;
  line-height: 30px;
  background: #409eff;
  color: #fff;
  border-radius: 50%;
  margin: 0 auto 10px;
  font-weight: bold;
}

.step-icon {
  font-size: 24px;
  color: #409eff;
  margin-bottom: 10px;
}

.step-card h4 {
  margin: 5px 0;
  color: #303133;
}

.step-card p {
  margin: 0;
  color: #909399;
  font-size: 12px;
}

.step-arrow {
  color: #c0c4cc;
  font-size: 20px;
  padding: 0 5px;
}

/* 最近活动样式 */
.recent-activity {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 特性区域样式 */
.features-section {
  background: #fff;
  padding: 40px 20px;
  margin-top: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  padding: 30px 20px;
  border-radius: 8px;
  background: #f9f9f9;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 36px;
  color: #409eff;
  margin-bottom: 15px;
}

.feature-card h4 {
  margin: 10px 0;
  color: #303133;
}

.feature-card p {
  color: #606266;
  margin: 0;
  font-size: 14px;
}

/* 页脚样式 */
.platform-footer {
  background: #303133;
  color: #fff;
  padding: 20px;
  text-align: center;
}

.footer-links {
  margin-bottom: 15px;
}

.footer-links a {
  color: #fff;
  margin: 0 15px;
  text-decoration: none;
}

.footer-links a:hover {
  text-decoration: underline;
}

.copyright {
  color: #909399;
  font-size: 14px;
}
</style>
