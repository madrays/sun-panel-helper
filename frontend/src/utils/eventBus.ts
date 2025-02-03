import mitt from 'mitt'

type Events = {
  'fixed:widget-removed': string // 传递被移除组件的 url
  'fixed:widget-added': string // 传递被添加组件的 url
}

export const eventBus = mitt<Events>() 