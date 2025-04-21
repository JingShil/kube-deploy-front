import request from '@/utils/request'

export function listUserRolePermission() {
  return request({
    url: '/api/permission/user/list',
    method: 'get'

  })
}

export function updateUserRolePermission(username, roleId) {
  return request({
    url: '/api/permission/user/update',
    method: 'post',
    params: {
      'username': username,
      'roleId': roleId
    }
  })
}
