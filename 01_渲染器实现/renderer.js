const h = (tag, props, children) => {
  return {
    tag,
    props,
    children
  }
}

const mount = (vnode, container) => {
  const el = vnode.el = document.createElement(vnode.tag);

  // 处理 props
  if (vnode.props) {
    for (const key in vnode.props) {
      const value = vnode.props[key];

      if (key.startsWith('on')) {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        el.setAttribute(key, value);
      }
    }
  }

  // 处理 children
  if (vnode.children) {
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children;
    } else {
      vnode.children.forEach(item => {
        mount(item, el);
      });
    }
  }

  // 将 el 挂载到 container 上
  container.appendChild(el);
}

const patch = (n1, n2) => {
  if (n1.tag !== n2.tag) {
    const n1ElParent = n1.el.parentElement;
    n1ElParent.removeChild(n1.el);
    mount(n2, n1ElParent);
  } else {
    const el = n2.el = n1.el;

    // 处理 props
    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    // 将所有的 newprops 添加到 el
    for (const key in newProps) {
      const oldValue = oldProps[key];
      const newValue = newProps[key];
      if (oldValue !== newValue) {
        if (key.startsWith('on')) {
          el.addEventListener(key.slice(2).toLowerCase(), newValue);
        } else {
          el.setAttribute(key, newValue);
        }
      }
    }

    // 删除旧的 props
    for (const key in oldProps) {
      if (!(key in newProps)) {
        const value = oldProps[key];
        if (key.startsWith('on')) {
          el.removeEventListener(key.slice(2).toLowerCase(), value);
        } else {
          el.removeAttribute(key);
        }
      }
    }

    // 处理 children
    const oldChildren = n1.children || [];
    const newChildren = n2.children || [];

    if (typeof newChildren === 'string') { // 情况一，newChildren 本身是一个 string
      if (typeof oldChildren === 'string') {
        if (newChildren !== oldChildren) {
          el.textContent = newChildren;
        }
      } else {
        el.innerHTML = newChildren;
      }
    } else { // 情况二，newChildren 本身是一个 array
      if (typeof oldChildren === 'string') {
        el.innerHtml = '';
        newChildren.forEach(item => {
          mount(item, el);
        });
      } else {
        const commonLength = Math.min(oldChildren.length, newChildren.length);

        for (let i = 0; i < commonLength; i++) {
          patch(oldChildren[i], newChildren[i]);
        }

        if (newChildren.length > oldChildren.length) {
          newChildren.slice(oldChildren.length).forEach(item => {
            mount(item, el);
          });
        }

        if (newChildren.length < oldChildren.length) {
          oldChildren.slice(newChildren.length).forEach(item => {
            el.removeChild(item.el);
          });
        }
      }
    }
  }
}
