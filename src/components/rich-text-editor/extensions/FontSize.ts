
import { Mark, mergeAttributes } from '@tiptap/core';

const FontSize = Mark.create({
  name: 'fontSize',
  
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: element => element.style.fontSize,
        renderHTML: attributes => {
          if (!attributes.size) return {}
          return {
            style: `font-size: ${attributes.size}`
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        style: 'font-size',
        getAttrs: value => {
          return {
            size: value
          }
        }
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0]
  },

  priority: 500
});

export default FontSize;
