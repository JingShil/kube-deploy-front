<template>
  <div class="service-management">

    <div class="namespace-selector">
      <el-select v-model="currentNamespace" placeholder="请选择命名空间" @change="fetchServices">
        <el-option
          v-for="ns in namespaces"
          :key="ns.name"
          :label="ns.name"
          :value="ns.name"
        />
      </el-select>
      <el-button type="primary" @click="showCreateDialog">创建Service</el-button>
    </div>

    <el-table :data="services" border style="width: 100%">
      <el-table-column prop="name" label="Name" width="180" />
      <el-table-column prop="namespace" label="Namespace" width="120" />
      <el-table-column prop="type" label="Type" width="120" />
      <el-table-column prop="clusterIP" label="Cluster IP" width="150" />
      <el-table-column label="Ports" width="200">
        <template #default="{row}">
          <div v-for="(port, index) in row.ports" :key="index">
            {{ port.port }}{{ port.protocol ? '/'+port.protocol : '' }} → {{ port.targetPort }}
            <span v-if="port.nodePort">(Node: {{ port.nodePort }})</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="180">
        <template #default="{row}">
          <el-button size="small" @click="editService(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteService(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50%">
      <el-form :model="serviceForm" label-width="120px">
        <el-form-item label="Service Name" required>
          <el-input v-model="serviceForm.name" />
        </el-form-item>
        <el-form-item label="Namespace">
          <el-select v-model="serviceForm.namespace" placeholder="Select namespace">
            <el-option
              v-for="ns in namespaces"
              :key="ns"
              :label="ns"
              :value="ns"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Service Type">
          <el-select v-model="serviceForm.type" placeholder="Select type">
            <el-option label="ClusterIP" value="ClusterIP" />
            <el-option label="NodePort" value="NodePort" />
            <el-option label="LoadBalancer" value="LoadBalancer" />
          </el-select>
        </el-form-item>
        <el-form-item label="Selector" required>
          <div v-for="(value, key, index) in serviceForm.selector" :key="key" class="selector-item">
            <el-input v-model="serviceForm.selector[key]" placeholder="value" style="width: 200px">
              <template #prepend>{{ key }}</template>
            </el-input>
            <el-button icon="el-icon-delete" @click="removeSelector(key)" />
          </div>
          <el-button @click="addSelector">Add Selector</el-button>
        </el-form-item>
        <el-form-item label="Ports" required>
          <div v-for="(port, index) in serviceForm.ports" :key="index" class="port-item">
            <el-input-number v-model="port.port" placeholder="Port" :min="1" :max="65535" />
            <el-input-number v-model="port.targetPort" placeholder="Target Port" :min="1" :max="65535" />
            <el-input v-model="port.protocol" placeholder="Protocol (TCP/UDP)" style="width: 120px" />
            <el-button icon="el-icon-delete" @click="removePort(index)" />
          </div>
          <el-button @click="addPort">Add Port</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitService">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { listService, createService, deleteService } from '@/api/k8s/service'
import { listNamespace } from '@/api/k8s/namespace'
export default {
  name: 'ServiceManagement',
  data() {
    return {
      currentNamespace: 'default',
      namespaces: [],
      services: [],
      dialogVisible: false,
      isEditMode: false,
      serviceForm: {
        name: '',
        namespace: 'default',
        type: 'ClusterIP',
        selector: {},
        ports: []
      },
      dialogTitle: 'Create Service'
    }
  },
  created() {
    this.fetchNamespaces()
    this.fetchServices()
  },
  methods: {
    async fetchNamespaces() {
      try {
        const response = await listNamespace()
        this.namespaces = response.data
      } catch (error) {
        this.$message.error('Failed to fetch namespaces: ' + error.message)
      }
    },
    async fetchServices() {
      try {
        const response = await listService(this.currentNamespace)
        this.services = response.data
      } catch (error) {
        this.$message.error('Failed to fetch services: ' + error.message)
      }
    },
    showCreateDialog() {
      this.isEditMode = false
      this.dialogTitle = 'Create Service'
      this.serviceForm = {
        name: '',
        namespace: this.currentNamespace,
        type: 'ClusterIP',
        selector: {},
        ports: []
      }
      this.dialogVisible = true
    },
    editService(service) {
      this.isEditMode = true
      this.dialogTitle = 'Edit Service'
      this.serviceForm = JSON.parse(JSON.stringify(service))
      this.dialogVisible = true
    },
    async deleteService(service) {
      try {
        await this.$confirm(`Delete service ${service.name}?`, 'Warning', {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
        await deleteService(service.namespace, service.name)
        this.$message.success('Service deleted successfully')
        this.fetchServices()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('Failed to delete service: ' + error.message)
        }
      }
    },
    addSelector() {
      const newKey = `key${Object.keys(this.serviceForm.selector).length + 1}`
      this.$set(this.serviceForm.selector, newKey, 'value')
    },
    removeSelector(key) {
      this.$delete(this.serviceForm.selector, key)
    },
    addPort() {
      this.serviceForm.ports.push({
        name: '',
        port: 80,
        targetPort: 80,
        protocol: 'TCP'
      })
    },
    removePort(index) {
      this.serviceForm.ports.splice(index, 1)
    },
    async submitService() {
      try {
        // Validate form
        if (!this.serviceForm.name) {
          this.$message.error('Service name is required')
          return
        }
        if (Object.keys(this.serviceForm.selector).length === 0) {
          this.$message.error('At least one selector is required')
          return
        }
        if (this.serviceForm.ports.length === 0) {
          this.$message.error('At least one port is required')
          return
        }

        // Prepare request data
        const requestData = {
          name: this.serviceForm.name,
          namespace: this.serviceForm.namespace,
          type: this.serviceForm.type,
          selector: this.serviceForm.selector,
          ports: this.serviceForm.ports.map(port => ({
            name: port.name || undefined,
            port: port.port,
            targetPort: port.targetPort || port.port,
            protocol: port.protocol || 'TCP',
            nodePort: port.nodePort || undefined
          }))
        }

        if (this.isEditMode) {
          // TODO: Implement update if your API supports it
          // await updateService(requestData)
          this.$message.success('Service updated successfully')
        } else {
          await createService(requestData)
          this.$message.success('Service created successfully')
        }

        this.dialogVisible = false
        this.fetchServices()
      } catch (error) {
        this.$message.error('Operation failed: ' + error.message)
      }
    }
  }
}
</script>

<style scoped>
.namespace-selector {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}
.selector-item, .port-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
</style>
