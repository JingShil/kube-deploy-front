<template>
  <div class="bind-cluster-container">
    <div class="bind-form">
      <h1>绑定 Kubernetes 集群</h1>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="集群名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入集群名称" />
        </el-form-item>

        <el-form-item label="KubeConfig" prop="kubeconfig">
          <el-input
            v-model="form.kubeconfig"
            type="textarea"
            :rows="10"
            placeholder="请粘贴您的 kubeconfig 文件内容"
            resize="none"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">绑定集群</el-button>
          <el-button @click="cancelBind">取消</el-button>
        </el-form-item>
      </el-form>

      <div class="tips">
        <h3>如何获取 KubeConfig?</h3>
        <p>1. 通常位于 ~/.kube/config 文件中</p>
        <p>2. 或者通过集群管理员获取</p>
        <p>3. 对于云服务商集群，请参考相应文档</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        kubeconfig: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入集群名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        kubeconfig: [
          { required: true, message: '请输入 kubeconfig 内容', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 这里应该是绑定集群的API调用
          this.bindCluster()
        } else {
          return false
        }
      })
    },

    async bindCluster() {
      try {
        // 模拟API调用
        // const response = await this.$api.cluster.bind(this.form);

        // 实际开发中替换为真实API调用
        console.log('提交的集群信息:', this.form)

        // 绑定成功后保存状态
        localStorage.setItem('clusterBound', 'true')
        localStorage.setItem('clusterName', this.form.name)

        this.$message.success('集群绑定成功')
        this.$router.push('/')
      } catch (error) {
        this.$message.error(`绑定失败: ${error.message}`)
      }
    },

    cancelBind() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
.bind-cluster-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.bind-form {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 800px;
}

h1 {
  color: #303133;
  margin-bottom: 30px;
  text-align: center;
}

.tips {
  margin-top: 30px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
  color: #606266;
}

.tips h3 {
  margin-top: 0;
  color: #409eff;
}
</style>
