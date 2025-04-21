<template>
  <div class="permission-dashboard">
    <!-- 角色概览卡片 -->
    <div class="role-card">
      <div class="role-header">
        <i class="el-icon-user-solid role-icon" />
        <h2>您的角色: <span class="role-name">{{ role.name }}</span></h2>
      </div>
      <p class="role-description">{{ role.description }}</p>
    </div>

    <!-- 权限能力卡片 -->
    <div class="capability-cards">
      <!-- 页面访问能力 -->
      <div v-if="resourceSet" class="capability-card">
        <div class="capability-header">
          <i class="el-icon-monitor capability-icon" />
          <h3>可以访问的资源</h3>
        </div>
        <div class="capability-content">
          <el-tag
            v-for="resource in resourceSet"
            :key="resource"
            type="success"
            class="permission-tag"
          >
            {{ resource }}
          </el-tag>
        </div>
      </div>

      <!-- 操作能力 -->
      <div v-if="actionSet" class="capability-card">
        <div class="capability-header">
          <i class="el-icon-magic-stick capability-icon" />
          <h3>可以执行的操作</h3>
        </div>
        <div class="capability-content">
          <div
            v-for="action in actionSet"
            :key="action"
            class="action-item"
          >
            <i class="el-icon-check action-icon" />
            <span>{{ action }}</span>
          </div>
        </div>
      </div>

      <!-- 数据权限 -->
      <div v-if="resourceSet" class="capability-card">
        <div class="capability-header">
          <i class="el-icon-data-analysis capability-icon" />
          <h3>可以访问的页面</h3>
        </div>
        <div class="capability-content">
          <el-tag
            v-for="data in resourceSet"
            :key="data"
            type="info"
            class="permission-tag"
          >
            {{ getPageName(data) }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 权限说明 -->
    <div class="permission-footer">
      <p>如需更多权限，请联系系统管理员</p>
      <el-button type="text" @click="showPermissionHelp">
        <i class="el-icon-question" /> 了解权限说明
      </el-button>
    </div>
  </div>
</template>

<script>

// 角色映射表
const ROLE_MAP = {
  admin: {
    name: '系统管理员',
    description: '拥有系统全部权限，可以管理所有内容和用户'
  },
  editor: {
    name: '内容编辑',
    description: '可以创建和编辑内容，但不能管理系统设置和用户'
  },
  viewer: {
    name: '内容查看员',
    description: '只能查看内容，不能进行编辑和删除操作'
  }
}

// 页面名称映射
const PAGE_NAMES = {
  '/dashboard': '控制台',
  '/content/list': '内容列表',
  '/content/edit': '内容编辑',
  '/user': '用户管理'
}

// 资源映射
// const RESOURCE_TYPES = {
//   CLUSTER: 'cluster',
//   K8S_NODE: 'k8s_node',
//   K8S_NAMESPACE: 'k8s_namespace',
//   K8S_DEPLOYMENT: 'k8s_deployment',
//   K8S_SERVICE: 'k8s_service',
//   K8S_SECRET: 'k8s_secret',
//   K8S_CONFIG_MAP: 'k8s_config_map',
//   K8S_POD: 'k8s_pod',
//   PERMISSION: 'permission',
//   APPLICATION: 'application',
//   APPLICATION_INSTANCE: 'application_instance',
//   IMAGE: 'image',
//   OPERATION_LOG: 'operation_log',
//   USER: 'user' // Note: Changed from 'USER' to lowercase for consistency
// }

// ACTION_TYPES = {
//   QUERY: 'query',
//   CREATE: 'create',
//   INSERT: 'insert',
//   DELETE: 'delete',
//   UPDATE: 'update',
//   DEPLOY: 'deploy',
//   ROLLBACK: 'rollback',
//   CONNECT: 'connect',
//   REBOOT: 'reboot',
//   BIND: 'bind',
//   UNBIND: 'unbind',
//   UPLOAD: 'upload',
//   DOWNLOAD: 'download'
// }

// 操作描述映射
const ACTION_DESCRIPTIONS = {
  'content:create': '创建新内容',
  'content:edit': '编辑现有内容',
  'content:delete': '删除内容',
  'user:manage': '管理用户账户'
}

// 数据类型映射
const PAGE_TYPES = {

  'cluster': '集群管理页面',
  'k8s_node': '节点管理页面',
  'k8s_namespace': '命名空间管理页面',
  'k8s_deployment': '工作负载管理页面',
  'k8s_service': '服务管理页面',
  'k8s_pod': '容器管理页面',
  'permission': '权限管理页面',
  'application': '应用管理页面',
  'application_instance': '应用实例管理页面',
  'image': '镜像管理页面',
  'operation_log': '日志管理页面',
  'user': '用户管理页面',
  'k8s_secret': '保密字典管理页面',
  'k8s_config_map': '配置管理页面'
}

export default {
  data() {
    return {
      role: {},
      permissions: [],
      roleInfo: {},
      // permissions: {
      //   pages: [],
      //   actions: [],
      //   data: []
      // }
      resourceSet: [],
      actionSet: []
    }
  },
  created() {
    // this.loadPermissions()
    this.loadRoleAndPermissions()
  },
  methods: {
    loadRoleAndPermissions() {
      const roles = this.$store.state.user.roles
      this.role = this.$store.state.user.roles[0]
      this.permissions = this.$store.state.user.permissions
      this.resourceSet = new Set(this.permissions.map(p => p.resourceType))
      this.actionSet = new Set(this.permissions.map(p => p.action))
      console.log(this.actionSet)
      // console.log(this.$store.state.user.permissions)
    },
    loadPermissions() {
      // 模拟数据 - 实际项目中从API获取
      const role = 'editor'

      this.roleInfo = ROLE_MAP[role] || {
        name: role,
        description: '自定义角色'
      }

      this.permissions = {
        pages: ['/dashboard', '/content/list', '/content/edit'],
        actions: ['content:create', 'content:edit'],
        data: ['news', 'articles']
      }
    },
    getActionDescription(action) {
      return ACTION_DESCRIPTIONS[action] || action
    },
    getDataTypeName(type) {
      return DATA_TYPES[type] || type
    },
    getPageName(type) {
      return PAGE_TYPES[type] || type
    },
    showPermissionHelp() {
      this.$alert('不同角色拥有不同的系统操作权限，具体权限由管理员分配', '权限说明', {
        confirmButtonText: '知道了'
      })
    }
  }
}
</script>

<style scoped>
.permission-dashboard {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

/* 角色卡片样式 */
.role-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.role-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.role-icon {
  font-size: 24px;
  color: #409EFF;
  margin-right: 10px;
}

.role-name {
  color: #409EFF;
  font-weight: bold;
}

.role-description {
  color: #666;
  margin-left: 34px;
  font-size: 15px;
}

/* 能力卡片样式 */
.capability-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.capability-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.capability-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.capability-icon {
  font-size: 20px;
  color: #67C23A;
  margin-right: 10px;
}

.capability-content {
  padding: 5px;
}

.permission-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.action-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.action-icon {
  color: #67C23A;
  margin-right: 8px;
}

/* 页脚样式 */
.permission-footer {
  margin-top: 30px;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>
