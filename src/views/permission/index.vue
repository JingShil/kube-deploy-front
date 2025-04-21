<template>
  <div class="user-role-management">
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索用户名称或账号"
        clearable
        @clear="handleSearchClear"
        @keyup.enter="handleSearch"
      >
        <el-button
          slot="append"
          icon="el-icon-search"
          @click="handleSearch"
        />
      </el-input>
    </div>

    <el-table
      v-loading="loading"
      :data="users"
      border
      style="width: 100%"
    >
      <el-table-column
        prop="username"
        label="用户名"
        width="150"
      />
      <el-table-column
        prop="email"
        label="邮箱"
        width="220"
      />
      <el-table-column
        prop="roles[0].name"
        label="角色"
        width="120"
      />
      <el-table-column
        prop="roles[0].description"
        label="角色描述"
      />
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="{row}">
          <el-button
            size="mini"
            type="primary"
            @click="handleEditRole(row)"
          >
            修改角色
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalUsers"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 修改角色对话框 -->
    <el-dialog :visible.sync="dialogVisible" width="500px">
      <el-form :model="currentUser" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="currentUser.username" disabled />
        </el-form-item>
        <el-form-item label="当前角色">
          <el-tag>
            {{ currentUser.roles[0].name }}
          </el-tag>
        </el-form-item>
        <el-form-item label="新角色">
          <el-select v-model="currentRoleId" placeholder="请选择角色" style="width: 100%">
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            >
              <span style="float: left">{{ role.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ role.description }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRoleChange">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { listUserRolePermission, updateUserRolePermission } from '@/api/permission/user'
import { listRolePermission } from '@/api/permission/role'
export default {
  name: 'UserRoleManagement',
  data() {
    return {
      users: [], // 用户列表
      roles: [], // 角色列表
      searchQuery: '', // 搜索关键词
      loading: false,
      currentPage: 1,
      pageSize: 10,
      totalUsers: 0,
      dialogVisible: false,
      currentUser: {
        'email': 'example',
        'userName': 'example',
        'roles': [
          {
            'id': 0,
            'name': 'example',
            'description': 'example',
            'createTime': '2025/4/16 19:28:12',
            'updateTime': '2025/4/16 19:28:12'
          }
        ],
        'permissions': [
          {
            'id': 0,
            'resourceType': 'example',
            'action': 'example',
            'createTime': '2025/4/16 19:28:59',
            'updateTime': '2025/4/16 19:28:59'
          }
        ]
      },
      currentRoleId: null
    }
  },
  computed: {
    // 过滤后的用户列表
    // filteredUsers() {
    //   if (!this.searchQuery) {
    //     return this.users.slice(
    //       (this.currentPage - 1) * this.pageSize,
    //       this.currentPage * this.pageSize
    //     )
    //   }

    //   const query = this.searchQuery.toLowerCase()
    //   return this.users.filter(
    //     user =>
    //       user.username.toLowerCase().includes(query) ||
    //       user.account.toLowerCase().includes(query)
    //   )
    // }
  },
  created() {
    // this.fetchRoles()
    // this.fetchUsers()
    this.getRoles()
    this.getUsers()
  },
  methods: {
    handleEditRole(user) {
      this.dialogVisible = true
      this.currentUser = user
    },
    getUsers() {
      listUserRolePermission().then(response => {
        this.users = response.data

        // this.instanceLoaded = true
        // 在这里处理返回的数据
      })
        .catch(error => {
          console.error('Error fetching cluster resources:', error)
          // 在这里处理错误
        })
    },
    getRoles() {
      listRolePermission().then(response => {
        this.roles = response.data

        // this.instanceLoaded = true
        // 在这里处理返回的数据
      })
        .catch(error => {
          console.error('Error fetching cluster resources:', error)
          // 在这里处理错误
        })
    },
    // 获取角色列表
    async fetchRoles() {
      try {
        const response = await this.$http.get('/api/roles')
        this.roles = response.data
      } catch (error) {
        this.$message.error('获取角色列表失败')
        console.error(error)
      }
    },
    // 获取用户列表
    async fetchUsers() {
      this.loading = true
      try {
        const response = await this.$http.get('/api/users', {
          params: {
            page: this.currentPage,
            size: this.pageSize
          }
        })
        this.users = response.data.items
        this.totalUsers = response.data.total
      } catch (error) {
        this.$message.error('获取用户列表失败')
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    // 修改用户角色
    async handleRoleChange() {
      updateUserRolePermission(this.currentUser.username, this.currentRoleId).then(response => {
        this.$message.success('修改用户角色成功')
        this.getUsers()
        this.dialogVisible = false
        // this.instanceLoaded = true
        // 在这里处理返回的数据
      })
        .catch(error => {
          this.$message.error('修改用户角色失败')
          // 在这里处理错误
        })
    },
    // 搜索用户
    handleSearch() {
      if (this.searchQuery) {
        this.currentPage = 1
        // 在实际项目中，这里应该调用后端搜索API
        // this.fetchUsers()
      }
    },
    // 清除搜索
    handleSearchClear() {
      this.searchQuery = ''
      this.currentPage = 1
      this.fetchUsers()
    },
    // 分页大小变化
    handleSizeChange(size) {
      this.pageSize = size
      this.fetchUsers()
    },
    // 当前页变化
    handleCurrentChange(page) {
      this.currentPage = page
      this.fetchUsers()
    }
  }
}
</script>

<style scoped>
.user-role-management {
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
  width: 400px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
