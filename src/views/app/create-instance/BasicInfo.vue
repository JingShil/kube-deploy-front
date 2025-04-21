<template>
  <div class="basic-info">
    <el-form ref="form" :model="form" label-width="180px" :rules="rules">
      <h3>基础信息</h3>
      <el-form-item label="应用名称" prop="appName">
        <!-- 创建模式下显示下拉框 -->
        <el-select
          v-if="!isUpdateMode"
          v-model="form.appName"
          placeholder="请选择应用名称"
          clearable
          filterable
          @change="handleAppChange"
        >
          <el-option
            v-for="app in apps"
            :key="app.id"
            :label="app.name"
            :value="app"
          />
        </el-select>

        <!-- 更新模式下显示禁用的输入框 -->
        <el-input
          v-else
          v-model="form.appName"
          placeholder="应用名称（创建后不可修改）"
          disabled
        />
      </el-form-item>
      <el-form-item label="应用实例名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入应用实例名称" :disabled="isUpdateMode" />
      </el-form-item>
      <el-form-item label="部署名称" prop="deployName">
        <el-input v-model="form.deployName" placeholder="请输入部署名称，由英文或者数字组成" :disabled="isUpdateMode" />
      </el-form-item>
      <el-form-item label="命名空间" prop="namespace">
        <!-- 创建模式下显示下拉框 -->
        <el-select
          v-if="!isUpdateMode"
          v-model="form.namespace"
          placeholder="请选择应用名称"
          clearable
          filterable
        >
          <el-option
            v-for="namespace in namespaces"
            :key="namespace.name"
            :label="namespace.name"
            :value="namespace.name"
          />
        </el-select>

        <!-- 更新模式下显示禁用的输入框 -->
        <el-input
          v-else
          v-model="form.appName"
          placeholder="namespace（创建后不可修改）"
          disabled
        />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入应用描述"
        />
      </el-form-item>

      <!-- <el-form-item label="创建人" prop="createdBy">
        <el-input v-model="form.createdBy" placeholder="请输入创建人"></el-input>
      </el-form-item>
      <el-form-item label="版本号" prop="version">
        <el-input-number v-model="form.version" :min="0" :step="1"></el-input-number>
      </el-form-item> -->

      <div class="form-actions">
        <el-button type="primary" @click="validateAndNext">下一步</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { listApp } from '@/api/app/app'
import { listNamespace } from '@/api/k8s/namespace'

export default {
  props: {
    form: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  data() {
    return {
      rules: {
        appName: [
          { required: true, message: '请输入应用名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入应用实例名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
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
      },
      apps: [],
      namespaces: []
    }
  },
  computed: {
    // 判断是否为更新模式（假设通过路由参数或meta判断）
    isUpdateMode() {
      return this.$route.path.includes('/update') || this.$route.query.mode === 'update'
    }
  },
  created() {
    this.listApp()
    this.listNamespace()
  },
  methods: {
    handleAppChange(selectedApp) {
      if (selectedApp) {
        this.form.appName = selectedApp.name
        this.form.appId = selectedApp.id
      } else {
        this.form.appName = ''
        this.form.appId = ''
      }
    },
    listApp() {
      listApp().then(response => {
        this.apps = response.data
        // this.instanceLoaded = true
        // 在这里处理返回的数据
      })
        .catch(error => {
          console.error('Error fetching cluster resources:', error)
        // 在这里处理错误
        })
    },
    listNamespace() {
      listNamespace().then(response => {
        this.namespaces = response.data
        // this.instanceLoaded = true
        // 在这里处理返回的数据
      })
        .catch(error => {
          console.error('Error fetching cluster resources:', error)
        // 在这里处理错误
        })
    },
    validateAndNext() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('next')
        } else {
          this.$message.error('请填写完整的基础信息')
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.basic-info {
  padding: 20px;
}

h3 {
  color: #409EFF;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.form-actions {
  margin-top: 30px;
  text-align: center;
}

.el-form-item {
  margin-bottom: 22px;
}
</style>
