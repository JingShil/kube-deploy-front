<template>
  <div class="service-config-container">
    <el-card class="service-card">
      <div slot="header" class="card-header">
        <span>服务配置</span>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          @click="addServicePort"
        >
          添加端口
        </el-button>
      </div>

      <el-form
        ref="serviceForm"
        :model="form"
        label-position="top"
        class="service-form"
      >
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="服务类型" prop="type">
              <el-select
                v-model="form.type"
                placeholder="请选择服务类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in serviceTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider />

        <div
          v-for="(port, index) in form.ports"
          :key="index"
          class="port-config"
        >
          <el-row :gutter="20">
            <el-col :span="24">
              <div class="port-header">
                <span class="port-title">端口配置 #{{ index + 1 }}</span>
                <el-button
                  v-if="index > 0"
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  circle
                  @click="removeServicePort(index)"
                />
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <!-- <el-col :span="6">
              <el-form-item
                :label="'端口名称'"
                :prop="`ports[${index}].name`"
                :rules="{ required: true, message: '请输入端口名称', trigger: 'blur' }"
              >
                <el-input v-model="port.name" placeholder="例如: http" />
              </el-form-item>
            </el-col> -->

            <el-col :span="6">
              <el-form-item
                :label="'服务端口'"
                :prop="`ports[${index}].port`"
                :rules="{ required: true, message: '请输入服务端口', trigger: 'blur' }"
              >
                <el-input-number
                  v-model="port.port"
                  :min="1"
                  :max="65535"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item
                :label="'目标端口'"
                :prop="`ports[${index}].targetPort`"
                :rules="{ required: true, message: '请输入目标端口', trigger: 'blur' }"
              >
                <el-input-number
                  v-model="port.targetPort"
                  :min="1"
                  :max="65535"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item :label="'协议'">
                <el-select v-model="port.protocol" placeholder="请选择协议" style="width: 100%">
                  <el-option label="TCP" value="TCP" />
                  <el-option label="UDP" value="UDP" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="form.type === 'NodePort'" :gutter="20">
            <el-col :span="6">
              <el-form-item :label="'节点端口'">
                <el-input-number
                  v-model="port.nodePort"
                  :min="30000"
                  :max="32767"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider v-if="index < form.ports.length - 1" />
        </div>
        <div class="form-actions">
          <el-button @click="$emit('prev')">上一步</el-button>
          <el-button type="primary" @click="handleNext">下一步</el-button>
        </div>
      </el-form>
    </el-card>
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
      serviceTypes: [
        { label: 'ClusterIP (集群内部IP)', value: 'ClusterIP' },
        { label: 'NodePort (节点端口)', value: 'NodePort' }
      ]
    }
  },
  created() {
    console.log(this.form)
    if (!this.form) {
      this.form = {
        type: '',
        ports: [{
          'name': '',
          'port': null,
          'targetPort': null,
          'protocol': 'TCP',
          'nodePort': null,
          'portType': null
        }]
      }
    }
    if (!this.form.ports) {
      this.form.ports = [{
        'name': '',
        'port': null,
        'targetPort': null,
        'protocol': 'TCP',
        'nodePort': null,
        'portType': null
      }]
    }
  },
  methods: {
    async handleNext() {
      // try {
      //   // 验证服务配置
      //   const serviceValid = await this.$refs.serviceConfig.validate();

      //   // 验证部署配置
      //   const deployValid = await this.$refs.deployForm.validate();

      //   if (serviceValid && deployValid) {
      //     this.$emit('next');
      //   }
      // } catch (error) {
      //   this.$message.error('请填写完整的配置信息');
      // }
      this.$emit('next')
    },
    addServicePort() {
      this.form.ports.push({
        name: '',
        port: null,
        targetPort: null,
        protocol: 'TCP',
        nodePort: null,
        portType: null
      })
    },
    removeServicePort(index) {
      this.$confirm('确定要删除此端口配置吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.form.ports.splice(index, 1)
      })
    },
    validate() {
      return this.$refs.serviceForm.validate()
    }
  }
}
</script>

<style scoped>
.service-config-container {
  margin: 20px 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.service-form {
  padding: 10px;
}

.port-config {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.port-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.port-title {
  font-weight: bold;
  color: #409EFF;
}

.el-divider {
  margin: 15px 0;
}

.el-form-item {
  margin-bottom: 18px;
}

.form-actions {
  margin-top: 30px;
  text-align: center;
}
</style>
