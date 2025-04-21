import request from '@/utils/request'

export function listPermission() {
  return request({
    url: '/api/permission/list',
    method: 'get'

  })
}

export function updatePermission(permission) {
  return request({
    url: '/api/permission/update',
    method: 'get',
    data: permission
  })
}

export function createPermission(permission) {
  return request({
    url: '/api/permission/create',
    method: 'get',
    data: permission
  })
}

export function deletePermission(id) {
  return request({
    url: '/api/permission/delete',
    method: 'delete',
    params: { id }
  })
}
