import request from '@/utils/request'

export function listRolePermission() {
  return request({
    url: '/api/permission/role/list',
    method: 'get'

  })
}

export function updateRolePermission(roleResponse) {
  return request({
    url: '/api/permission/role/update',
    method: 'get',
    data: roleResponse
  })
}

export function createRolePermission(roleResponse) {
  return request({
    url: '/api/permission/role/create',
    method: 'get',
    data: roleResponse
  })
}

export function deleteRolePermission(id) {
  return request({
    url: '/api/permission/role/delete',
    method: 'delete',
    params: { id }
  })
}
