import catalog from './index.json'

export { default as catalog } from './index.json'
export { default as common } from './common.json'

export function screenByRoute(route) {
  return catalog.screens.find((s) => s.route === route) || null
}

export function screenById(id) {
  return catalog.screens.find((s) => s.id === id) || null
}
