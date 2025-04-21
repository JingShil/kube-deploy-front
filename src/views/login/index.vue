<template>
  <div class="login-register-container">
    <div class="background-animation" />
    <div class="form-container">
      <div class="form-switch">
        <div
          class="switch-btn"
          :class="{ active: isLogin }"
          @click="switchForm('login')"
        >
          登录
        </div>
        <div
          class="switch-btn"
          :class="{ active: !isLogin }"
          @click="switchForm('register')"
        >
          注册
        </div>
      </div>

      <transition name="fade" mode="out-in">
        <div v-if="isLogin" key="login" class="form-content">
          <h2 class="form-title">欢迎回来</h2>
          <p class="form-subtitle">请登录您的账户</p>

          <el-form
            ref="loginForm"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                prefix-icon="el-icon-user"
                placeholder="用户名"
                class="custom-input"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                prefix-icon="el-icon-lock"
                placeholder="密码"
                type="password"
                class="custom-input"
              />
            </el-form-item>

            <div class="form-options">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <a href="#" class="forgot-password">忘记密码?</a>
            </div>

            <el-button
              type="primary"
              class="submit-btn"
              :loading="loginLoading"
              @click="submitLogin"
            >
              登录
            </el-button>

            <div class="social-login">
              <p class="divider"><span>或通过以下方式登录</span></p>
              <div class="social-icons">
                <el-button circle class="social-icon">
                  <i class="el-icon-mobile-phone" />
                </el-button>
                <el-button circle class="social-icon">
                  <i class="el-icon-chat-dot-round" />
                </el-button>
                <el-button circle class="social-icon">
                  <i class="el-icon-star-off" />
                </el-button>
              </div>
            </div>
          </el-form>
        </div>

        <div v-else key="register" class="form-content">
          <h2 class="form-title">创建账户</h2>
          <p class="form-subtitle">加入我们，开启旅程</p>

          <el-form
            ref="registerForm"
            :model="registerForm"
            :rules="registerRules"
            class="register-form"
          >
            <el-form-item prop="email">
              <el-input
                v-model="registerForm.email"
                prefix-icon="el-icon-message"
                placeholder="邮箱"
                class="custom-input"
              />
            </el-form-item>

            <el-form-item prop="username">
              <el-input
                v-model="registerForm.username"
                prefix-icon="el-icon-user"
                placeholder="用户名"
                class="custom-input"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                prefix-icon="el-icon-lock"
                placeholder="密码"
                type="password"
                class="custom-input"
                show-password
              />
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                prefix-icon="el-icon-lock"
                placeholder="确认密码"
                type="password"
                class="custom-input"
                show-password
              />
            </el-form-item>

            <el-button
              type="primary"
              class="submit-btn"
              :loading="registerLoading"
              @click="submitRegister"
            >
              注册
            </el-button>

            <div class="terms">
              点击"注册"即表示您同意我们的
              <a href="#">服务条款</a>和
              <a href="#">隐私政策</a>
            </div>
          </el-form>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { login, register } from '@/api/user/user'

export default {
  name: 'LoginRegister',
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }

    return {
      isLogin: true,
      rememberMe: false,
      loginLoading: false,
      registerLoading: false,
      loginForm: {
        username: '',
        password: ''
      },
      registerForm: {
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      },
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ]
      },
      registerRules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validatePassword, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    switchForm(type) {
      this.isLogin = type === 'login'
    },
    submitLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    submitRegister() {
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          this.registerLoading = true
          // 模拟注册请求
          setTimeout(() => {
            this.registerLoading = false
            this.$message.success('注册成功')
            this.isLogin = true // 注册成功后切换到登录表单
          }, 1500)
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.login-register-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
}

.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
  z-index: 0;
  animation: gradientBG 15s ease infinite;
  background-size: 400% 400%;
}

@keyframes gradientBG {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.form-container {
  width: 420px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
  z-index: 1;
  position: relative;
  overflow: hidden;
}

.form-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #409EFF 0%, #67C23A 100%);
}

.form-switch {
  display: flex;
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f7fa;
  position: relative;
}

.form-switch::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  transform: translateX(0);
}

.form-switch::after {
  transform: translateX(var(--switch-position));
}

.switch-btn {
  flex: 1;
  text-align: center;
  padding: 12px;
  cursor: pointer;
  font-weight: 500;
  color: #606266;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.switch-btn.active {
  color: #409EFF;
  font-weight: 600;
}

.form-content {
  transition: all 0.3s ease;
}

.form-title {
  font-size: 24px;
  color: #303133;
  margin-bottom: 8px;
  text-align: center;
  font-weight: 600;
}

.form-subtitle {
  font-size: 14px;
  color: #909399;
  text-align: center;
  margin-bottom: 30px;
}

.custom-input {
  margin-bottom: 20px;
}

.custom-input >>> .el-input__inner {
  border-radius: 8px;
  height: 48px;
  padding-left: 40px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
}

.custom-input >>> .el-input__inner:focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.custom-input >>> .el-input__prefix {
  left: 10px;
  display: flex;
  align-items: center;
}

.custom-input >>> .el-input__prefix i {
  font-size: 18px;
  color: #c0c4cc;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.forgot-password {
  font-size: 14px;
  color: #909399;
  text-decoration: none;
}

.forgot-password:hover {
  color: #409EFF;
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
  background: linear-gradient(90deg, #409EFF 0%, #64b5ff 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

.social-login {
  margin-top: 30px;
}

.divider {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 14px;
  margin-bottom: 20px;
}

.divider::before, .divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #dcdfe6;
}

.divider::before {
  margin-right: 15px;
}

.divider::after {
  margin-left: 15px;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.social-icon {
  width: 48px;
  height: 48px;
  font-size: 20px;
  border: 1px solid #dcdfe6;
  background: white;
  transition: all 0.3s;
}

.social-icon:hover {
  color: white;
  background: #409EFF;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.terms {
  font-size: 12px;
  color: #909399;
  text-align: center;
  margin-top: 20px;
}

.terms a {
  color: #409EFF;
  text-decoration: none;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 动态切换效果 */
.form-switch .switch-btn:nth-child(1).active ~ .form-content {
  --switch-position: 0;
}

.form-switch .switch-btn:nth-child(2).active ~ .form-content {
  --switch-position: 100%;
}
</style>
