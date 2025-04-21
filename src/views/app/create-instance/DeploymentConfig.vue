<template>
  <div class="deployment-config">
    <el-form ref="form" :model="form" label-width="180px" :rules="rules">
      <h3>部署配置</h3>
      <el-form-item label="镜像" prop="image">
        <el-input v-model="form.image" placeholder="例如: nginx:latest" />
      </el-form-item>

      <el-form-item label="副本数" prop="replicas">
        <el-input-number v-model="form.replicas" :min="1" />
      </el-form-item>

      <el-divider content-position="left">端口配置</el-divider>
      <div
        v-for="(port, index) in form.ports"
        :key="index"
        class="port-item"
      >
        <!-- <el-form-item
          :label="`端口名称 ${index + 1}`"
          :prop="`ports[${index}].name`"
          :rules="{ required: true, message: '请输入端口名称', trigger: 'blur' }"
        >
          <el-input v-model="port.name" placeholder="例如: http"></el-input>
        </el-form-item> -->
        <el-form-item
          :label="`容器端口 ${index + 1}`"
          :prop="`ports[${index}].containerPort`"
          :rules="{ required: true, message: '请输入容器端口', trigger: 'blur' }"
        >
          <el-input-number v-model="port.containerPort" :min="1" :max="65535" />
        </el-form-item>
        <el-form-item :label="`协议 ${index + 1}`">
          <el-select v-model="port.protocol" placeholder="请选择协议">
            <el-option label="TCP" value="TCP" />
            <el-option label="UDP" value="UDP" />
          </el-select>
        </el-form-item>
        <el-button
          v-if="index > 0"
          type="danger"
          icon="el-icon-delete"
          circle
          @click="removePort(index)"
        />
      </div>
      <el-button type="primary" icon="el-icon-plus" @click="addPort">添加端口</el-button>

      <el-divider content-position="left">资源限制</el-divider>

      <el-form-item label="CPU请求">
        <el-input v-model="cpuRequest" placeholder="例如: 100m" />
      </el-form-item>
      <el-form-item label="内存请求">
        <el-input v-model="memoryRequest" placeholder="例如: 128Mi" />
      </el-form-item>
      <el-form-item label="CPU限制">
        <el-input v-model="cpuLimit" placeholder="例如: 500m" />
      </el-form-item>
      <el-form-item label="内存限制">
        <el-input v-model="memoryLimit" placeholder="例如: 512Mi" />
      </el-form-item>

      <div class="form-actions">
        <el-button @click="$emit('prev')">上一步</el-button>
        <el-button type="primary" @click="validateAndNext">下一步</el-button>
      </div>
    </el-form>
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
  data() {
    return {
      rules: {
        image: [
          { required: true, message: '请输入镜像', trigger: 'blur' }
        ],
        replicas: [
          { required: true, message: '请输入应用实例名称', trigger: 'blur' }
        ],
        deployName: [
          { required: true, message: '请输入应用实例名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        namespace: [
          { required: true, message: '请输入命名空间', trigger: 'blur' }
        ],
        createdBy: [
          { required: true, message: '请输入创建人', trigger: 'blur' }
        ],
        version: [
          { required: true, message: '请输入版本号', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    cpuRequest: {
      get() {
        // 初始化 resource（如果为 null）
        this.$set(this.form, 'resource', this.form.resource || {})
        return this.form.resource.cpuRequest ?? ''
      },
      set(value) {
        this.$set(this.form.resource, 'cpuRequest', value || null)
      }
    },
    cpuLimit: {
      get() {
        // 初始化 resource（如果为 null）
        this.$set(this.form, 'resource', this.form.resource || {})
        return this.form.resource.cpuLimit ?? ''
      },
      set(value) {
        this.$set(this.form.resource, 'cpuLimit', value || null)
      }
    },
    memoryRequest: {
      get() {
        // 初始化 resource（如果为 null）
        this.$set(this.form, 'resource', this.form.resource || {})
        return this.form.resource.memoryRequest ?? ''
      },
      set(value) {
        this.$set(this.form.resource, 'memoryRequest', value || null)
      }
    },
    memoryLimit: {
      get() {
        // 初始化 resource（如果为 null）
        this.$set(this.form, 'resource', this.form.resource || {})
        return this.form.resource.memoryLimit ?? ''
      },
      set(value) {
        this.$set(this.form.resource, 'memoryLimit', value || null)
      }
    }
  },
  created() {
    // if (!this.form.resource){
    //   this.form.resource = {
    //     cpuRequest: '',
    //     memoryRequest: '',
    //     cpuLimit: '',
    //     memoryLimit: '',
    //   }
    // }
    // if (!this.form.healthCheck){
    //   this.form.healthCheck = {
    //     type: '',
    //     path: '',
    //     port: null,
    //     initialDelaySeconds: null,
    //     periodSeconds: null,
    //     timeoutSeconds: null
    //   }
    // }
  },
  methods: {
    addPort() {
      this.form.ports.push({
        name: '',
        containerPort: null,
        protocol: 'TCP'
      })
    },
    removePort(index) {
      this.form.ports.splice(index, 1)
    },
    validateAndNext() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('next')
        } else {
          this.$message.error('请填写完整的部署配置')
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.deployment-config {
  padding: 20px;
}

h3 {
  color: #409EFF;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.port-item {
  position: relative;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.port-item .el-button {
  position: absolute;
  right: 10px;
  top: 10px;
}

.el-divider {
  margin: 30px 0;
}

.form-actions {
  margin-top: 30px;
  text-align: center;
}
</style>
