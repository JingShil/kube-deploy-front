import request from '@/utils/request'

export function login(userRequest) {
  return request({
    url: '/api/user/login',
    method: 'post',
    data: userRequest
  })
}

export function register(userRequest) {
  return request({
    url: '/api/user/register',
    method: 'post',
    data: userRequest
  })
}

export function updateUser(userRequest) {
  return request({
    url: '/api/user/update',
    method: 'post',
    data: userRequest
  })
}

export function existEmail(email) {
  return request({
    url: '/api/user/exist/email',
    method: 'get',
    params: email
  })
}

export function existUsername(username) {
  return request({
    url: '/api/user/exist/username',
    method: 'get',
    params: username
  })
}

export function getInfo(token) {
  return request({
    url: '/api/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/vue-element-admin/user/logout',
    method: 'post'
  })
}
