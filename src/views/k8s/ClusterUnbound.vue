<template>
  <div class="cluster-unbound-container">
    <div class="unbound-card">
      <h1>集群未绑定</h1>
      <div class="description">
        <p>您需要先绑定一个 Kubernetes 集群才能使用完整功能。</p>
        <p>绑定集群后，您可以：</p>
        <ul>
          <li>查看集群资源使用情况</li>
          <li>部署和管理应用</li>
          <li>监控集群运行状态</li>
          <li>接收集群告警通知</li>
        </ul>
      </div>
      <button class="bind-button" @click="goToBindCluster">绑定集群</button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    goToBindCluster() {
      this.$router.push('/k8s/cluster/bind')
    }
  }
}
</script>

<style scoped>
.cluster-unbound-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.unbound-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 600px;
  text-align: center;
}

h1 {
  color: #303133;
  margin-bottom: 20px;
}

.description {
  text-align: left;
  margin: 25px 0;
  color: #606266;
  line-height: 1.6;
}

.description p {
  margin-bottom: 10px;
}

.description ul {
  margin: 15px 0;
  padding-left: 20px;
}

.description li {
  margin-bottom: 8px;
}

.bind-button {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.bind-button:hover {
  background-color: #66b1ff;
}
</style>
