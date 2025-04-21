<template>
  <div class="image-repository">
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索镜像名称或应用名称"
        clearable
        style="width: 400px"
        @clear="handleSearchClear"
        @keyup.enter.native="handleSearch"
      >
        <el-button slot="append" icon="el-icon-search" @click="handleSearch" />
      </el-input>

      <div class="action-buttons">
        <el-button type="primary" icon="el-icon-plus" @click="showCreateDialog">创建镜像</el-button>
      </div>
    </div>

    <!-- 镜像列表 -->
    <el-table
      v-loading="loading"
      :data="imageList"
      style="width: 100%"
      border
    >
      <el-table-column
        prop="name"
        label="镜像名称"
        width="220"
      >
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <div>
              <p>仓库地址: {{ scope.row.repository }}</p>
              <p>全称: {{ scope.row.fullName }}</p>
            </div>
            <div slot="reference" class="name-wrapper">
              <el-tag size="medium">{{ scope.row.name }}</el-tag>
            </div>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column
        prop="appName"
        label="所属应用"
        width="180"
      />

      <el-table-column
        label="最新版本"
      >
        <template slot-scope="scope">
          <div class="latest-version">
            <el-tag type="success" size="small">{{ scope.row.latestTag }}</el-tag>
            <span class="version-date">{{ formatDate(scope.row.latestVersionTime) }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="版本数量"
        width="100"
      >
        <template slot-scope="scope">
          <el-tag>{{ getImageReplicaSize(scope.row) }} 个</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        width="230"
      >
        <template slot-scope="scope">
          <el-button size="mini" @click="handleView(scope.row)">详情</el-button>
          <el-button size="mini" type="success" @click="handleUpdateView(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="deleteImage(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      :current-page="pagination.currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      style="margin-top: 20px; text-align: right;"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 创建镜像对话框 -->
    <el-dialog title="创建镜像" :visible.sync="createDialogVisible" width="50%">
      <el-form ref="imageForm" :model="createImage" :rules="rules" label-width="120px">
        <el-form-item label="镜像名称" prop="name">
          <el-input v-model="createImage.name" placeholder="如: user-service" />
        </el-form-item>

        <el-form-item label="所属应用" prop="appName">
          <el-select
            v-model="createImage.appId"
            placeholder="请选择所属应用"
            filterable
            allow-create
            style="width: 100%"
          >
            <el-option
              v-for="app in appList"
              :key="app"
              :label="app.name"
              :value="app.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="createImageFunction">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="更新镜像" :visible.sync="updateDialogVisible" width="50%">
      <el-form ref="imageForm" :model="createImage" :rules="rules" label-width="120px">
        <el-form-item label="镜像名称" prop="name">
          <el-input v-model="currentImage.name" placeholder="如: user-service" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateImage">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 镜像详情对话框 -->
    <el-dialog :title="`镜像详情 - ${currentImage.name}`" :visible.sync="detailDialogVisible" width="60%">
      <el-upload
        class="upload-demo"
        action="http://localhost:8080/api/image/upload-and-build"
        :headers="headers"
        :data="{ imageId: currentImage.id }"
        :on-success="handleSuccess"
        :on-error="handleError"
        :before-upload="beforeUpload"
        :show-file-list="false"
        accept=".jar"
      >
        <el-button type="primary">上传并构建</el-button>
      </el-upload>
      <div v-if="currentImage.imageReplicaList && currentImage.imageReplicaList.length > 0" class="version-list">
        <h4>版本列表:</h4>
        <el-table :data="currentImage.imageReplicaList" border style="width: 100%; margin-top: 10px;">
          <el-table-column prop="tag" label="版本号" width="150">
            <template slot-scope="scope">
              <el-tag :type="scope.row.tag === currentImage.latestTag ? 'success' : ''">
                {{ scope.row.tag }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="url" label="镜像地址">
            <template slot-scope="scope">
              {{ scope.row.url }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180">
            <template slot-scope="scope">
              {{ formatDate(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="size" label="大小" width="120">
            <template slot-scope="scope">
              {{ formatSize(scope.row.size) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" @click="deleteImageReplica(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { listImage, createImage, updateImage, deleteImage, uploadImage, deleteImageReplica } from '@/api/image/image'
import { listApp } from '@/api/app/app'
export default {
  data() {
    return {
      images: [], // 所有镜像数据
      filteredImages: [], // 过滤后的镜像数据
      currentImage: {}, // 当前查看的镜像
      newImage: { // 新建镜像表单
        name: '',
        appName: '',
        repository: '',
        initialVersion: 'v1.0.0',
        description: ''
      },
      // appList: ['用户服务', '订单服务', '支付服务', '库存服务', '商品服务'], // 应用列表
      searchQuery: '', // 搜索关键词
      loading: false, // 加载状态
      createDialogVisible: false, // 创建对话框显示状态
      updateDialogVisible: false,
      detailDialogVisible: false, // 详情对话框显示状态
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      rules: {
        name: [
          { required: true, message: '请输入镜像名称', trigger: 'blur' },
          { pattern: /^[a-z0-9-]+$/, message: '只能包含小写字母、数字和横线', trigger: 'blur' }
        ],
        appName: [
          { required: true, message: '请选择或输入所属应用', trigger: 'blur' }
        ],
        repository: [
          { required: true, message: '请输入仓库地址', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9.\/-]+$/, message: '包含非法字符', trigger: 'blur' }
        ],
        initialVersion: [
          { required: true, message: '请输入初始版本', trigger: 'blur' },
          { pattern: /^v?\d+(\.\d+){0,2}(-[a-z0-9]+)?$/, message: '版本号格式不正确，如: v1.0.0 或 1.0.0', trigger: 'blur' }
        ]
      },
      imageList: [],
      currentImage: {},
      currentImageId: null,
      currentImageReplicaId: null,
      currentImageReplicaList: [],
      currentAppId: null,
      file: null,
      appList: [],
      createImage: {},
      headers: {
        'Authorization': 'Bearer ' + this.$store.state.user.token
      }
    }
  },
  created() {
    this.fetchImages()
    this.listApp()
    this.listImage()
  },
  methods: {
    beforeUpload(file) {
      // 文件校验逻辑
      // const isAllowedType = ['application/jar'].includes(file.type)

      // if (!isAllowedType) {
      //   this.$message.error('只能上传 jar 格式文件!')
      //   return false
      // }

      return true
    },
    handleSuccess(response, file) {
      this.$message.success('上传并构建成功!')
      this.listImage()
      this.detailDialogVisible = false
    },
    handleError(err) {
      this.$message.error('上传过程中出错: ' + (err.message || '未知错误'))
    },
    getImageReplicaSize(image) {
      if (image.imageReplica) { return image.imageReplica.length } else {
        return 0
      }
    },
    listApp() {
      listApp().then(response => {
        this.appList = response.data

        // 在这里处理返回的数据
      })
        .catch(error => {
          console.error('Error fetching cluster resources:', error)
        // 在这里处理错误
        })
    },
    listImage() {
      listImage().then(response => {
        this.imageList = response.data

        // 在这里处理返回的数据
      })
        .catch(error => {
          console.error('Error fetching cluster resources:', error)
        // 在这里处理错误
        })
    },
    createImageFunction() {
      createImage(this.createImage).then(response => {
        this.createDialogVisible = false
        this.listImage()
        this.createImage = {}
        // 在这里处理返回的数据
      })
        .catch(error => {
          console.error('Error fetching cluster resources:', error)
        // 在这里处理错误
        })
    },
    updateImage() {
      updateImage(this.currentImage).then(response => {
        this.updateDialogVisible = false
        this.listImage()
        this.currentImage = {}
        // 在这里处理返回的数据
      })
        .catch(error => {
          console.error('Error fetching cluster resources:', error)
        // 在这里处理错误
        })
    },
    deleteImage(image) {
      deleteImage(image.id).then(response => {
        this.listImage()
        // 在这里处理返回的数据
      })
        .catch(error => {
          console.error('Error fetching cluster resources:', error)
        // 在这里处理错误
        })
    },
    deleteImageReplica(imageReplica) {
      deleteImageReplica(imageReplica.id).then(response => {
        this.listImage()
        this.detailDialogVisible = false
        // 在这里处理返回的数据
      })
        .catch(error => {
          console.error('Error fetching cluster resources:', error)
        // 在这里处理错误
        })
    },
    uploadImage() {
      // 1. 检查文件是否已选择
      if (!this.file) {
        this.$message.error('请先选择要上传的文件')
        return
      }

      // 2. 检查currentImageId是否有效
      if (!this.currentImageId) {
        this.$message.error('请提供有效的图片ID')
        return
      }

      // 3. 显示加载状态
      const loading = this.$loading({
        lock: true,
        text: '文件上传中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      // 4. 调用上传API
      uploadImage(this.file, this.currentImageId)
        .then(response => {
          loading.close()
          this.$message.success(response.message || '文件上传成功')
        })
        .catch(error => {
          loading.close()
          this.$message.error(error.message || '文件上传失败')
          console.error('文件上传失败:', error)
        })
    },
    // 获取镜像列表
    async fetchImages() {
      this.loading = true
      try {
        // 这里替换为实际的API调用
        // const response = await this.$http.get('/api/images', {
        //   params: {
        //     page: this.pagination.currentPage,
        //     size: this.pagination.pageSize,
        //     search: this.searchQuery
        //   }
        // })
        // this.images = response.data.items
        // this.filteredImages = this.images
        // this.pagination.total = response.data.total

        // 模拟数据
        this.images = [
          {
            id: 'img-001',
            name: 'user-service',
            appName: '用户服务',
            repository: 'registry.example.com/group',
            fullName: 'registry.example.com/group/user-service',
            latestVersion: 'v1.2.3',
            latestVersionTime: '2023-06-20T10:30:00Z',
            versionCount: 5,
            size: 256000000,
            description: '用户服务镜像',
            createdAt: '2023-01-15T09:00:00Z',
            updatedAt: '2023-06-20T10:30:00Z',
            versions: [
              { version: 'v1.2.3', time: '2023-06-20T10:30:00Z', size: 256000000, author: '张三' },
              { version: 'v1.2.2', time: '2023-05-18T14:15:00Z', size: 255000000, author: '张三' },
              { version: 'v1.2.1', time: '2023-04-10T11:20:00Z', size: 254000000, author: '李四' },
              { version: 'v1.2.0', time: '2023-03-05T16:45:00Z', size: 253000000, author: '李四' },
              { version: 'v1.1.0', time: '2023-01-15T09:00:00Z', size: 250000000, author: '王五' }
            ]
          },
          {
            id: 'img-002',
            name: 'order-service',
            appName: '订单服务',
            repository: 'registry.example.com/group',
            fullName: 'registry.example.com/group/order-service',
            latestVersion: 'v1.5.0',
            latestVersionTime: '2023-06-18T14:20:00Z',
            versionCount: 3,
            size: 320000000,
            description: '订单服务镜像',
            createdAt: '2023-02-10T10:15:00Z',
            updatedAt: '2023-06-18T14:20:00Z',
            versions: [
              { version: 'v1.5.0', time: '2023-06-18T14:20:00Z', size: 320000000, author: '李四' },
              { version: 'v1.4.0', time: '2023-05-12T09:30:00Z', size: 315000000, author: '李四' },
              { version: 'v1.3.0', time: '2023-02-10T10:15:00Z', size: 310000000, author: '赵六' }
            ]
          },
          {
            id: 'img-003',
            name: 'payment-service',
            appName: '支付服务',
            repository: 'registry.example.com/team',
            fullName: 'registry.example.com/team/payment-service',
            latestVersion: 'v2.0.1',
            latestVersionTime: '2023-06-15T16:45:00Z',
            versionCount: 7,
            size: 280000000,
            description: '支付服务镜像',
            createdAt: '2023-01-20T13:10:00Z',
            updatedAt: '2023-06-15T16:45:00Z',
            versions: [
              { version: 'v2.0.1', time: '2023-06-15T16:45:00Z', size: 280000000, author: '王五' },
              { version: 'v2.0.0', time: '2023-05-28T11:20:00Z', size: 278000000, author: '王五' },
              { version: 'v1.2.3', time: '2023-04-15T14:30:00Z', size: 260000000, author: '张三' },
              { version: 'v1.2.2', time: '2023-03-22T10:15:00Z', size: 258000000, author: '张三' },
              { version: 'v1.2.1', time: '2023-02-18T09:45:00Z', size: 257000000, author: '李四' },
              { version: 'v1.2.0', time: '2023-02-05T16:30:00Z', size: 255000000, author: '李四' },
              { version: 'v1.1.0', time: '2023-01-20T13:10:00Z', size: 250000000, author: '赵六' }
            ]
          }
        ]
        this.filteredImages = this.images
        this.pagination.total = this.images.length
      } catch (error) {
        this.$message.error('获取镜像列表失败')
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    // 处理搜索
    handleSearch() {
      if (!this.searchQuery.trim()) {
        this.filteredImages = this.images
        return
      }
      const query = this.searchQuery.toLowerCase()
      this.filteredImages = this.images.filter(image =>
        image.name.toLowerCase().includes(query) ||
        image.appName.toLowerCase().includes(query)
      )
    },

    // 清除搜索
    handleSearchClear() {
      this.searchQuery = ''
      this.filteredImages = this.images
    },

    // 显示创建对话框
    showCreateDialog() {
      this.createDialogVisible = true
      this.$nextTick(() => {
        this.$refs.imageForm && this.$refs.imageForm.clearValidate()
      })
    },

    // 提交镜像表单
    submitImageForm() {
      this.$refs.imageForm.validate(async(valid) => {
        if (!valid) return

        try {
          // 这里替换为实际的API调用
          // const response = await this.$http.post('/api/images', this.newImage)

          // 模拟创建
          const newImage = {
            id: `img-${Math.random().toString(36).substr(2, 8)}`,
            name: this.newImage.name,
            appName: this.newImage.appName,
            repository: this.newImage.repository,
            fullName: `${this.newImage.repository}/${this.newImage.name}`,
            latestVersion: this.newImage.initialVersion,
            latestVersionTime: new Date().toISOString(),
            versionCount: 1,
            size: 0,
            description: this.newImage.description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            versions: [
              {
                version: this.newImage.initialVersion,
                time: new Date().toISOString(),
                size: 0,
                author: '当前用户'
              }
            ]
          }

          this.images.unshift(newImage)
          this.filteredImages = [...this.images]
          this.pagination.total += 1

          // 如果应用列表中不存在，则添加到应用列表
          if (!this.appList.includes(this.newImage.appName)) {
            this.appList.push(this.newImage.appName)
          }

          this.$message.success('镜像创建成功')
          this.createDialogVisible = false
          this.newImage = {
            name: '',
            appName: '',
            repository: '',
            initialVersion: 'v1.0.0',
            description: ''
          }
        } catch (error) {
          this.$message.error('创建镜像失败')
          console.error(error)
        }
      })
    },

    // 查看镜像详情
    handleView(image) {
      this.currentImage = image

      this.detailDialogVisible = true
    },
    handleUpdateView(image) {
      this.currentImage = image

      this.updateDialogVisible = true
    },

    // 确认删除镜像
    confirmDelete(image) {
      this.$confirm(`确定要删除镜像 "${image.name}" 及其所有版本吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteImage(image.id)
      }).catch(() => {})
    },

    // 删除镜像

    // 确认删除版本
    confirmDeleteVersion(version) {
      this.$confirm(`确定要删除版本 "${version.version}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteVersion(version.version)
      }).catch(() => {})
    },

    // 删除版本
    async deleteVersion(version) {
      try {
        // await this.$http.delete(`/api/images/${this.currentImage.id}/versions/${version}`)

        // 模拟删除版本
        const imageIndex = this.images.findIndex(i => i.id === this.currentImage.id)
        if (imageIndex !== -1) {
          const versionIndex = this.images[imageIndex].versions.findIndex(v => v.version === version)
          if (versionIndex !== -1) {
            this.images[imageIndex].versions.splice(versionIndex, 1)
            this.images[imageIndex].versionCount -= 1

            // 如果删除的是最新版本，需要更新最新版本信息
            if (version === this.images[imageIndex].latestVersion) {
              if (this.images[imageIndex].versions.length > 0) {
                const latest = this.images[imageIndex].versions.reduce((prev, current) =>
                  new Date(prev.time) > new Date(current.time) ? prev : current
                )
                this.images[imageIndex].latestVersion = latest.version
                this.images[imageIndex].latestVersionTime = latest.time
              } else {
                this.images[imageIndex].latestVersion = ''
                this.images[imageIndex].latestVersionTime = ''
              }
            }

            this.filteredImages = [...this.images]
            this.currentImage = { ...this.images[imageIndex] }
          }
        }

        this.$message.success('版本删除成功')
      } catch (error) {
        this.$message.error('版本删除失败')
        console.error(error)
      }
    },

    // 分页大小变化
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.fetchImages()
    },

    // 当前页变化
    handleCurrentChange(page) {
      this.pagination.currentPage = page
      this.fetchImages()
    },

    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },

    // 格式化大小
    formatSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'] // 添加了TB单位
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.image-repository {
  padding: 20px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.name-wrapper {
  display: flex;
  align-items: center;
}

.latest-version {
  display: flex;
  align-items: center;
}

.version-date {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.version-list {
  margin-top: 20px;
}

.el-table {
  margin-top: 20px;
}

.el-pagination {
  margin-top: 20px;
}
</style>
