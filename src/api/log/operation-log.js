import request from '@/utils/request'

export function listOperationLog() {
  return request({
    url: '/api/log/operation/list',
    method: 'get'
  })
}
