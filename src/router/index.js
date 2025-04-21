import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        component: () => import('@/views/home/index'),
        name: 'Home',
        meta: { title: '首页', icon: 'el-icon-s-home', affix: true }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: 'profile', icon: 'user', noCache: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/k8s',
    component: Layout,
    redirect: '/k8s/cluster',
    alwaysShow: true, // will always show the root menu
    name: 'ClusterManage',
    meta: {
      title: '集群管理',
      icon: 'el-icon-s-platform',
      requiresCluster: true
    },
    children: [
      {
        path: 'cluster/unbind',
        component: () => import('@/views/k8s/ClusterUnbound.vue'),
        name: 'K8sClusterUnbind',
        hidden: true,
        meta: {
          title: '未绑定集群'
        }
      },
      {
        path: 'cluster/bind',
        component: () => import('@/views/k8s/BindCluster.vue'),
        name: 'K8sClusterBind',
        hidden: true,
        meta: {
          title: '绑定集群'
        }
      },
      {
        path: 'cluster',
        component: () => import('@/views/k8s/cluster'),
        name: 'K8sCluster',
        meta: {
          title: '集群概述'
        }
      },
      {
        path: 'component',
        component: () => import('@/views/k8s/components/index'), // Parent router-view
        name: '组件管理',
        meta: { title: '组件管理' },
        redirect: '/k8s/components/node',
        children: [
          {
            path: 'node',
            component: () => import('@/views/k8s/components/node'),
            name: 'Node',
            meta: { title: 'Node' }
          },
          {
            path: 'namespace',
            component: () => import('@/views/k8s/components/namespace'),
            name: 'Namespace',
            meta: { title: 'Namespace' }
          },
          {
            path: 'deployment',
            component: () => import('@/views/k8s/components/deployment'),
            name: 'Deployment',
            meta: { title: 'Deployment' }
          },
          {
            path: 'pod',
            component: () => import('@/views/k8s/components/pod'),
            name: 'Pod',
            meta: { title: 'Pod' }
          },
          {
            path: 'service',
            component: () => import('@/views/k8s/components/service'),
            name: 'Service',
            meta: { title: 'Service' }
          }
        ]

      }
    ]
  },
  {
    path: '/app',
    component: Layout,
    redirect: '/app/application',
    alwaysShow: true, // will always show the root menu
    name: 'Application',
    meta: {
      title: '应用管理',
      icon: 'el-icon-menu',
      requiresCluster: true
    },
    children: [
      {
        path: 'application',
        component: () => import('@/views/app/application'),
        name: 'Application',
        meta: {
          title: '应用管理'
        }
      },
      {
        path: 'instance',
        component: () => import('@/views/app/instance'),
        name: 'ApplicationInstance',
        meta: {
          title: '应用实例管理'
          // if do not set roles, means: this page does not require permission
        }
      },
      {
        path: 'deploy',
        component: () => import('@/views/app/deploy'),
        hidden: true,
        name: 'ApplicationInstanceDeploy',
        meta: {
          title: '应用实例部署'
          // if do not set roles, means: this page does not require permission
        }
      },
      {
        path: 'ops',
        component: () => import('@/views/app/ops.vue'),
        hidden: true,
        name: 'ApplicationInstanceOps',
        meta: {
          title: '应用实例运维'
          // if do not set roles, means: this page does not require permission
        }
      },
      {
        path: 'image',
        component: () => import('@/views/app/image'),
        name: 'ApplicationImage',
        meta: {
          title: '镜像管理'
          // if do not set roles, means: this page does not require permission
        }
      },
      {
        path: '/app/instance/create',
        component: () => import('@/views/app/create-instance/MainFrame.vue'),
        hidden: true,
        name: '创建应用实例',
        meta: { title: '创建应用实例' }
      },
      {
        path: '/app/instance/update',
        component: () => import('@/views/app/create-instance/MainFrame.vue'),
        hidden: true,
        name: '更新应用实例',
        meta: { title: '更新应用实例' }
      },
      // {
      //   path: '/app/instance/create',
      //   component: () => import('@/views/app/create-instance/InstanceCreate.vue'),
      //   redirect: '/app/instance/create/basic',
      //   hidden: true, // 如果不想在侧边栏显示
      //   meta: { title: '创建应用', icon: 'form' },
      //   children: [
      //     {
      //       path: 'basic',
      //       component: () => import('@/views/app/create-instance/AppCreateBasic.vue'),
      //       name: 'CreateAppBasic',
      //       meta: { title: '基础信息', activeMenu: '/create-app' }
      //     },
      //     {
      //       path: 'deployment',
      //       component: () => import('@/views/app/create-instance/AppCreateDeployment.vue'),
      //       name: 'CreateAppDeployment',
      //       meta: { title: 'Deployment配置', activeMenu: '/create-app' },
      //       hidden: true
      //     },
      //     {
      //       path: 'service',
      //       component: () => import('@/views/app/create-instance/AppCreateService.vue'),
      //       name: 'CreateAppService',
      //       meta: { title: 'Service配置', activeMenu: '/create-app' },
      //       hidden: true
      //     }
      //   ]
      // },
      {
        path: '/app/instance/detail',
        component: () => import('@/views/app/detail-instance/AppDetail.vue'),
        name: '应用实例详情',
        hidden: true, // 如果不想在侧边栏显示
        meta: {
          title: '应用实例详情'
          // if do not set roles, means: this page does not require permission
        }
      }
    ]
  },
  {
    path: '/permission',
    component: Layout,
    redirect: '/permission/describe',
    alwaysShow: true, // will always show the root menu
    name: 'ClusterManage',
    meta: {
      title: '权限管理',
      icon: 'peoples'
    },
    children: [
      {
        path: 'describe',
        component: () => import('@/views/permission/describe'),
        name: 'DirectivePermission',
        meta: {
          title: '权限说明'
          // if do not set roles, means: this page does not require permission
        }
      },
      {
        path: 'role',
        component: () => import('@/views/permission/index'),
        name: 'PagePermission',
        meta: {
          title: '角色权限'
        }
      }

    ]
  },
  {
    path: '/operation-log',
    component: Layout,
    children: [
      {
        path: 'operation-log',
        component: () => import('@/views/operation-log/index'),
        name: '操作日志',
        meta: { title: '操作日志', icon: 'form', noCache: true }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
