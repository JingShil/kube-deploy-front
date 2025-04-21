import request from '@/utils/request'

export function bindCluster(cluster) {
  return request({
    url: '/api/k8s/cluster/bind',
    method: 'post',
    data: cluster
  })
}

export function unbindCluster(id) {
  return request({
    url: '/api/k8s/cluster/unbind',
    method: 'delete',
    params: { id }
  })
}

export function resourceCluster() {
  return request({
    url: '/api/k8s/cluster/resource',
    method: 'get'
  })
}

