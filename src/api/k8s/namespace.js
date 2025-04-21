import request from '@/utils/request'

export function listNamespace() {
  return request({
    url: '/api/k8s/namespace/list',
    method: 'get'
  })
}

export function createNamespace(namespaceRequest) {
  return request({
    url: '/api/k8s/namespace/create',
    method: 'post',
    data: namespaceRequest
  })
}

// export function updateNamespace(namespaceRequest) {
//   return request({
//     url: '/api/k8s/namespace/update',
//     method: 'post',
//     data: namespaceRequest
//   })
// }
export function deleteNamespace(name) {
  return request({
    url: '/api/k8s/namespace/delete',
    method: 'delete',
    params: { name }
  })
}
