import request from '@/utils/request'

export function listNode() {
  return request({
    url: '/api/k8s/node/list',
    method: 'get'
  })
}

