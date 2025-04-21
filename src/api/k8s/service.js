import request from '@/utils/request'

export function listService(namespace) {
  return request({
    url: '/api/k8s/service/list',
    method: 'get',
    params: { namespace }
  })
}

export function createService(serviceRequest) {
  return request({
    url: '/api/k8s/service/create',
    method: 'post',
    data: serviceRequest
  })
}

export function deleteService(namespace, name) {
  return request({
    url: '/api/k8s/service/delete',
    method: 'delete',
    params: {
      'namespace': namespace,
      'name': name
    }
  })
}
