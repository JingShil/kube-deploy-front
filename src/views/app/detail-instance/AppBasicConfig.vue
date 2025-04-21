<template>
  <el-form
    ref="basicInfoForm"
    :model="value"
    label-width="120px"
    @validate="handleValidate"
  >
    <el-form-item
      label="实例名称"
      prop="name"
      :rules="[{ required: true, message: '请输入实例名称', trigger: 'blur' }]"
    >
      <el-input v-model="value.name" />
    </el-form-item>

    <el-form-item
      label="应用ID"
      prop="appId"
      :rules="[{ required: true, message: '请选择应用', trigger: 'blur' }]"
    >
      <el-select v-model="value.appId" filterable placeholder="请选择应用">
        <el-option
          v-for="app in appList"
          :key="app.id"
          :label="app.name"
          :value="app.id"
        />
      </el-select>
    </el-form-item>

    <el-form-item
      label="命名空间"
      prop="namespace"
      :rules="[{ required: true, message: '请输入命名空间', trigger: 'blur' }]"
    >
      <el-input v-model="value.namespace" />
    </el-form-item>

    <el-form-item label="描述">
      <el-input v-model="value.description" type="textarea" :rows="3" />
    </el-form-item>

    <el-form-item label="版本号">
      <el-input-number v-model="value.version" :min="0" />
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'BasicInfo',
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      appList: [] // 从API获取的应用列表
    }
  },
  mounted() {
    this.fetchAppList()
  },
  methods: {
    fetchAppList() {
      // 调用API获取应用列表
      this.$store.dispatch('app/list').then(data => {
        this.appList = data
      })
    },
    handleValidate() {
      this.$refs.basicInfoForm.validate(valid => {
        this.$emit('validate', valid)
      })
    }
  }
}
</script>
