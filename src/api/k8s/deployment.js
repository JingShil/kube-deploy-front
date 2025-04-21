import request from '@/utils/request'

export function listDeployment(namespace) {
  return request({
    url: '/api/k8s/deployment/list',
    method: 'get',
    params: { namespace }
  })
}

export function createDeployment(deploymentRequest) {
  return request({
    url: '/api/k8s/deployment/create',
    method: 'post',
    data: deploymentRequest
  })
}

export function updateDeployment(deploymentRequest) {
  return request({
    url: '/api/k8s/deployment/update',
    method: 'post',
    data: deploymentRequest
  })
}

export function deleteDeployment(namespace, name) {
  return request({
    url: '/api/k8s/deployment/delete',
    method: 'delete',
    params: {
      'namespace': namespace,
      'name': name
    }
  })
}
