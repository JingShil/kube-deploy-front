import request from '@/utils/request'

export function listPods(params) {
  return request({
    url: '/api/v1/pods',
    method: 'get',
    params
  })
}

export function listNamespaces() {
  return request({
    url: '/api/v1/namespaces',
    method: 'get'
  })
}

export function listPod(namespace) {
  return request({
    url: '/api/k8s/pod/list',
    method: 'get',
    params: { namespace }
  })
}

export function createPod(podRequest) {
  return request({
    url: '/api/k8s/pod/create',
    method: 'post',
    data: podRequest
  })
}

export function deletePod(namespace, name) {
  return request({
    url: '/api/k8s/pod/delete',
    method: 'delete',
    params: {
      'namespace': namespace,
      'name': name
    }
  })
}

export function listInstancePod(namespace, deploymentName) {
  return request({
    url: '/api/k8s/pod/instance/list',
    method: 'get',
    params: {
      'namespace': namespace,
      'name': deploymentName
    }
  })
}
